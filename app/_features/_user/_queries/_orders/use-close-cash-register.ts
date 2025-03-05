import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { useCashReport } from "@/hooks/use-cash-report-dialog";

// Tipo da resposta da rota /cash-register/close
type ResponseType = {
  message: string;
  report: {
    date: string;
    totalRevenue: number;
    orderCount: number;
    completedOrders: number;
    pendingOrders: number;
  };
};

export const useCloseCashRegister = () => {
  const { openModal } = useCashReport();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.orders["cash-register"]["close"]["$post"]();
      const data = await res.json();

      if ("error" in data) {
        throw new Error(data.error || "Unknown error from API");
      }

      return data as ResponseType;
    },
    onSuccess: (data) => {
      toast.success("Caixa fechado com sucesso!");
      // Invalidar queries relacionadas (ex.: lista de pedidos ou estado do caixa)
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cash-register"] });
      // Opcional: Armazenar o relatório no cache do React Query
      queryClient.setQueryData(
        ["cash-register", "report", data.report.date],
        data.report
      );
      openModal(data.report);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
