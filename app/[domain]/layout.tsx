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

  const data = await getCustomizationByDomain(domain);

  if (!data) {
    return <div>Domain not found</div>;
  }

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
