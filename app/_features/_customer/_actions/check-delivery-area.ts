import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { customers, deliveryAreasKm, deliveryAreasKmFees } from "@/db/schema";
import {
  formatCurrency,
  getDeliveryFee,
  isWithinDeliveryArea,
} from "@/lib/utils";
import { formatAddress, getGeoCode } from "@/lib/google-geocode";

export const checkDeliveryArea = async (
  customerId: string,
  storeId: string,
  googleApiKey: string
) => {
  try {
    const [userCostumer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.userId, customerId));

    if (!userCostumer) {
      return {
        success: false,
        message: "Customer not found",
      };
    }

    const [customer] = await db
      .select({
        city: customers.city,
        state: customers.state,
        neighborhood: customers.neighborhood,
        street: customers.street,
        street_number: customers.street_number,
        postalCode: customers.postalCode,
      })
      .from(customers)
      .where(eq(customers.id, userCostumer.id));

    if (!customer) {
      return {
        success: false,
        message: "Customer not found",
      };
    }

    const formattedAddress = formatAddress({
      city: customer.city,
      state: customer.state,
      neighborhood: customer.neighborhood,
      street: customer.street,
      street_number: customer.street_number,
      postalCode: customer.postalCode,
    });

    if (!formattedAddress) {
      return {
        success: false,
        message: "Address not found",
      };
    }

    const { success, latitude, longitude, message } = await getGeoCode(
      formattedAddress,
      googleApiKey
    );

    if (!success) {
      return {
        success: false,
        message,
      };
    }

    const deliveryAreas = await db
      .select({
        areaId: deliveryAreasKm.id,
        latitude: deliveryAreasKm.latitude,
        longitude: deliveryAreasKm.longitude,
        distance: deliveryAreasKmFees.distance,
        price: deliveryAreasKmFees.price,
      })
      .from(deliveryAreasKm)
      .leftJoin(
        deliveryAreasKmFees,
        eq(deliveryAreasKm.id, deliveryAreasKmFees.deliveryAreaId)
      )
      .where(eq(deliveryAreasKm.storeId, storeId));

    if (!deliveryAreas || deliveryAreas.length === 0) {
      return {
        success: false,
        message: "Delivery areas not found",
      };
    }

    // Verifica se o pedido está dentro da área de entrega
    const isValidDelivery = isWithinDeliveryArea(
      latitude,
      longitude,
      deliveryAreas
    );

    if (!isValidDelivery) {
      return {
        success: false,
        message: "Delivery area not found",
      };
    }

    // Determina o valor da taxa de entrega baseado na distância do pedido
    const deliveryFee = getDeliveryFee(latitude, longitude, deliveryAreas);

    const fee = deliveryFee || 0;

    return {
      success: true,
      message: `Para essa compra você pagará a taxa de: ${formatCurrency(fee)}`,
      fee,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro ao verificar área de entrega",
    };
  }
};
