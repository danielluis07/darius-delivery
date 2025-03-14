import { ConfirmationCard } from "@/app/_features/_user/_components/_subscription/confirmation-card";

const ConfirmationPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ value: "BASIC" | "PREMIUM"; price: string }>;
}) => {
  const { value, price } = await searchParams;
  return (
    <div className="flex items-center justify-center h-full">
      <ConfirmationCard value={value} price={price} />
    </div>
  );
};

export default ConfirmationPage;
