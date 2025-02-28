import Link from "next/link";

const AuthErrorPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) => {
  const error = (await searchParams).error;

  if (error === "BlockedUser") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm text-center">
          <h1 className="text-xl font-semibold text-red-600">Acesso Negado</h1>
          <p className="mt-2 text-gray-700">
            Você foi bloqueado pelo administrador da plataforma.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
            Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    );
  }

  return <div>error</div>;
};

export default AuthErrorPage;
