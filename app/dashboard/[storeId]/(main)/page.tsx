import { auth } from "@/auth";
import { OrdersPerDayChart } from "@/app/_features/_user/_components/_main/_charts/orders-per-day";
import { TotalCategories } from "@/app/_features/_user/_components/_main/total-categories";
import { TotalOrders } from "@/app/_features/_user/_components/_main/total-orders";
import { TotalProducts } from "@/app/_features/_user/_components/_main/total-products";
import {
  getOrdersCount,
  getCategoriesCount,
  getProductsCount,
} from "@/app/_features/_user/_queries/_main/get-data-count";
import { RevenuePerMonthChart } from "@/app/_features/_user/_components/_main/_charts/revenue-per-month";
import { getOrdersComparison } from "@/app/_features/_user/_queries/_main/orders-comparison";
import { OrdersComparisonChart } from "@/app/_features/_user/_components/_main/_charts/orders-comparison";
import { StatsCard } from "@/app/_features/_user/_components/_main/stats-card";
import {
  CircleX,
  CreditCard,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react";
import { OrdersPerMonthChart } from "@/app/_features/_user/_components/_main/_charts/orders-per-month";
import { getRestaurantStats } from "@/app/_features/_user/_queries/_main/get-restaurant-stats";
import { getOrders } from "@/app/_features/_user/_queries/_orders/get-orders";
import { GoogleHeatMapComponent } from "@/components/google-heat-map";
import { getGoogleApiKey } from "@/app/_features/_user/_queries/get-google-api-key";
import { getTotalRevenue } from "@/app/_features/_user/_queries/_finances/get-total-revenue";
import { TotalRevenue } from "@/app/_features/_user/_components/_finances/total-revenue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAverageTicket } from "@/app/_features/_user/_queries/_main/get-average-ticket";
import { AverageTicket } from "@/app/_features/_user/_components/_main/average-ticket";
import { getUserData } from "@/app/_features/_user/_queries/get-user-data";
import { TrialCountdown } from "@/app/_features/_user/_components/_settings/trial-countdown";
import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";

const DashboardPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const user = await getUser(session.user.id, storeId);

  const id =
    session.user.role === "EMPLOYEE"
      ? session.user.restaurantOwnerId
      : session.user.id;

  if (!id || !user.data) {
    return <div>Usuário não encontrado</div>;
  }
  const userPermissions = user.data.employee?.permissions;

  if (user.data.role === "EMPLOYEE" && !userPermissions?.includes("Início")) {
    redirect("/dashboard/categories");
  }

  /*   const [
    ordersCount,
    categoriesCount,
    productsCount,
    ordersComparison,
    stats,
    orders,
    apiKey,
    totalRevenue,
    averageTicket,
    userData,
  ] = await Promise.all([
    getOrdersCount(id),
    getCategoriesCount(id),
    getProductsCount(id),
    getOrdersComparison(id),
    getRestaurantStats(id),
    getOrders(id),
    getGoogleApiKey(id),
    getTotalRevenue(id),
    getAverageTicket(id),
    getUserData(id),
  ]); */

  return <div>o id da loja é {storeId}</div>;

  /*   return (
    <div className="w-full">
      <TrialCountdown trialEndsAt={userData?.trialEndsAt} />
      <div className="flex justify-between gap-4 mt-10">
        <TotalOrders totalOrders={ordersCount} />
        <TotalCategories totalCategories={categoriesCount} />
        <TotalProducts totalProducts={productsCount} />
        <TotalRevenue totalRevenue={totalRevenue} />
        <AverageTicket averageTicket={averageTicket} />
      </div>
      <div className="flex gap-4 mt-10">
        <OrdersPerDayChart userId={id} />
        <RevenuePerMonthChart userId={id} />
      </div>
      <div className="grid grid-cols-4 gap-3 mt-10">
        <StatsCard
          title="Entraram no Cardápio"
          icon={<UtensilsCrossed className="text-primary" size={35} />}
          value={stats?.menuViews || 0}
          className="h-36"
        />
        <StatsCard
          title="Adicionaram ao Carrinho"
          icon={<ShoppingCart className="text-primary" size={35} />}
          value={stats?.itemsAddedToCart || 0}
          className="h-28"
        />
        <StatsCard
          title="Compraram"
          icon={<CreditCard className="text-primary" size={35} />}
          value={stats?.itemsPurchased || 0}
          className="h-20"
        />
        <StatsCard
          title="Desistiram"
          icon={<CircleX className="text-primary" size={35} />}
          value={stats?.withdrawals || 0}
          className="h-12"
        />
      </div>
      <div className="flex items-center mt-10 gap-3">
        <OrdersPerMonthChart userId={id} />
        <OrdersComparisonChart data={ordersComparison || []} />
      </div>
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Calor (pedidos)</CardTitle>
          </CardHeader>
          <CardContent>
            {apiKey?.googleApiKey && orders ? (
              <GoogleHeatMapComponent
                apiKey={apiKey?.googleApiKey}
                orders={orders}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p>
                  Para verificar o mapa de calor é necessário definir a chave
                  api do google e possui algum pedido
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  ); */
};

export default DashboardPage;
