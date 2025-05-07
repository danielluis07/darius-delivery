import { ResetPasswordForm } from "../_components/reset-password-form";

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) => {
  const { token } = await searchParams;

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <ResetPasswordForm token={token} />
    </div>
  );
};

export default ResetPasswordPage;
