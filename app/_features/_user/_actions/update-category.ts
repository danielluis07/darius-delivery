"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { updateCategorySchema } from "@/db/schemas";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { deleteFromS3, uploadImageToS3 } from "@/lib/s3-upload";

type UpdatedData = {
  name: string;
  image?: string | null | undefined;
};

export const updateCategory = async (
  values: z.infer<typeof updateCategorySchema>
) => {
  try {
    const session = await auth();
    const validatedValues = updateCategorySchema.safeParse(values);

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

    const { id: category_id, name, image } = validatedValues.data;

    if (!name || !image || !category_id) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const imageFile = image[0];

    let imageUrl: string | null | undefined;

    if (imageFile && typeof imageFile !== "string") {
      const [existingCategory] = await db
        .select({
          image: categories.image,
        })
        .from(categories)
        .where(and(eq(categories.id, category_id), eq(categories.userId, id)));

      if (!existingCategory.image) {
        return { success: false, message: "Categoria não encontrada" };
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
    };

    if (imageUrl !== undefined) updateData.image = imageUrl;

    const category = await db
      .update(categories)
      .set(updateData)
      .where(and(eq(categories.id, category_id), eq(categories.userId, id)));

    if (!category) {
      return {
        success: false,
        message: "Falha ao atualizar a categoria",
      };
    }

    revalidatePath("/dashboard/categories");
    return { success: true, message: "Categoria atualizada com sucesso" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao atualizar a categoria",
    };
  }
};
