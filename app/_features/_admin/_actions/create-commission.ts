"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { commissions } from "@/db/schema";
import { insertAdminCommissionSchema } from "@/db/schemas";
import { auth } from "@/auth";

export const createComission = async (
  values: z.infer<typeof insertAdminCommissionSchema>
) => {
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const validatedValues = insertAdminCommissionSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { percentage } = validatedValues.data;

    if (!percentage) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const [comission] = await db
      .select({ id: commissions.id })
      .from(commissions)
      .where(eq(commissions.adminId, session.user.id));

    if (comission) {
      const updatedComission = await db
        .update(commissions)
        .set({
          percentage,
        })
        .where(eq(commissions.adminId, session.user.id));

      if (!updatedComission) {
        return {
          success: false,
          message: "Erro ao atualizar a comissão",
        };
      }

      return {
        success: true,
        message: "Comissão atualizada com sucesso!",
      };
    }

    const insertedComission = await db.insert(commissions).values({
      adminId: session.user.id,
      percentage,
    });

    if (!insertedComission) {
      return {
        success: false,
        message: "Erro ao definir a comissão",
      };
    }

    return {
      success: true,
      message: "Comissão definida com sucesso!",
    };
  } catch (error) {
    console.error("Error while creating comission:", error);
    return {
      success: false,
      message: "Erro inesperado ao definir a comissão",
    };
  }
};
