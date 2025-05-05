"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { combos, comboProducts } from "@/db/schema";
import { insertComboSchema } from "@/db/schemas";
import { revalidatePath } from "next/cache";
import { uploadImageToS3 } from "@/lib/s3-upload";

export const createCombo = async (
  values: z.infer<typeof insertComboSchema>,
  storeId: string
) => {
  try {
    const session = await auth();
    const validatedValues = insertComboSchema.safeParse(values);

    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { name, image, description, price, product_ids } =
      validatedValues.data;

    if (!name || !image || !description || !price || !product_ids) {
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

    const [combo] = await db
      .insert(combos)
      .values({
        name,
        image: imageUrl,
        storeId,
        description,
        price,
      })
      .returning({ id: combos.id });

    if (!combo) {
      return {
        success: false,
        message: "Falha ao criar o combo",
      };
    }

    await db.insert(comboProducts).values(
      product_ids.map((product_id) => ({
        combo_id: combo.id,
        product_id,
      }))
    );

    revalidatePath("/dashboard/combos");
    return { success: true, message: "Combo criado com sucesso" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao criar o combo",
    };
  }
};
