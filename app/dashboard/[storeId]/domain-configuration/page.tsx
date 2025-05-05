import { DomainForm } from "@/app/_features/_user/_components/_settings/domain-form";
import { getDomain } from "@/app/_features/_user/_queries/get-domain";
import { auth } from "@/auth";
import Link from "next/link";

export default async function CustomDomainPage() {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const data = await getDomain(session.user.id);

  if (!data) {
    return <div>Erro ao carregar os dados</div>;
  }

  return (
    <div className="w-full">
      <DomainForm domain={data?.domain} />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Como Configurar seu Domínio
        </h1>
        <p className="mb-6 text-gray-600 text-center">
          Siga estas instruções para conectar seu domínio à nossa plataforma.
        </p>

        {/* Passo 1 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            1 - Acesse seu provedor de domínio
          </h2>
          <p className="text-gray-700">
            Entre no painel do seu provedor de domínio (GoDaddy, Namecheap,
            HostGator, etc.) e encontre a opção para **Gerenciamento de DNS**.
          </p>
        </div>

        {/* Passo 2 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            2 - Configure um Registro A
          </h2>
          <p className="text-gray-700 mb-2">
            Agora, crie um **Registro A** apontando para o endereço IP do nosso
            servidor.
          </p>
          <div className="bg-gray-100 p-3 rounded-md text-sm font-mono">
            <p>
              <strong>Tipo:</strong> A
            </p>
            <p>
              <strong>Nome/Host:</strong> @
            </p>
            <p>
              <strong>Valor (IP):</strong> 76.76.21.21
            </p>
            <p>
              <strong>TTL:</strong> 300 (ou Automático)
            </p>
          </div>
        </div>

        {/* Passo 3 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {"3 - (Opcional) Configure um Subdomínio  'www'"}
          </h2>
          <p className="text-gray-700 mb-2">
            Se quiser que o domínio **www.seusite.com** funcione, adicione
            também um **Registro A** ou **CNAME**.
          </p>
          <div className="bg-gray-100 p-3 rounded-md text-sm font-mono">
            <p>
              <strong>Tipo:</strong> CNAME
            </p>
            <p>
              <strong>Nome/Host:</strong> www
            </p>
            <p>
              <strong>Valor:</strong> seusite.com
            </p>
            <p>
              <strong>TTL:</strong> 300
            </p>
          </div>
        </div>

        {/* Passo 4 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            4 - Aguarde a propagação do DNS
          </h2>
          <p className="text-gray-700">
            A propagação do DNS pode levar de alguns minutos até **24 horas**.
            Você pode verificar o status em:
          </p>
          <Link
            href="https://www.whatsmydns.net/"
            target="_blank"
            className="text-blue-600 underline">
            Verificar DNS no whatsmydns.net
          </Link>
        </div>

        {/* Passo 5 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            5 - Adicione o domínio na nossa plataforma
          </h2>
          <p className="text-gray-700">
            Agora, vá até o **Painel de Controle** da sua conta e insira o seu
            domínio na seção de domínios personalizados.
          </p>
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-bold mt-8 mb-4">Dúvidas Frequentes</h2>

        <div className="space-y-4">
          <details className="bg-gray-100 p-3 rounded-md">
            <summary className="cursor-pointer font-medium">
              Quanto tempo leva para funcionar?
            </summary>
            <p className="mt-2 text-gray-700">
              Pode levar até **24 horas**, mas normalmente funciona em poucos
              minutos.
            </p>
          </details>

          <details className="bg-gray-100 p-3 rounded-md">
            <summary className="cursor-pointer font-medium">
              O que fazer se não funcionar?
            </summary>
            <p className="mt-2 text-gray-700">
              Verifique se os registros DNS estão corretos no
              <a
                href="https://www.whatsmydns.net/"
                target="_blank"
                className="text-blue-600 underline">
                {" "}
                WhatsMyDNS.net
              </a>
              .
            </p>
          </details>

          <details className="bg-gray-100 p-3 rounded-md">
            <summary className="cursor-pointer font-medium">
              Como usar um domínio diferente para minha loja?
            </summary>
            <p className="mt-2 text-gray-700">
              Basta seguir os mesmos passos e apontar um novo domínio para o
              **mesmo IP** do nosso servidor.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
