"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { insertUserDomainSchema } from "@/db/schemas";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export const updateDomain = async (
  values: z.infer<typeof insertUserDomainSchema>,
  currentDomain: string | null | undefined
) => {
  try {
    const session = await auth();
    const validatedValues = insertUserDomainSchema.safeParse(values);

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { domain } = validatedValues.data;

    if (!domain || !currentDomain) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const deleteResponse = await fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${currentDomain}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorDetails = await deleteResponse.json().catch(() => null);
      console.error("Error delete response from Vercel API:", {
        status: deleteResponse.status,
        statusText: deleteResponse.statusText,
        errorDetails,
      });

      return {
        success: false,
        message: "Falha ao atualizar o domínio",
      };
    }

    const res = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`, // Adiciona teamId se existir
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: domain,
          gitBranch: null,
          customEnvironmentId: "",
          redirect: null,
        }),
      }
    );

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => null);
      console.error("Error response from Vercel API:", {
        status: res.status,
        statusText: res.statusText,
        errorDetails,
      });

      return {
        success: false,
        message: "Falha ao atualizar o domínio",
      };
    }

    const userDomain = await db
      .update(users)
      .set({
        domain,
      })
      .where(eq(users.id, session.user.id));

    if (!userDomain) {
      return {
        success: false,
        message: "Falha ao atualizar o domínio",
      };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Domínio atualizado com sucesso!" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao atualizar seu domínio",
    };
  }
};
