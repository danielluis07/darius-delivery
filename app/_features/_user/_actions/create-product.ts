"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { insertProductSchema } from "@/db/schemas";
import { uploadImageToS3 } from "@/lib/s3-upload";

export const createProduct = async (
  values: z.infer<typeof insertProductSchema>,
  storeId: string
) => {
  try {
    const session = await auth();
    const validatedValues = insertProductSchema.safeParse(values);

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
      name,
      image,
      price,
      category_id,
      description,
      sizes,
      allowHalfOption,
    } = validatedValues.data;

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

    const imageUrl = await uploadImageToS3(imageFile);

    if (!imageUrl) {
      return { success: false, message: "Erro ao fazer upload do banner" };
    }

    const [product] = await db
      .insert(products)
      .values({
        name,
        image: imageUrl,
        price,
        sizes: sizes || [],
        category_id,
        description,
        allowHalfOption,
        storeId,
      })
      .returning({
        id: products.id,
      });

    if (!product) {
      return {
        success: false,
        message: "Falha ao criar o produto",
      };
    }

    return { success: true, message: "Produto criado com sucesso" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao criar o produto",
    };
  }
};
