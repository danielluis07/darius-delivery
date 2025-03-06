import { getCustomizationByDomain } from "@/app/_features/_customer/_queries/get-customization";
import { cn } from "@/lib/utils";

export default async function DomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const domain = (await params).domain;

  console.log("domain", domain);

  const data = await getCustomizationByDomain(domain);

  console.log("data", data);

  return (
    <main
      className={cn(
        "size-full",
        data?.templateName === "TEMPLATE_1" && "bg-template1"
      )}>
      {children}
    </main>
  );
}
