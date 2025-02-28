import { ProfileForm } from "@/app/_features/_admin/_components/_settings/profile-form";
import { UpdatePasswordForm } from "@/app/_features/_admin/_components/_settings/update-password-form";
import { getUserData } from "@/app/_features/_user/_queries/get-user-data";
import { auth } from "@/auth";

const SettingsPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const data = await getUserData(session.user.id);

  if (!data) {
    return <div>Erro ao carregar informações do usuário</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold mb-10">Configurações</h1>
      <div className="flex gap-5">
        <ProfileForm name={data.name} email={data.email} />
        <UpdatePasswordForm />
      </div>
    </div>
  );
};

export default SettingsPage;
