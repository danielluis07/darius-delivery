"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { insertCategorySchema } from "@/db/schemas";
import { uploadImageToS3 } from "@/lib/s3-upload";

export const createCategory = async (
  values: z.infer<typeof insertCategorySchema>,
  storeId: string
) => {
  try {
    const session = await auth();
    const validatedValues = insertCategorySchema.safeParse(values);

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

    const imageUrl = await uploadImageToS3(imageFile);

    const category = await db.insert(categories).values({
      name,
      image: imageUrl,
      storeId,
    });

    if (!category) {
      return {
        success: false,
        message: "Falha ao criar a categoria",
      };
    }

    return { success: true, message: "Categoria criada com sucesso" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao criar a categoria",
    };
  }
};
