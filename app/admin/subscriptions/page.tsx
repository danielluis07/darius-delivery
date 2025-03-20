import { SubscriptionsClient } from "@/app/_features/_admin/_components/_subscriptions/client";
import { getSubscriptions } from "@/app/_features/_admin/_queries/get-subscriptions";

const SubscriptionPage = async () => {
  const data = await getSubscriptions();
  return <SubscriptionsClient data={data || []} />;
};

export default SubscriptionPage;
