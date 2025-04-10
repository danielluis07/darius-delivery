"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { updateProductSchema } from "@/db/schemas";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { and, eq } from "drizzle-orm";

type UpdatedData = {
  name: string;
  price: number;
  category_id: string;
  description: string;
  sizes: string[] | null | undefined;
  image?: string | null | undefined;
};

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const uploadImageToS3 = async (imageFile: File) => {
  if (!imageFile) {
    return null;
  }

  const generateFileName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString("hex");

  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const hash = crypto.createHash("sha256");
  hash.update(buffer);
  const hashHex = hash.digest("hex");

  const fileName = generateFileName();
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    ContentType: imageFile.type,
    ContentLength: imageFile.size,
    ChecksumSHA256: hashHex,
  });

  const signedURL = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 3600,
  });

  const res = await fetch(signedURL, {
    method: "PUT",
    body: imageFile,
    headers: {
      "Content-Type": imageFile.type,
    },
  });

  if (!res.ok) {
    return null;
  }

  return signedURL.split("?")[0];
};

const deleteFromS3 = async (fileName: string) => {
  try {
    if (!fileName) {
      throw new Error("Nome do arquivo não informado");
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
    });

    await s3.send(command);

    return {
      success: true,
      message: "Arquivo deletado com sucesso do S3",
    };
  } catch (error) {
    console.error("Erro ao deletar arquivo do S3:", error);
    return {
      success: false,
      message: "Erro ao deletar arquivo do S3",
    };
  }
};

export const updateProduct = async (
  values: z.infer<typeof updateProductSchema>
) => {
  try {
    const session = await auth();
    const validatedValues = updateProductSchema.safeParse(values);

    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    const id =
      session.user.role === "EMPLOYEE"
        ? session.user.restaurantOwnerId
        : session.user.id;

    if (!id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const {
      id: product_id,
      name,
      image,
      price,
      category_id,
      description,
      sizes,
    } = validatedValues.data;

    if (!name || !image || !price || !category_id || !description) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const imageFile = image[0];

    let imageUrl: string | null | undefined;

    if (imageFile && typeof imageFile !== "string") {
      const [existingProduct] = await db
        .select({
          image: products.image,
        })
        .from(products)
        .where(and(eq(products.id, product_id), eq(products.userId, id)));

      if (!existingProduct.image) {
        return { success: false, message: "Produto não encontrado" };
      }

      const fileName = existingProduct.image.split("/").pop()!;

      imageUrl = await uploadImageToS3(imageFile);

      const { success } = await deleteFromS3(fileName);

      if (!imageUrl || !success) {
        return { success: false, message: "Erro ao fazer upload do banner" };
      }
    }

    const updateData: UpdatedData = {
      name,
      price,
      category_id,
      description,
      sizes: sizes,
    };

    if (imageUrl !== undefined) updateData.image = imageUrl;

    const product = await db
      .update(products)
      .set(updateData)
      .where(and(eq(products.id, product_id), eq(products.userId, id)));

    if (!product) {
      return {
        success: false,
        message: "Falha ao atualizar o produto",
      };
    }

    revalidatePath("/dashboard/products");
    return { success: true, message: "Produto atualizado com sucesso" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao atualizar o produto",
    };
  }
};
