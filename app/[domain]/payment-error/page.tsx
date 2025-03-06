const PaymentErrorPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ error?: string; orderId?: string }>;
}) => {
  const { domain } = await params;
  const { error, orderId } = await searchParams;

  console.log(domain);
  console.log(error);
  console.log(orderId);
  return (
    <div>
      <p>payment error</p>
    </div>
  );
};

export default PaymentErrorPage;
