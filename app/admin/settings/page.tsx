import { auth } from "@/auth";
import { ComissionForm } from "@/app/_features/_admin/_components/_settings/comission-form";
import { ProfileForm } from "@/app/_features/_admin/_components/_settings/profile-form";
import { UpdatePasswordForm } from "@/app/_features/_admin/_components/_settings/update-password-form";
import { getCommission } from "@/app/_features/_admin/_queries/get-commission";
import { getUserData } from "@/app/_features/_user/_queries/get-user-data";
import { ComissionPerUserClient } from "@/app/_features/_admin/_components/_settings/_comission-per-user/client";

const SettingsPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const [data, commission] = await Promise.all([
    getUserData(session.user.id),
    getCommission(session.user.id),
  ]);

  if (!data) {
    return <div>Erro ao carregar informações do usuário</div>;
  }

  const commissionValue = commission?.percentage || "0.00";

  const formattedValue = parseFloat(commissionValue).toString();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold mb-10">Configurações</h1>
      <div className="flex gap-5">
        <ProfileForm name={data.name} email={data.email} />
        <UpdatePasswordForm />
        <ComissionForm percentage={formattedValue} />
      </div>
      <ComissionPerUserClient />
    </div>
  );
};

export default SettingsPage;
