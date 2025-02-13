import { GoogleApiKeyForm } from "@/app/_features/_user/_components/_settings/google-api-key-form";
import { getUserData } from "@/app/_features/_user/_queries/get-user-data";
import { auth } from "@/auth";

const SettingsPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const data = await getUserData(session.user.id);

  return (
    <div className="space-y-4">
      <GoogleApiKeyForm userApiKey={data?.googleApiKey} />
      <div>outras configurações</div>
    </div>
  );
};

export default SettingsPage;
