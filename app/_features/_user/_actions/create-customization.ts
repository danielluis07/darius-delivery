"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { customizations, users } from "@/db/schema";
import { insertCustomizationSchema } from "@/db/schemas";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { formatAddress, getGeoCode } from "@/lib/google-geocode";

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
      store_phone,
      template_id,
      banner,
      background_color,
      button_color,
      footer_color,
      font_color,
      header_color,
      logo,
      payment_methods,
      city,
      state,
      postalCode,
      street,
      street_number,
      neighborhood,
      opening_hours,
      isOpen,
    } = validatedValues.data;

    // For creation, enforce required fields
    if (
      !id &&
      (!store_name || !template_id || !banner || !logo || !payment_methods)
    ) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const [user] = await db
      .select({ googleApiKey: users.googleApiKey })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user.googleApiKey) {
      return {
        success: false,
        message:
          "Você precisa configurar a chave da API do Google Maps antes de criar uma customização",
      };
    }

    const formattedAddress = formatAddress({
      street,
      street_number,
      neighborhood,
      city,
      state,
      postalCode,
    });

    const { success, latitude, longitude, message, placeId } = await getGeoCode(
      formattedAddress,
      user.googleApiKey
    );

    if (!success) {
      return { success: false, message };
    }

    // Handle image uploads only if new files are provided
    let bannerUrl: string | null | undefined;
    let logoDesktopUrl: string | null | undefined;

    if (banner?.[0]) {
      bannerUrl = await uploadImageToS3(banner[0]);
      if (!bannerUrl) {
        return { success: false, message: "Erro ao fazer upload do banner" };
      }
    }

    if (logo?.[0]) {
      logoDesktopUrl = await uploadImageToS3(logo[0]);
      if (!logoDesktopUrl) {
        return { success: false, message: "Erro ao fazer upload do logo" };
      }
    }

    if (id) {
      // Update case: only set fields that were provided
      const updateData: Partial<typeof validatedValues.data> = {};

      if (store_name !== undefined) updateData.store_name = store_name;
      if (store_phone !== undefined)
        updateData.store_phone = store_phone || null;
      if (template_id !== undefined) updateData.template_id = template_id;
      if (bannerUrl !== undefined) updateData.banner = bannerUrl;
      if (background_color !== undefined)
        updateData.background_color = background_color;
      if (button_color !== undefined) updateData.button_color = button_color;
      if (footer_color !== undefined) updateData.footer_color = footer_color;
      if (font_color !== undefined) updateData.font_color = font_color;
      if (header_color !== undefined) updateData.header_color = header_color;
      if (logoDesktopUrl !== undefined) updateData.logo = logoDesktopUrl;
      if (payment_methods !== undefined)
        updateData.payment_methods = payment_methods;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (street !== undefined) updateData.street = street;
      if (street_number !== undefined) updateData.street_number = street_number;
      if (postalCode !== undefined) updateData.postalCode = postalCode;
      if (neighborhood !== undefined) updateData.neighborhood = neighborhood;
      if (isOpen !== undefined) updateData.isOpen = isOpen;
      if (opening_hours !== undefined) updateData.opening_hours = opening_hours;

      const updatedCustomization = await db
        .update(customizations)
        .set(updateData)
        .where(eq(customizations.id, id));

      if (!updatedCustomization) {
        return { success: false, message: "Falha ao atualizar a customização" };
      }

      return { success: true, message: "Customização atualizada com sucesso" };
    } else {
      // Insert case: all required fields are already validated
      const customization = await db.insert(customizations).values({
        store_name,
        store_phone: store_phone || null,
        template_id,
        banner: bannerUrl!,
        button_color,
        background_color,
        opening_hours,
        footer_color,
        font_color,
        header_color,
        latitude,
        longitude,
        placeId,
        postalCode,
        logo: logoDesktopUrl!,
        city,
        state,
        street,
        street_number,
        neighborhood,
        isOpen,
        payment_methods,
        user_id: session.user.id,
      });

      if (!customization) {
        return { success: false, message: "Falha ao criar a customização" };
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
