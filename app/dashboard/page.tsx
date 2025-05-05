import { auth } from "@/auth";
import { getStores } from "../_features/_user/_queries/_stores/get-stores";
import { redirect } from "next/navigation";
import { StoreModal } from "@/components/store-modal";

const Page = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <p>Not authenticated</p>;
  }

  const { data } = await getStores(session?.user.id);

  if (data && data.length > 0) {
    redirect(`/dashboard/${data[0].id}`);
  }

  return <StoreModal />;
};

export default Page;
