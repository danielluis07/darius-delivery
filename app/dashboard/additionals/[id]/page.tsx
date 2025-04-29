import { UpdateAdditionalsForm } from "@/app/_features/_user/_components/_additionals/update-additionals-form";
import { getAdditional } from "@/app/_features/_user/_queries/_additionals/get-additional";
import { auth } from "@/auth";

const AdditionalPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const session = await auth();
  const { id } = await params;

  if (!session || !session.user.id) {
    return <p>Not authenticated</p>;
  }

  const additional = await getAdditional(id);

  if (!additional) {
    return <p>Additional not found</p>;
  }

  return <UpdateAdditionalsForm id={id} data={additional} />;
};

export default AdditionalPage;
