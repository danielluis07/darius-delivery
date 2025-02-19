"use server";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserBySubdomain = async (subdomain: string) => {
  try {
    if (!subdomain) {
      console.warn("getUserBySubdomain: subdomain inválido.");
      return null;
    }

    const [data] = await db
      .select({
        subdomain: users.subdomain,
      })
      .from(users)
      .where(eq(users.subdomain, subdomain));

    if (!data) {
      console.warn(
        `getUserBySubdomain: Nenhum usuário encontrado para o subdomínio "${subdomain}".`
      );
      return null;
    }

    return data;
  } catch (error) {
    console.error(
      `Erro ao buscar usuário pelo subdomínio "${subdomain}":`,
      error
    );
    return null;
  }
};
