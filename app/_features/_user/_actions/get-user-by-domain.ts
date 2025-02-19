"use server";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserByDomain = async (domain: string) => {
  try {
    if (!domain) {
      console.warn("getUserByDomain: domínio inválido.");
      return null;
    }

    const [data] = await db
      .select({
        domain: users.domain,
      })
      .from(users)
      .where(eq(users.domain, domain));

    if (!data) {
      console.warn(
        `getUserByDomain: Nenhum usuário encontrado para o domínio "${domain}".`
      );
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Erro ao buscar usuário pelo domínio "${domain}":`, error);
    return null;
  }
};
