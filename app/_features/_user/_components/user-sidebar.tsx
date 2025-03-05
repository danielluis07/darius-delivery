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
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronUp,
  House,
  User2,
  FolderClosed,
  Paintbrush,
  NotebookText,
  Route,
  ShoppingBasket,
  Users,
  CircleDollarSign,
  MapPin,
  Printer,
  ChartPie,
  Globe,
  Sandwich,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutButton } from "@/components/logout-button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RiMotorbikeFill } from "react-icons/ri";
import { TbCircleLetterD } from "react-icons/tb";
import { ExtendedUser } from "@/next-auth";
import Link from "next/link";

const items = [
  {
    url: "/dashboard",
    icon: House,
    label: "Início",
  },
  {
    url: "/dashboard/categories",
    icon: FolderClosed,
    label: "Categorias",
  },
  {
    url: "/dashboard/products",
    icon: Sandwich,
    label: "Produtos",
  },
  {
    url: "/dashboard/domain-configuration",
    icon: Globe,
    label: "Configuração de Domínio",
  },
  {
    url: "/dashboard/customization",
    icon: Paintbrush,
    label: "Personalização",
  },
  {
    url: "/dashboard/deliverers",
    icon: RiMotorbikeFill,
    label: "Entregadores",
  },
  {
    url: "/dashboard/orders",
    icon: NotebookText,
    label: "Pedidos",
  },
  {
    url: "/dashboard/order-routing",
    icon: Route,
    label: "Roteirização de Pedidos",
  },
  {
    url: "/dashboard/combos",
    icon: ShoppingBasket,
    label: "Combos",
  },
  {
    url: "/dashboard/customers",
    icon: Users,
    label: "Clientes",
  },
  {
    url: "/dashboard/finances",
    icon: CircleDollarSign,
    label: "Financeiro",
  },
  {
    url: "/dashboard/delivery-areas",
    icon: MapPin,
    label: "Áreas de Entrega",
  },
  {
    url: "/dashboard/receipts",
    icon: Printer,
    label: "Impressão de Comandas",
  },
  {
    url: "/dashboard/pixels",
    icon: ChartPie,
    label: "Pixels",
  },
  {
    url: "/dashboard/darius-pay",
    icon: TbCircleLetterD,
    label: "Darius Pay",
  },
];

export function UserSidebar({ user }: { user: ExtendedUser }) {
  const { open } = useSidebar();
  const router = useRouter();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {open ? (
          <div className="relative w-5/6 h-16 mx-auto">
            <Link href="/dashboard">
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
            <Link href="/dashboard">
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
      <SidebarContent className="custom-sidebar">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                if (item.label === "Áreas de Entrega") {
                  return (
                    <Collapsible
                      key={item.label}
                      defaultOpen={false}
                      className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="space-y-1">
                            <SidebarMenuSubItem
                              onClick={() =>
                                router.push("/dashboard/delivery-areas")
                              }
                              className="rounded-md p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer">
                              Por Endereço
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem
                              onClick={() =>
                                router.push("/dashboard/delivery-areas-km")
                              }
                              className="rounded-md p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer">
                              Por Km
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
                  onClick={() => router.push("/dashboard/settings")}>
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
