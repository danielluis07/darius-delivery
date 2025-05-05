import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "@/app/_features/_user/_components/user-sidebar";
import { cookies } from "next/headers";
import { Navbar } from "@/components/navbar";
import { auth } from "@/auth";
import { getUser } from "@/lib/get-user";
import { getStores } from "../../_features/_user/_queries/_stores/get-stores";
import { NewStoreProvider } from "@/providers/new-store-provider";

export default async function UserDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const cookieStore = await cookies();
  const session = await auth();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const stores = await getStores(session.user.id);

  const user = await getUser(session.user.id, storeId);

  if (!user.data) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <NewStoreProvider />
      <UserSidebar user={user.data} stores={stores.data} storeId={storeId} />
      <main className="w-full">
        <Navbar user={session?.user} />
        <div className="p-5 w-11/12 mx-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
