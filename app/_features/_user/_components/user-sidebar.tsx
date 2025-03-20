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
  Lock,
  ChartPie,
  Globe,
  Sandwich,
  Settings,
  UserRoundCog,
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
import Link from "next/link";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: "ADMIN" | "USER" | "CUSTOMER" | "EMPLOYEE" | null;
  subscription: {
    id: string;
    asaas_sub_id: string | null;
    user_id: string;
    plan: "BASIC" | "PREMIUM" | null;
    status: string;
    end_date: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  employee: {
    id: string;
    userId: string | null;
    restaurantOwnerId: string | null;
    permissions: string[] | null;
  } | null;
};

export function UserSidebar({ user }: { user: User }) {
  const { open } = useSidebar();
  const router = useRouter();

  const items = [
    {
      url: "/dashboard",
      icon: House,
      label: "Início",
      allowed: true,
    },
    {
      url: "/dashboard/categories",
      icon: FolderClosed,
      label: "Categorias",
      allowed: true,
    },
    {
      url: "/dashboard/products",
      icon: Sandwich,
      label: "Produtos",
      allowed: true,
    },
    {
      url: "/dashboard/domain-configuration",
      icon: Globe,
      label: "Configuração de Domínio",
      allowed: true,
    },
    {
      url: "/dashboard/customization",
      icon: Paintbrush,
      label: "Personalização",
      allowed: true,
    },
    {
      url: "/dashboard/deliverers",
      icon: RiMotorbikeFill,
      label: "Entregadores",
      allowed: true,
    },
    {
      url: "/dashboard/orders",
      icon: NotebookText,
      label: "Pedidos",
      allowed: true,
    },
    {
      url: "/dashboard/order-routing",
      icon: user.subscription?.plan === "PREMIUM" ? Route : Lock,
      label: "Roteirização de Pedidos",
      allowed: user.subscription?.plan === "PREMIUM",
    },
    {
      url: "/dashboard/combos",
      icon: ShoppingBasket,
      label: "Combos",
      allowed: true,
    },
    {
      url: "/dashboard/customers",
      icon: Users,
      label: "Clientes",
      allowed: true,
    },
    {
      url: "/dashboard/finances",
      icon: CircleDollarSign,
      label: "Financeiro",
      allowed: true,
    },
    {
      url: "/dashboard/delivery-areas",
      icon: MapPin,
      label: "Áreas de Entrega",
      allowed: true,
    },
    /*     {
      url: "/dashboard/receipts",
      icon: Printer,
      label: "Impressão de Comandas",
      allowed: true,
    }, */
    {
      url: "/dashboard/pixels",
      icon: ChartPie,
      label: "Pixels",
      allowed: true,
    },
    {
      url: "/dashboard/darius-pay",
      icon: TbCircleLetterD,
      label: "Darius Pay",
      allowed: true,
    },
    {
      url: "/dashboard/employees",
      icon: UserRoundCog,
      label: "Funcionários",
      allowed: true,
    },
  ];

  const accessibleItems =
    user.role === "EMPLOYEE" && user.employee?.permissions
      ? items.filter(
          (item) => user.employee?.permissions?.includes(item.label) ?? false
        )
      : items;

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
              {accessibleItems.map((item) => {
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
                  <SidebarMenuItem
                    className={cn(
                      !item.allowed &&
                        "cursor-not-allowed pointer-events-none text-error"
                    )}
                    key={item.label}>
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
