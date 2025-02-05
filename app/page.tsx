import Link from "next/link";
import {
  CircleCheck,
  LogIn,
  Store,
  UserRoundPlus,
  WalletMinimal,
  Map,
} from "lucide-react";
import { MobileMenu } from "@/components/mobile-menu";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="bg-gray-50 text-gray-800">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            Darius Delivery 🚀
          </h1>

          <div className="md:hidden">
            <MobileMenu />
          </div>

          <nav className="hidden md:flex gap-4">
            <Link
              href="#"
              className="text-primary hover:text-secondary transition">
              Início
            </Link>
            <Link
              href="#planos"
              className="text-primary hover:text-secondary transition">
              Planos
            </Link>
            <Link
              href="#vantagens"
              className="text-primary hover:text-secondary transition">
              Vantagens
            </Link>
          </nav>

          <div className="hidden md:flex gap-3">
            <Link href="/auth/sign-in">
              <Button>
                <LogIn className="text-sm" /> Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="secondary">
                <UserRoundPlus /> Registrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-primary text-white text-center py-20">
        <h1 className="text-4xl font-bold mb-4">
          Darius Delivery - Feito de Dono para Dono!
        </h1>
        <p className="text-lg mb-6">
          O sistema que você precisava para gerenciar seu delivery de forma
          fácil e eficiente.
        </p>
        <Link
          href="#planos"
          className="bg-secondary text-primary px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition">
          Conheça Nossos Planos
        </Link>
      </section>

      <section id="vantagens" className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">
          Vantagens do Nosso Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="flex justify-center">
              <Map className="text-4xl text-primary mb-4" />
            </div>
            <h3 className="text-2xl font-semibold text-primary mb-3">
              Otimização de Pedidos
            </h3>
            <p>
              Roteirização inteligente para agilizar entregas e reduzir custos.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="flex justify-center">
              <Store className="text-4xl text-primary mb-4" />
            </div>
            <h3 className="text-2xl font-semibold text-primary mb-3">
              Templates Personalizáveis
            </h3>
            <p>
              Crie sua loja online do seu jeito com nossos modelos exclusivos.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="flex justify-center">
              <WalletMinimal className="text-4xl text-primary mb-4" />
            </div>
            <h3 className="text-2xl font-semibold text-primary mb-3">
              Gestão Financeira Completa
            </h3>
            <p>
              Controle total do seu caixa, fluxo de pedidos e relatórios
              financeiros.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary text-primary text-center py-12 px-4">
        <h2 className="text-3xl font-bold mb-4">
          Pronto para Transformar Seu Delivery?
        </h2>
        <p className="text-lg mb-6">
          Experimente o Darius Delivery agora e veja a diferença na gestão do
          seu negócio.
        </p>
        <Button>Faça um Teste Grátis 🚀</Button>
      </section>

      <section id="planos" className="bg-gray-100 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Compare Nossos Planos
        </h2>
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-4 border bg-primary text-white">Recursos</th>
                <th className="p-4 border bg-primary text-white">Básico</th>
                <th className="p-4 border bg-secondary text-primary">Pro</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="p-4 border">Site com sua marca</td>
                <td className="p-4 border">
                  <CircleCheck className="text-green-500 text-2xl" />
                </td>
                <td className="p-4 border">
                  <CircleCheck className="text-green-500 text-2xl" />
                </td>
              </tr>
              <tr>
                <td className="p-4 border">Gerenciamento de pedidos</td>
                <td className="p-4 border">
                  <CircleCheck className="text-green-500 text-2xl" />
                </td>
                <td className="p-4 border">
                  <CircleCheck className="text-green-500 text-2xl" />
                </td>
              </tr>
              <tr>
                <td className="p-4 border">Controle de caixa</td>
                <td className="p-4 border">
                  <CircleCheck className="text-green-500 text-2xl" />
                </td>
                <td className="p-4 border">
                  <CircleCheck className="text-green-500 text-2xl" />
                </td>
              </tr>
              <tr>
                <td className="p-4 border">Roteirização de entrega</td>
                <td className="p-4 border">
                  <CircleCheck className="text-[var(--gray-check)] text-2xl" />
                </td>
                <td className="p-4 border">
                  <CircleCheck className="text-green-500 text-2xl" />
                </td>
              </tr>
              <tr>
                <td className="p-4 border">Controle financeiro</td>
                <td className="p-4 border">
                  <CircleCheck className="text-[var(--gray-check)] text-2xl" />
                </td>
                <td className="p-4 border">
                  <CircleCheck className="text-green-500 text-2xl" />
                </td>
              </tr>
              <tr>
                <td className="p-4 border">Atendimento por IA</td>
                <td className="p-4 border">
                  <CircleCheck className="text-[var(--gray-check)] text-2xl" />
                </td>
                <td className="p-4 border">
                  <CircleCheck className="text-green-500 text-2xl" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer className="bg-primary text-white text-center py-6">
        <p>&copy; 2025 Darius Delivery - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
