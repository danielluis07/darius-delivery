import { AsaasPayment, PaymentBody } from "@/types";

// asaas functions

export const createUserAccount = async ({
  name,
  email,
  phone,
  cpfCnpj,
  address,
  addressNumber,
  province,
  postalCode,
  companyType,
  domain,
  incomeValue,
}: {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  address: string;
  addressNumber: string;
  province: string;
  postalCode: string;
  companyType: string;
  domain: string;
  incomeValue: number;
}) => {
  const url = domain || "mywebsite.com";
  const formattedUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;

  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/accounts`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        name: name,
        email: email,
        mobilePhone: phone,
        cpfCnpj: cpfCnpj,
        site: formattedUrl,
        incomeValue: incomeValue,
        address: address,
        addressNumber: addressNumber,
        province: province,
        postalCode: postalCode,
        companyType: companyType,
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

    return { success: true, walletId: data.walletId, apiKey: data.apiKey };
  } catch (error) {
    console.error("Error creating user account:", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};

export const createCustomer = async ({
  name,
  email,
  cpfCnpj,
  phone,
  postalCode,
  street,
  street_number,
  neighborhood,
  apiKey,
}: {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  postalCode: string;
  street: string;
  street_number: string;
  neighborhood: string;
  apiKey: string;
}) => {
  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/customers`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: apiKey,
      },
      body: JSON.stringify({
        name: name,
        cpfCnpj: cpfCnpj,
        email: email,
        phone: phone,
        mobilePhone: phone,
        address: street,
        addressNumber: street_number,
        province: neighborhood,
        postalCode: postalCode,
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

export const simulatePayment = async (
  value: number,
  billingType: string,
  apiKey: string
) => {
  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/payments/simulate`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: apiKey,
      },
      body: JSON.stringify({
        value: value / 100,
        billingTypes: [billingType],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create payment:", data);

      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { successful: false, message: errorMessages.join(" ") };
      }

      return {
        successful: false,
        message: "Erro desconhecido ao criar o pagamento.",
      };
    }

    if (billingType === "PIX") {
      return { successful: true, netValue: data.pix.netValue };
    }

    return { successful: true, netValue: data.creditCard.netValue };
  } catch (error) {
    console.error("Error creating payment:", error);
    return {
      successful: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};

export const createPayment = async (
  values: AsaasPayment,
  apiKey: string,
  commission: string,
  adminWalletId: string,
  netValue: number
) => {
  try {
    const body: PaymentBody = {
      customer: values.customer,
      billingType: values.billingType,
      value: values.value / 100,
      dueDate: new Date().toISOString().split("T")[0],
      externalReference: values.externalReference,
      split: [
        {
          walletId: adminWalletId,
          fixedValue: netValue,
          percentageValue: 100 - parseFloat(commission),
        },
      ],
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
        access_token: apiKey,
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

export const generatePixQrCode = async (paymentId: string, apiKey: string) => {
  try {
    const res = await fetch(
      `${process.env.ASAAS_API_URL}/payments/${paymentId}/pixQrCode`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          access_token: apiKey,
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

export const createPixKey = async (apikey: string) => {
  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/pix/addressKeys`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: apikey,
      },
      body: JSON.stringify({ type: "EVP" }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create pix key:", data);

      // Se houver erros, retorna um array de descrições
      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { success: false, message: errorMessages.join(" ") }; // Junta todas as mensagens
      }

      return {
        success: false,
        message: "Erro desconhecido ao criar a chave pix.",
      };
    }

    return { success: true, pixKey: data.key };
  } catch (error) {
    console.error("Error creating pix key", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};

export const requestAsaastWithDrawl = async ({
  value,
  bankAccount,
  bankAgency,
  bankCode,
  cpfCnpj,
  bankAccountDigit,
  bankAccountType,
  ownerName,
  pixAddressKey,
  apiKey,
}: {
  value: number;
  bankAccount: string | null | undefined;
  bankAgency: string | null | undefined;
  bankCode: string | null | undefined;
  cpfCnpj: string | null | undefined;
  bankAccountDigit: string | null | undefined;
  bankAccountType: string | null | undefined;
  ownerName: string | null | undefined;
  pixAddressKey: string | null | undefined;
  apiKey: string;
}) => {
  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/transfers`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: apiKey,
      },
      body: JSON.stringify({
        value,
        bankAccount: {
          account: bankAccount,
          ownerName: ownerName,
          cpfCnpj: cpfCnpj,
          agency: bankAgency,
          accountDigit: bankAccountDigit,
          bankAccountType: bankAccountType,
          bank: { code: bankCode },
        },
        pixAddressKey,
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

    return { success: true };
  } catch (error) {
    console.error("Error requesting withdrawl", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};

export const getTransferRequests = async (apiKey: string) => {
  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/transfers`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: apiKey,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create get transfer requests:", data);

      // Se houver erros, retorna um array de descrições
      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { success: false, message: errorMessages.join(" ") }; // Junta todas as mensagens
      }

      return {
        success: false,
        message: "Erro desconhecido ao requisitar as transferências",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error getting transfer requests", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};

export const getAccountBalance = async (apiKey: string) => {
  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/finance/balance`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: apiKey,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create get transfer requests:", data);

      // Se houver erros, retorna um array de descrições
      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { success: false, message: errorMessages.join(" ") }; // Junta todas as mensagens
      }

      return {
        success: false,
        message: "Erro desconhecido ao requisitar as transferências",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error getting transfer requests", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};

export const getPayments = async (apiKey: string) => {
  try {
    const res = await fetch(
      `${process.env.ASAAS_API_URL}/payments?customer=cus_000006553975`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          access_token: apiKey,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create get transfer requests:", data);

      // Se houver erros, retorna um array de descrições
      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { success: false, message: errorMessages.join(" ") }; // Junta todas as mensagens
      }

      return {
        success: false,
        message: "Erro desconhecido ao requisitar as transferências",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error getting transfer requests", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};

export const getAccountStatus = async (apiKey: string) => {
  try {
    const res = await fetch(`${process.env.ASAAS_API_URL}/myAccount/status`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        access_token: apiKey,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create get transfer requests:", data);

      // Se houver erros, retorna um array de descrições
      if (data.errors) {
        const errorMessages = data.errors.map(
          (err: { description: string }) => err.description
        );
        return { success: false, message: errorMessages.join(" ") }; // Junta todas as mensagens
      }

      return {
        success: false,
        message: "Erro desconhecido ao requisitar as transferências",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error getting transfer requests", error);
    return {
      success: false,
      message: "Erro interno ao conectar com a API do Asaas.",
    };
  }
};
