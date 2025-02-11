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
} from "@/components/ui/sidebar";
import {
  ChevronUp,
  House,
  Lock,
  User2,
  FolderClosed,
  Paintbrush,
  Truck,
  NotebookText,
  Route,
  ShoppingBasket,
  Users,
  CircleDollarSign,
  MapPin,
  Printer,
  ChartPie,
  CreditCard,
  Globe,
  Sandwich,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutButton } from "@/components/logout-button";
import Image from "next/image";

const items = [
  {
    url: "/dashboard/user",
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
    url: "#",
    icon: Globe,
    label: "Domínio",
  },
  {
    url: "/dashboard/customization",
    icon: Paintbrush,
    label: "Personalização",
  },
  {
    url: "#",
    icon: Truck,
    label: "Entregadores",
  },
  {
    url: "/dashboard/orders",
    icon: NotebookText,
    label: "Pedidos",
  },
  {
    url: "#",
    icon: Route,
    label: "Roteirização de Pedidos",
  },
  {
    url: "#",
    icon: ShoppingBasket,
    label: "Combos",
  },
  {
    url: "#",
    icon: Users,
    label: "Clientes",
  },
  {
    url: "#",
    icon: CircleDollarSign,
    label: "Financeiro",
  },
  {
    url: "#",
    icon: MapPin,
    label: "Área de Entrega",
  },
  {
    url: "#",
    icon: Printer,
    label: "Impressão de Comandas",
  },
  {
    url: "#",
    icon: ChartPie,
    label: "Pixels",
  },
  {
    url: "#",
    icon: CreditCard,
    label: "Formas de Pagamento",
  },
];

export function UserSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Image
          src="/darius.png"
          width={180}
          height={180}
          alt="logo"
          className="mx-auto"
          priority
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
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
                  <User2 /> Daniel
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <Lock />
                  <span>Mudar Senha</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
