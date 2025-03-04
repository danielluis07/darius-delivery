import { z } from "zod";
import { credentialsSignUpSchema, insertCustomerSchema } from "@/db/schemas";
import { AsaasPayment, PaymentBody } from "@/types";

// asaas functions

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
    const body: PaymentBody = {
      customer: values.customer,
      billingType: values.billingType,
      value: values.value / 100,
      dueDate: new Date().toISOString().split("T")[0],
      externalReference: values.externalReference,
    };

    // Se o método de pagamento for cartão de crédito, adiciona os dados do cartão
    if (values.billingType === "CREDIT_CARD" && values.creditCard) {
      body.creditCard = {
        holderName: values.creditCard.holderName,
        number: values.creditCard.number,
        expiryMonth: values.creditCard.expiryMonth,
        expiryYear: values.creditCard.expiryYear,
        ccv: values.creditCard.ccv,
      };
    }

    const res = await fetch(`${process.env.ASAAS_API_URL}/payments`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: process.env.NEXT_PUBLIC_ASAAS_API_KEY!,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create payment:", data);

      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { success: false, message: errorMessages.join(" ") };
      }

      return {
        success: false,
        message: "Erro desconhecido ao criar o pagamento.",
      };
    }

    if (values.billingType === "PIX") {
      return { success: true, paymentId: data.id };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error creating payment:", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};

export const generatePixQrCode = async (paymentId: string) => {
  try {
    const res = await fetch(
      `${process.env.ASAAS_API_URL}/payments/${paymentId}/pixQrCode`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          access_token: process.env.NEXT_PUBLIC_ASAAS_API_KEY!,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: "Erro ao gerar o código PIX" };
    }

    return {
      encodedImage: data.encodedImage,
      payload: data.payload,
      expirationDate: data.expirationDate,
    };
  } catch (error) {
    console.error("Error creating user account:", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};
