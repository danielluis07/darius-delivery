// asaas functions
import { z } from "zod";
import { credentialsSignUpSchema, insertCustomerSchema } from "@/db/schemas";
import { AsaasPayment } from "@/types";

export const createUserAccount = async (
  values: z.infer<typeof credentialsSignUpSchema>
) => {
  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/accounts`, {
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

export const createCustomer = async (
  values: z.infer<typeof insertCustomerSchema>
) => {
  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/customers`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: process.env.NEXT_PUBLIC_ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        name: values.name,
        cpfCnpj: values.cpfCnpj,
        email: values.email,
        phone: values.phone,
        mobilePhone: values.phone,
        address: values.street,
        addressNumber: values.street_number,
        province: values.neighborhood,
        postalCode: values.postalCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create customer:", data);

      // Se houver erros, retorna um array de descrições
      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { success: false, message: errorMessages.join(" ") }; // Junta todas as mensagens
      }

      return { success: false, message: "Erro desconhecido ao criar a conta." };
    }

    return { success: true, customerId: data.id };
  } catch (error) {
    console.error("Error creating user account:", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};

export const createPayment = async (values: AsaasPayment) => {
  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/payments`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: process.env.NEXT_PUBLIC_ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        customer: values.customer,
        billingType: values.billingType,
        value: values.value / 100,
        dueDate: new Date().toISOString().split("T")[0],
        externalReference: values.externalReference,
        creditCard: {
          holderName: values.creditCard.holderName,
          number: values.creditCard.number,
          expiryMonth: values.creditCard.expiryMonth,
          expiryYear: values.creditCard.expiryYear,
          ccv: values.creditCard.ccv,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create customer:", data);

      // Se houver erros, retorna um array de descrições
      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { success: false, message: errorMessages.join(" ") }; // Junta todas as mensagens
      }

      return { success: false, message: "Erro desconhecido ao criar a conta." };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error creating user account:", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};
