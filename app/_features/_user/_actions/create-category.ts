"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { insertCategorySchema } from "@/db/schemas";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export const createCategory = async (
  values: z.infer<typeof insertCategorySchema>
) => {
  try {
    const session = await auth();
    const validatedValues = insertCategorySchema.safeParse(values);
    const generateFileName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { name, image } = validatedValues.data;

    if (!name || !image) {
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

    const category = await db.insert(categories).values({
      name,
      image: signedURL.split("?")[0],
      userId: session.user.id,
    });

    if (!category) {
      return {
        success: false,
        message: "Falha ao criar a categoria",
      };
    }

    revalidatePath("/dashboard/categories");
    return { success: true, message: "Categoria criada com sucesso" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao criar o evento",
    };
  }
};
