import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "@/app/_features/_user/_components/user-sidebar";
import { cookies } from "next/headers";
import { Navbar } from "@/components/navbar";
import { auth } from "@/auth";
import { getUser } from "@/lib/get-user";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = await auth();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const user = await getUser(session.user.id);

  if (!user.data) {
    return <div>Usuário não encontrado</div>;
  }

  console.log(user.data.employee?.permissions);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <UserSidebar user={user.data} />
      <main className="w-full">
        <Navbar user={session?.user} />
        <div className="p-5 w-11/12 mx-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
