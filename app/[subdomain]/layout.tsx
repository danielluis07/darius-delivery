import { getUserByDomain } from "../_features/_user/_queries/_users/get-user";

export default async function SubdomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const subdomain = (await params).subdomain;

  const data = await getUserByDomain(subdomain);

  console.log("User data:", data);

  // function to get the user by subdomain

  return <main className="w-full">{children}</main>;
}
