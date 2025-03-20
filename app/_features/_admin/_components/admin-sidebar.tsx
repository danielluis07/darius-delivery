"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronUp,
  House,
  User2,
  LayoutTemplate,
  Settings,
  Users,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutButton } from "@/components/logout-button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExtendedUser } from "@/next-auth";

const items = [
  {
    url: "/admin",
    icon: House,
    label: "Início",
  },
  {
    url: "/admin/users",
    icon: Users,
    label: "Lojistas",
  },
  {
    url: "/admin/templates",
    icon: LayoutTemplate,
    label: "Templates",
  },
  {
    url: "/admin/subscriptions",
    icon: CreditCard,
    label: "Assinaturas",
  },
];

export function AdminSidebar({ user }: { user: ExtendedUser }) {
  const { open } = useSidebar();
  const router = useRouter();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {open ? (
          <div className="relative w-5/6 h-16 mx-auto">
            <Link href="/admin">
              <Image
                src="/darius.png"
                fill
                alt="logo"
                priority
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 75vw, 256px"
              />
            </Link>
          </div>
        ) : (
          <div className="relative w-5/6 h-7 mx-auto">
            <Link href="/admin">
              <Image
                src="/darius-mini.png"
                fill
                alt="logo"
                priority
                sizes="48px"
              />
            </Link>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user.name}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/admin/settings")}>
                  <Settings />
                  {open && <span>Configurações</span>}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <LogOutButton open={open} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
