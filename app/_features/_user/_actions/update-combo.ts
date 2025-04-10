"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { combos, comboProducts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { updateComboSchema } from "@/db/schemas";
import { revalidatePath } from "next/cache";
import { deleteFromS3, uploadImageToS3 } from "@/lib/s3-upload";

type UpdatedData = {
  name: string;
  description: string;
  price: number;
  product_ids: string[];
  image?: string | null | undefined;
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
