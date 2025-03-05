import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

// Tipo da resposta da rota /cash-register/open
type ResponseType = InferResponseType<
  (typeof client.api.orders)["cash-register"]["open"]["$post"]
>;

export const useOpenCashRegister = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.orders["cash-register"]["open"]["$post"]();
      return await res.json();
    },
    onSuccess: (data) => {
      toast.success(
        `Caixa aberto em ${new Date(data.openedAt).toLocaleString()}!`
      );
      // Opcional: Invalidar alguma query relacionada, se houver
      queryClient.invalidateQueries({ queryKey: ["cash-register"] });
    },
    onError: () => {
      toast.error("Houve um erro ao abrir o caixa!");
    },
  });

  return mutation;
};
