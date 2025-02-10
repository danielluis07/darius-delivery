import { DrawerProvider } from "@/providers/drawer-provider";
import { getCustomizationByDomain } from "@/app/_features/_customer/_queries/get-customization";
import { cn } from "@/lib/utils";

export default async function SubdomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const subdomain = (await params).subdomain;

  const data = await getCustomizationByDomain(subdomain);

  return (
    <main
      className={cn(
        "size-full",
        data?.templateName === "TEMPLATE_1" && "bg-template1"
      )}>
      <DrawerProvider />
      {children}
    </main>
  );
}
