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

export const removeFormatting = (value: string) => {
  return value.replace(/\D/g, ""); // Remove tudo que não for número
};

export const formatCpf = (value: string): string => {
  // Remove caracteres não numéricos
  const digits = value.replace(/\D/g, "").slice(0, 11); // Limita a 11 dígitos
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const formatCnpj = (value: string): string => {
  // Remove caracteres não numéricos
  const digits = value.replace(/\D/g, "").slice(0, 14); // Limita a 14 dígitos
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,4})/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

export const formatPostalCode = (value: string): string => {
  // Remove caracteres não numéricos e limita a 8 dígitos
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{5})(\d{1,3})/, "$1-$2");
};

export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRad = (x: number) => (x * Math.PI) / 180;

  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distância em km
};

// Verifica se o pedido está dentro de alguma área de entrega cadastrada
export const isWithinDeliveryArea = (
  orderLat: number,
  orderLng: number,
  deliveryAreas: {
    areaId: string;
    latitude: number | null;
    longitude: number | null;
    distance: number | null;
    price: number | null;
  }[]
): boolean => {
  return deliveryAreas.some((area) => {
    if (!area.latitude || !area.longitude || !area.distance) return false;

    const distanceToOrder = haversineDistance(
      orderLat,
      orderLng,
      area.latitude,
      area.longitude
    );

    return distanceToOrder <= area.distance;
  });
};

export const getDeliveryFee = (
  orderLat: number,
  orderLng: number,
  deliveryAreas: {
    areaId: string;
    latitude: number | null;
    longitude: number | null;
    distance: number | null;
    price: number | null;
  }[]
): number | null => {
  let selectedFee = null;

  for (const area of deliveryAreas) {
    if (!area.latitude || !area.longitude || !area.distance || !area.price) {
      continue;
    }

    const distanceToOrder = haversineDistance(
      orderLat,
      orderLng,
      area.latitude,
      area.longitude
    );

    if (distanceToOrder <= area.distance) {
      selectedFee = area.price; // Pegamos a menor taxa que cobre o pedido
      break; // Encontramos a taxa mais próxima, então saímos do loop
    }
  }

  return selectedFee;
};

export const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
