"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { insertProductSchema } from "@/db/schemas";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_KEY!,
  },
});

export const createProduct = async (
  values: z.infer<typeof insertProductSchema>
) => {
  try {
    const session = await auth();
    const validatedValues = insertProductSchema.safeParse(values);
    const generateFileName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { name, image, price, category_id, description } =
      validatedValues.data;

    if (!name || !image || !price || !category_id || !description) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    /* Image Upload */

    const imageFile = image[0];

    if (!imageFile) {
      return {
        success: false,
        message: "Arquivo de imagem não encontrado",
      };
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash("sha256");
    hash.update(buffer);
    const hashHex = hash.digest("hex");

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: generateFileName(),
      ContentType: imageFile.type,
      ContentLength: imageFile.size,
      ChecksumSHA256: hashHex,
      Metadata: {
        userId: session?.user.id,
      },
    });

    const signedURL = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 3600,
    });

    if (!signedURL) {
      return {
        success: false,
        message: "Falha ao criar a URL de upload",
      };
    }

    const res = await fetch(signedURL, {
      method: "PUT",
      body: imageFile,
      headers: {
        "Content-Type": imageFile.type,
      },
    });

    if (!res.ok) {
      return {
        success: false,
        message: "Falha ao realizar o upload da imagem",
      };
    }

    const product = await db.insert(products).values({
      name,
      image: signedURL.split("?")[0],
      price,
      category_id,
      description,
      userId: session.user.id,
    });

    if (!product) {
      return {
        success: false,
        message: "Falha ao criar o produto",
      };
    }

    revalidatePath("/dashboard/products");
    return { success: true, message: "Produto criado com sucesso" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao criar o produto",
    };
  }
};
