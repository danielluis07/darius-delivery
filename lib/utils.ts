import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrencyFromCents = (amount: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100);
};

export const formatCurrency = (value: string | number) => {
  if (!value) return "";
  const numericValue = Number(value) / 100; // Ajusta para considerar centavos
  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const formatPhoneNumber = (value: string) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");

  // Initialize an empty string for the formatted number
  let formattedNumber = "";

  // Apply conditional formatting based on the number of digits
  if (digits.length > 2) {
    formattedNumber += `(${digits.slice(0, 2)}) `;
  } else {
    formattedNumber += digits;
  }

  if (digits.length > 7) {
    formattedNumber += digits.slice(2, 7) + "-" + digits.slice(7, 11);
  } else if (digits.length > 2) {
    formattedNumber += digits.slice(2, 7);
  }

  return formattedNumber;
};
