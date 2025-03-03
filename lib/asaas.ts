// asaas functions
import { z } from "zod";
import { credentialsSignUpSchema } from "@/db/schemas";

export const createUserAccount = async (
  values: z.infer<typeof credentialsSignUpSchema>
) => {
  try {
    const res = await fetch("https://api-sandbox.asaas.com/v3/accounts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: process.env.NEXT_PUBLIC_ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        mobilePhone: values.phone,
        cpfCnpj: values.cpfCnpj,
        incomeValue: values.incomeValue,
        address: values.address,
        addressNumber: values.addressNumber,
        province: values.province,
        postalCode: values.postalCode,
        companyType: values.companyType,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create user account:", data);

      // Se houver erros, retorna um array de descrições
      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { success: false, message: errorMessages.join(" ") }; // Junta todas as mensagens
      }

      return { success: false, message: "Erro desconhecido ao criar a conta." };
    }

    return { success: true, walletId: data.walletId };
  } catch (error) {
    console.error("Error creating user account:", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};

export const createClient = async (
  values: z.infer<typeof credentialsSignUpSchema>
) => {
  try {
    const res = await fetch("https://api-sandbox.asaas.com/v3/customers", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: process.env.NEXT_PUBLIC_ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        mobilePhone: values.phone,
        cpfCnpj: values.cpfCnpj,
        incomeValue: values.incomeValue,
        address: values.address,
        addressNumber: values.addressNumber,
        province: values.province,
        postalCode: values.postalCode,
        companyType: values.companyType,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create user account:", data);

      // Se houver erros, retorna um array de descrições
      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { success: false, message: errorMessages.join(" ") }; // Junta todas as mensagens
      }

      return { success: false, message: "Erro desconhecido ao criar a conta." };
    }

    return { success: true, walletId: data.walletId };
  } catch (error) {
    console.error("Error creating user account:", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};
