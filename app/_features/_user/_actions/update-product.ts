"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { productAdditionalGroups, products } from "@/db/schema";
import { updateProductSchema } from "@/db/schemas";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { deleteFromS3, uploadImageToS3 } from "@/lib/s3-upload";

type UpdatedData = {
  name: string;
  price: number;
  category_id: string;
  description: string;
  allowHalfOption?: boolean;
  sizes: string[] | null | undefined;
  image?: string | null | undefined;
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
      allowHalfOption,
      description,
      sizes,
      additionalGroupIds,
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
      allowHalfOption,
      sizes: sizes,
    };

    if (imageUrl !== undefined) updateData.image = imageUrl;

    const [product] = await db
      .update(products)
      .set(updateData)
      .where(and(eq(products.id, product_id), eq(products.userId, id)))
      .returning({
        id: products.id,
      });

    if (!product) {
      return {
        success: false,
        message: "Falha ao atualizar o produto",
      };
    }

    if (additionalGroupIds && additionalGroupIds.length > 0) {
      const existingRelations = await db
        .select({
          additionalGroupId: productAdditionalGroups.additionalGroupId,
        })
        .from(productAdditionalGroups)
        .where(eq(productAdditionalGroups.productId, product.id));

      const existingIds = existingRelations
        .map((r) => r.additionalGroupId)
        .sort();
      const newIds = [...additionalGroupIds].sort();

      const arraysAreDifferent =
        existingIds.length !== newIds.length ||
        existingIds.some((id, i) => id !== newIds[i]);

      if (arraysAreDifferent) {
        await db
          .delete(productAdditionalGroups)
          .where(eq(productAdditionalGroups.productId, product.id));

        await db.insert(productAdditionalGroups).values(
          additionalGroupIds.map((groupId) => ({
            additionalGroupId: groupId,
            productId: product.id,
          }))
        );
      }
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
