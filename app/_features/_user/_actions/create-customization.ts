"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { customizations } from "@/db/schema";
import { insertCustomizationSchema } from "@/db/schemas";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { eq } from "drizzle-orm";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const uploadImageToS3 = async (imageFile: File) => {
  if (!imageFile) {
    return null;
  }

  const generateFileName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString("hex");

  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const hash = crypto.createHash("sha256");
  hash.update(buffer);
  const hashHex = hash.digest("hex");

  const fileName = generateFileName();
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    ContentType: imageFile.type,
    ContentLength: imageFile.size,
    ChecksumSHA256: hashHex,
  });

  const signedURL = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 3600,
  });

  const res = await fetch(signedURL, {
    method: "PUT",
    body: imageFile,
    headers: {
      "Content-Type": imageFile.type,
    },
  });

  if (!res.ok) {
    return null;
  }

  return signedURL.split("?")[0];
};

export const createCustomization = async (
  values: z.infer<typeof insertCustomizationSchema>
) => {
  try {
    const session = await auth();
    const validatedValues = insertCustomizationSchema.safeParse(values);

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const {
      id,
      store_name,
      template_id,
      banner,
      button_color,
      footer_color,
      header_color,
      logo,
      payment_methods,
      need_change,
    } = validatedValues.data;

    if (
      !store_name ||
      !template_id ||
      !banner ||
      !button_color ||
      !footer_color ||
      !header_color ||
      !logo ||
      !payment_methods
    ) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    /* Image Upload */

    const bannerFile = banner[0];
    const logoDesktopFile = logo[0];

    if (!bannerFile || !logoDesktopFile) {
      return {
        success: false,
        message: "Algum dos arquivos de imagem não foi encontrado",
      };
    }

    const [bannerUrl, logoDesktopUrl] = await Promise.all([
      uploadImageToS3(bannerFile),
      uploadImageToS3(logoDesktopFile),
    ]);

    if (!bannerUrl || !logoDesktopUrl) {
      return {
        success: false,
        message: "Erro ao fazer upload das imagens",
      };
    }

    if (id) {
      const updatedCustomization = await db
        .update(customizations)
        .set({
          store_name,
          template_id,
          banner: bannerUrl,
          button_color,
          footer_color,
          header_color,
          logo: logoDesktopUrl,
          payment_methods,
          need_change,
        })
        .where(eq(customizations.id, id));

      if (!updatedCustomization) {
        return {
          success: false,
          message: "Falha ao atualizar a customização",
        };
      }

      return { success: true, message: "Customização atualizada com sucesso" };
    } else {
      const customization = await db.insert(customizations).values({
        store_name,
        template_id,
        banner: bannerUrl,
        button_color,
        footer_color,
        header_color,
        logo: logoDesktopUrl,
        payment_methods,
        need_change,
        user_id: session.user.id,
      });

      if (!customization) {
        return {
          success: false,
          message: "Falha criar a customização",
        };
      }

      return { success: true, message: "Customização criada com sucesso" };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao criar a customização",
    };
  }
};
