import { PlanCard } from "@/app/_features/_user/_components/_subscription/plan-card";

type PlansType = {
  id: string;
  value: "BASIC" | "PREMIUM";
  name: string;
  price: number;
  description: string;
}[];

const SubscriptionPage = () => {
  const plans: PlansType = [
    {
      id: "basic",
      value: "BASIC",
      name: "Plano Básico",
      price: 197,
      description:
        "15 dias grátis + funcionalidades essenciais para seu delivery.",
    },
    {
      id: "premium",
      value: "PREMIUM",
      name: "Plano Premium",
      price: 397,
      description: "Todos os recursos avançados para maximizar suas vendas.",
    },
  ];

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Escolha Seu Plano</h1>
      <p className="text-gray-600 mb-6">
        Teste grátis por 15 dias! Sem taxa de adesão.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
