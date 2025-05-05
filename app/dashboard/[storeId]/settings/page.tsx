import { BankAccountForm } from "@/app/_features/_user/_components/_settings/bank-account-form";
import { CancelSubBtn } from "@/app/_features/_user/_components/_settings/cancel-sub-btn";
import { GoogleApiKeyForm } from "@/app/_features/_user/_components/_settings/google-api-key-form";
import { getSubscription } from "@/app/_features/_user/_queries/get-subscription";
import { getUserData } from "@/app/_features/_user/_queries/get-user-data";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const [data, subscription] = await Promise.all([
    getUserData(session.user.id),
    getSubscription(session.user.id),
  ]);

  if (!data || !data.trialEndsAt) {
    return <div>Erro ao carregar os dados</div>;
  }

  const plan = subscription?.plan === "PREMIUM" ? "Premium" : "Básico";

  const status = subscription?.status === "ACTIVE" ? "Ativo" : "VENCIDO";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Tipo de assinatura: {plan}
            </p>
            <p className="text-sm text-muted-foreground">Status: {status}</p>
          </div>
          <CancelSubBtn subscriptionId={subscription?.asaas_sub_id} />
        </CardContent>
      </Card>
      <GoogleApiKeyForm userApiKey={data?.googleApiKey} />
      <BankAccountForm
        bankAccount={data?.bankAccount}
        bankAccountDigit={data?.bankAccountDigit}
        bankAccountType={data?.bankAccountType}
        bankAgency={data?.bankAgency}
        bankCode={data?.bankCode}
        ownerName={data?.ownerName}
      />
    </div>
  );
};

export default SettingsPage;
