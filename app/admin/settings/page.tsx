import { ComissionForm } from "@/app/_features/_admin/_components/_settings/comission-form";
import { ProfileForm } from "@/app/_features/_admin/_components/_settings/profile-form";
import { UpdatePasswordForm } from "@/app/_features/_admin/_components/_settings/update-password-form";
import { getCommission } from "@/app/_features/_admin/_queries/get-commission";
import { getUserData } from "@/app/_features/_user/_queries/get-user-data";
import { auth } from "@/auth";

const SettingsPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const [data, commission] = await Promise.all([
    getUserData(session.user.id),
    getCommission(session.user.id),
  ]);

  if (!data || !commission?.percentage) {
    return <div>Erro ao carregar informações do usuário</div>;
  }

  const formattedValue = parseFloat(commission?.percentage).toString(); // "10"

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold mb-10">Configurações</h1>
      <div className="flex gap-5">
        <ProfileForm name={data.name} email={data.email} />
        <UpdatePasswordForm />
        <ComissionForm percentage={formattedValue} />
      </div>
    </div>
  );
};

export default SettingsPage;
