"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import {
  customizations,
  orderSettings,
  colors,
  stores,
  templateAddress,
} from "@/db/schema";
import { insertCustomizationSchema } from "@/db/schemas";
import { and, eq } from "drizzle-orm";
import { formatAddress, getGeoCode } from "@/lib/google-geocode";
import { deleteFromS3, uploadImageToS3 } from "@/lib/s3-upload";

export const createCustomization = async (
  values: z.infer<typeof insertCustomizationSchema>,
  storeId: string
) => {
  try {
    // 1. Authentication and Basic Validation
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Usuário não autenticado." };
    }

    const validatedValues = insertCustomizationSchema.safeParse(values);
    if (!validatedValues.success) {
      console.error("Validation Errors:", validatedValues.error.flatten());
      return { success: false, message: "Dados inválidos." };
    }

    // Destructure validated data, separating id, files, and other fields
    const {
      id, // This will be undefined/null for creation, present for update
      banner, // Expecting File[] or similar from form
      logo, // Expecting File[] or similar from form
      store_name,
      store_phone,
      template_id,
      payment_methods,
      city,
      state,
      postalCode,
      street,
      street_number,
      neighborhood,
      opening_hours,
      isOpen,
      // latitude, longitude, placeId are removed here, will be fetched/updated later
      ...otherData // Any other fields in your schema
    } = validatedValues.data;

    const [existingColors] = await db
      .select({ id: colors.id })
      .from(colors)
      .where(eq(colors.userId, session.user.id));

    if (!existingColors) {
      return {
        success: false,
        message: "Cores não definidas. Por favor, defina as cores primeiro.",
      };
    }

    const [userData] = await db
      .select({ googleApiKey: stores.googleApiKey })
      .from(stores)
      .where(eq(stores.id, storeId));

    if (!userData?.googleApiKey) {
      return {
        success: false,
        message: "Chave da API do Google Maps não configurada.",
      };
    }

    const [orderSettingsData] = await db
      .select({ id: orderSettings.id })
      .from(orderSettings)
      .where(eq(orderSettings.storeId, storeId));

    if (!orderSettingsData) {
      return {
        success: false,
        message: "Configurações de tempo de entrega não definidas.",
      };
    }

    // 3. Geocoding (Needed for both Create and Update if address changed)
    const formattedAddress = formatAddress({
      street,
      street_number,
      neighborhood,
      city,
      state,
      postalCode,
    });
    const geoResult = await getGeoCode(formattedAddress, userData.googleApiKey);

    if (!geoResult.success) {
      return {
        success: false,
        message: geoResult.message ?? "Falha ao obter geolocalização.",
      };
    }
    const { latitude, longitude, placeId } = geoResult; // Get calculated geo data

    // 4. Initialize Image URLs and Fetch Existing Data (for Update)
    let bannerUrl: string | null | undefined = undefined; // Use undefined to distinguish from null if needed
    let logoDesktopUrl: string | null | undefined = undefined;
    let existingCustomization: {
      banner?: string | null;
      logo?: string | null;
    } | null = null;

    if (id) {
      // --- UPDATE Scenario ---
      const [fetchedData] = await db
        .select({ banner: customizations.banner, logo: customizations.logo })
        .from(customizations)
        .where(
          and(
            eq(customizations.id, id),
            eq(customizations.userId, session.user.id)
          )
        ); // Match ID and User

      if (!fetchedData) {
        // IMPORTANT: Return specific error if ID provided but record not found/owned
        return {
          success: false,
          message:
            "Customização a ser atualizada não encontrada ou pertence a outro usuário.",
        };
      }
      existingCustomization = fetchedData;
      // Pre-fill URLs with existing values; will be overwritten if new files are uploaded
      bannerUrl = existingCustomization.banner;
      logoDesktopUrl = existingCustomization.logo;
    } else {
      // --- CREATE Scenario ---
      // Check required fields specifically for creation *before* uploads
      if (
        !store_name ||
        !template_id ||
        !payment_methods ||
        !banner?.[0] ||
        !logo?.[0]
      ) {
        // Adjust this check based on whether banner/logo are truly mandatory on creation
        return {
          success: false,
          message:
            "Campos obrigatórios (nome, template, pagamentos, banner, logo) não preenchidos para criação.",
        };
      }
    }

    // 5. Handle Image Uploads & Deletions (Conditional)
    // --- Banner ---
    if (banner?.[0]) {
      // Check if a new banner file was provided
      const uploadedUrl = await uploadImageToS3(banner[0]);
      if (!uploadedUrl) {
        return {
          success: false,
          message: "Erro ao fazer upload do novo banner.",
        };
      }
      const previousBannerUrl = bannerUrl; // Store the potentially existing URL before overwriting
      bannerUrl = uploadedUrl; // Update with the new URL

      // Delete old banner ONLY if updating AND an old banner existed AND it's different
      if (
        id &&
        existingCustomization?.banner &&
        previousBannerUrl !== bannerUrl
      ) {
        const oldFileName = existingCustomization.banner.split("/").pop();
        if (oldFileName) {
          const { success: deleteSuccess } = await deleteFromS3(oldFileName);
          if (!deleteSuccess) {
            console.warn(
              `Falha ao deletar banner antigo do S3: ${oldFileName}. Continuando a operação.`
            );
            // Decide if this is critical. Logging might be sufficient.
          }
        }
      }
    }

    // --- Logo ---
    if (logo?.[0]) {
      // Check if a new logo file was provided
      const uploadedUrl = await uploadImageToS3(logo[0]);
      if (!uploadedUrl) {
        return {
          success: false,
          message: "Erro ao fazer upload do novo logo.",
        };
      }
      const previousLogoUrl = logoDesktopUrl; // Store potentially existing URL
      logoDesktopUrl = uploadedUrl; // Update with the new URL

      // Delete old logo ONLY if updating AND an old logo existed AND it's different
      if (
        id &&
        existingCustomization?.logo &&
        previousLogoUrl !== logoDesktopUrl
      ) {
        const oldFileName = existingCustomization.logo.split("/").pop();
        if (oldFileName) {
          const { success: deleteSuccess } = await deleteFromS3(oldFileName);
          if (!deleteSuccess) {
            console.warn(
              `Falha ao deletar logo antigo do S3: ${oldFileName}. Continuando a operação.`
            );
            // Decide if this is critical.
          }
        }
      }
    }

    // 6. Perform Database Operation (Update or Insert)
    if (id) {
      // --- UPDATE ---
      const updateData: Partial<typeof customizations.$inferInsert> = {
        // Include fields from validated data that are allowed to change
        store_name,
        template_id,
        payment_methods,
        opening_hours,
        isOpen,
        ...otherData, // Include other validated fields if they exist
        // Include recalculated/updated fields
        banner: bannerUrl, // Use final banner URL (could be new, old, or null)
        logo: logoDesktopUrl, // Use final logo URL
      };

      const updateAddressData = {
        // Include fields from validated data that are allowed to change
        street,
        store_phone: store_phone ?? null, // Handle optional phone
        street_number,
        neighborhood,
        city,
        state,
        postalCode,
        latitude,
        longitude,
        placeId,
      };

      // Optional: Remove undefined fields if your DB adapter requires it
      // Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      if (Object.keys(updateData).length === 0) {
        return {
          success: true,
          message: "Nenhum dado fornecido para atualização.",
          customizationId: id,
        };
      }

      const [updatedResult] = await db
        .update(customizations)
        .set(updateData)
        .where(eq(customizations.id, id)) // Condition already checked user ownership
        .returning({ updatedId: customizations.id });

      if (!updatedResult?.updatedId) {
        console.error(
          "Falha ao atualizar a customização no banco de dados:",
          updatedResult
        );
        return {
          success: false,
          message: "Falha ao atualizar a customização no banco de dados.",
        };
      }

      // update only if the address exists
      const [existingAddress] = await db
        .select({ id: templateAddress.id })
        .from(templateAddress)
        .where(
          and(
            eq(templateAddress.storeId, storeId),
            eq(templateAddress.template_id, template_id)
          )
        );

      if (existingAddress) {
        // Update address data separately if needed
        const [updatedAddressResult] = await db
          .update(templateAddress)
          .set(updateAddressData)
          .where(eq(templateAddress.storeId, storeId)) // Condition already checked user ownership
          .returning({ updatedId: templateAddress.id });

        if (!updatedAddressResult?.updatedId) {
          console.error(
            "Falha ao atualizar o endereço no banco de dados:",
            updatedAddressResult
          );
          return {
            success: false,
            message: "Falha ao atualizar o endereço no banco de dados.",
          };
        }
      } else {
        // Insert address data separately if it doesn't exist
        const [insertedAddressResult] = await db
          .insert(templateAddress)
          .values({
            storeId,
            street,
            template_id,
            store_phone: store_phone ?? null,
            street_number,
            neighborhood,
            city,
            state,
            postalCode,
            latitude,
            longitude,
            placeId,
          })
          .returning({ insertedId: templateAddress.id });

        if (!insertedAddressResult?.insertedId) {
          console.error(
            "Falha ao inserir o endereço no banco de dados:",
            insertedAddressResult
          );
          return {
            success: false,
            message: "Falha ao inserir o endereço no banco de dados.",
          };
        }
      }

      return {
        success: true,
        message: "Customização atualizada com sucesso!",
        customizationId: updatedResult.updatedId,
      };
    } else {
      // --- INSERT ---
      // Final check: Ensure required image URLs were successfully obtained if they were required
      if (!bannerUrl || !logoDesktopUrl) {
        // This check depends on whether images are truly mandatory for creation.
        // If upload failed earlier, it would have returned. This catches the case where
        // the file was required but somehow bannerUrl/logoDesktopUrl are still null/undefined.
        return {
          success: false,
          message:
            "Falha ao processar arquivos de imagem necessários para criação.",
        };
      }

      const insertData: typeof customizations.$inferInsert = {
        userId: session.user.id,
        store_name, // Already checked if mandatory
        template_id, // Already checked if mandatory
        payment_methods, // Already checked if mandatory
        opening_hours,
        isOpen,
        ...otherData, // Include other validated fields
        // Include required relationships and calculated data
        banner: bannerUrl, // Use the (required and uploaded) banner URL
        logo: logoDesktopUrl, // Use the (required and uploaded) logo URL
      };

      const insertAddressData = {
        storeId,
        street,
        template_id,
        store_phone: store_phone ?? null,
        street_number,
        neighborhood,
        city,
        state,
        postalCode,
        latitude,
        longitude,
        placeId,
      };

      const [insertedResult] = await db
        .insert(customizations)
        .values(insertData)
        .returning({ insertedId: customizations.id });

      if (!insertedResult?.insertedId) {
        return {
          success: false,
          message: "Falha ao salvar a nova customização no banco de dados.",
        };
      }

      // Insert address data separately
      const [insertedAddressResult] = await db
        .insert(templateAddress)
        .values(insertAddressData)
        .returning({ insertedId: templateAddress.id });

      if (!insertedAddressResult?.insertedId) {
        console.error(
          "Falha ao inserir o endereço no banco de dados:",
          insertedAddressResult
        );
        return {
          success: false,
          message: "Falha ao inserir o endereço no banco de dados.",
        };
      }

      return {
        success: true,
        message: "Customização criada com sucesso!",
        customizationId: insertedResult.insertedId,
      };
    }
  } catch (error) {
    console.error("Erro inesperado ao criar a customização:", error);
    const message = "Ocorreu um erro inesperado.";
    return { success: false, message };
  }
};
