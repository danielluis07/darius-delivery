"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { combos, comboProducts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { updateComboSchema } from "@/db/schemas";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

type UpdatedData = {
  name: string;
  description: string;
  price: number;
  product_ids: string[];
  image?: string | null | undefined;
};

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

export const updateCombo = async (
  values: z.infer<typeof updateComboSchema>
) => {
  try {
    const session = await auth();
    const validatedValues = updateComboSchema.safeParse(values);

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
      id: combo_id,
      name,
      image,
      description,
      price,
      product_ids,
    } = validatedValues.data;

    if (!name || !image || !description || !price || !product_ids) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    /* Image Upload */

    const imageFile = image[0];

    let imageUrl: string | null | undefined;

    if (imageFile && typeof imageFile !== "string") {
      const [existingCategory] = await db
        .select({
          image: combos.image,
        })
        .from(combos)
        .where(and(eq(combos.id, combo_id), eq(combos.userId, id)));

      if (!existingCategory.image) {
        return { success: false, message: "Combo não encontrado" };
      }

      const fileName = existingCategory.image.split("/").pop()!;

      imageUrl = await uploadImageToS3(imageFile);

      const { success } = await deleteFromS3(fileName);

      if (!imageUrl || !success) {
        return { success: false, message: "Erro ao fazer upload da imagem" };
      }
    }

    const updateData: UpdatedData = {
      name: name,
      description: description,
      price: price,
      product_ids: product_ids,
    };

    if (imageUrl !== undefined) updateData.image = imageUrl;

    const deleteComboProducts = await db
      .delete(comboProducts)
      .where(eq(comboProducts.combo_id, combo_id));

    if (!deleteComboProducts) {
      console.error("Erro ao deletar produtos do combo");
      return {
        success: false,
        message: "Falha ao atualizar o combo",
      };
    }

    const [combo] = await db
      .update(combos)
      .set(updateData)
      .where(and(eq(combos.id, combo_id), eq(combos.userId, id)))
      .returning({ id: combos.id });

    if (!combo) {
      return {
        success: false,
        message: "Falha ao atualizar o combo",
      };
    }

    if (product_ids.length > 0) {
      await db.insert(comboProducts).values(
        product_ids.map((product_id) => ({
          combo_id: combo.id,
          product_id,
        }))
      );
    }

    revalidatePath("/dashboard/combos");
    return { success: true, message: "Combo atualizado com sucesso" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao atualizar o combo",
    };
  }
};
