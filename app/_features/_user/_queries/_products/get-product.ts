import { UpdateProduct } from "../../_components/_products/update-product-form";

type GetProductResult = {
  rows: UpdateProduct[];
};

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/products`;

export const getProduct = async (
  id: string
): Promise<GetProductResult | null> => {
  try {
    const res = await fetch(`${URL}/${id}`);

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};
