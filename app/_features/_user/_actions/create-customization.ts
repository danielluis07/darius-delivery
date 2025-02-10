"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { customizations } from "@/db/schema";
import { insertCustomizationSchema } from "@/db/schemas";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
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
    const generateFileName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const {
      store_name,
      template_id,
      active,
      banner,
      button_color,
      footer_color,
      header_color,
      logo_desktop,
      logo_mobile,
    } = validatedValues.data;

    if (
      !store_name ||
      !template_id ||
      !active ||
      !banner ||
      !button_color ||
      !footer_color ||
      !header_color ||
      !logo_desktop ||
      !logo_mobile
    ) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    /* Image Upload */

    const bannerFile = banner[0];
    const logoDesktopFile = logo_desktop[0];
    const logoMobileFile = logo_mobile[0];

    if (!bannerFile || !logoDesktopFile || !logoMobileFile) {
      return {
        success: false,
        message: "ALgum dos arquivos de imagem não foi encontrado",
      };
    }

    const [bannerUrl, logoDesktopUrl, logoMobileUrl] = await Promise.all([
      uploadImageToS3(bannerFile),
      uploadImageToS3(logoDesktopFile),
      uploadImageToS3(logoMobileFile),
    ]);

    if (!bannerUrl || !logoDesktopUrl || !logoMobileUrl) {
      return {
        success: false,
        message: "Erro ao fazer upload das imagens",
      };
    }

    const customization = await db.insert(customizations).values({
      store_name,
      template_id,
      active,
      banner: bannerUrl,
      button_color,
      footer_color,
      header_color,
      logo_desktop: logoDesktopUrl,
      logo_mobile: logoMobileUrl,
      user_id: session.user.id,
    });

    if (!customization) {
      return {
        success: false,
        message: "Falha criar a customização",
      };
    }

    return { success: true, message: "Customização criada com sucesso" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao criar a customização",
    };
  }
};
