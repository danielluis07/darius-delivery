import { formatCurrencyFromCents } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";

const PaymentConfirmationPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{
    orderId?: string;
    dailyNumber?: string;
    totalPrice?: string;
    status?: string;
    paymentStatus?: string;
    deliveryDeadline?: string;
  }>;
}) => {
  const { domain } = await params;
  const { dailyNumber, totalPrice, status, paymentStatus, deliveryDeadline } =
    await searchParams;

  console.log(domain);
  console.log(status);

  const price = Number(totalPrice);

  return (
    <div className="flex h-screen items-center justify-center relative">
      <div className="relative h-[600px] w-[450px] overflow-hidden rounded-[40px] border-[12px] border-gray-800 bg-white shadow-2xl p-6 bg-cover">
        <div className="w-full flex items-center justify-center gap-4">
          <div className="size-14 flex items-center justify-center bg-green-200 text-green-500 rounded-full">
            <Check className="size-8" />
          </div>
          <p>Pedido realizado com sucesso!</p>
        </div>
        {/* datails */}
        <div className="mt-10 space-y-4 text-center">
          <p>Nº do Pedido: {dailyNumber}</p>
          <p>Valor: {formatCurrencyFromCents(price)}</p>
          {paymentStatus === "PENDING" && (
            <p>Seu pedido está sendo preparado</p>
          )}
          <p>Tempo estimado para entrega: {deliveryDeadline} min</p>
          <Link href="/">Voltar para a loja</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;
