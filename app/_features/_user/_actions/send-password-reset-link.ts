"use server";

import { EmailTemplate } from "@/components/email-template";
import { db } from "@/db/drizzle";
import { passwordResetToken, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ONE_HOUR_IN_MS = 3600000;

function generateToken(): string {
  const timestamp = Date.now().toString(36); // Base36 time component
  const random = Math.random().toString(36).substring(2, 15); // Random part
  return `${timestamp}-${random}`;
}

export const sendPasswordResetLink = async (
  _prevState: {
    success?: boolean;
    error?: boolean;
    message?: string;
  } | null,
  formData: FormData
) => {
  const destination = formData.get("email") as string;

  try {
    const [existingUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, destination));

    if (
      !existingUser ||
      !existingUser.id ||
      !existingUser.name ||
      !existingUser.email
    ) {
      console.error("User not found:", destination);
      return {
        error: true,
        message: "O email informado não foi encontrado.",
      };
    }

    const tokenString = generateToken();
    const expiresAt = new Date(Date.now() + ONE_HOUR_IN_MS);

    await db
      .delete(passwordResetToken)
      .where(eq(passwordResetToken.email, existingUser.email));

    await db.insert(passwordResetToken).values({
      email: existingUser.email,
      token: tokenString,
      expires: expiresAt,
    });

    const name = existingUser.name;
    const message = `Você solicitou a redefinição de senha. Clique no link abaixo para redefinir sua senha: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${tokenString}`;

    const { data, error } = await resend.emails.send({
      from: "Darius Delivery <onboarding@dariusdelivery.com.br>",
      to: destination,
      subject: "Redefinição de Senha",
      react: EmailTemplate({ name, message }) as React.ReactElement,
    });

    if (error) {
      console.error("Error sending email:", error);
      return {
        error: true,
        message:
          "Ocorreu um erro ao enviar o e-mail. Tente novamente mais tarde.",
      };
    }

    console.log("Email sent successfully:", data);
    return {
      success: true,
      message: "E-mail enviado com sucesso!",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      error: true,
      message:
        "Ocorreu um erro inesperado ao enviar o e-mail. Tente novamente mais tarde.",
    };
  }
};
