import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Bar, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Legend } from "recharts";

const LandingPage = () => {
  const navigate = useNavigate();

  const balanceData = [
    { month: 'Jan', balance: 5000 },
    { month: 'Fev', balance: 5800 },
    { month: 'Mar', balance: 6200 },
    { month: 'Abr', balance: 6000 },
    { month: 'Mai', balance: 6600 },
    { month: 'Jun', balance: 7200 },
  ];

  const expensesData = [
    { name: 'Moradia', amount: 1500 },
    { name: 'Alimentação', amount: 800 },
    { name: 'Transporte', amount: 400 },
    { name: 'Lazer', amount: 300 },
    { name: 'Saúde', amount: 200 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold text-green-950 dark:text-white mb-6">
                Controle suas finanças com simplicidade e eficiência
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Acabe com o estresse financeiro. Nossa plataforma facilita o acompanhamento de 
                despesas, estabelecimento de orçamentos e visualização clara das suas finanças.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 bg-green-600 dark:bg-blue-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-blue-600 transition-all duration-300"
                >
                  Acessar Demonstração
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
            <Card className="rounded-lg shadow-xl dark:shadow-green-900/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Receita</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">R$ 5.231,89</p>
                    <span className="text-xs text-green-500">+2,5%</span>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Despesas</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">R$ 3.045,20</p>
                    <span className="text-xs text-red-500">+4,3%</span>
                  </div>
                </div>                         
                <div className="h-40 mb-12">
                  <p className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-200">Saldo ao Longo do Tempo</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={balanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" tick={{fontSize: 10}} />
                      <YAxis tick={{fontSize: 10}} />
                      <Tooltip />
                      <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-40 mb-6">
                  <p className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-200">Despesas por Categoria</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expensesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold text-green-950 dark:text-white mb-8">Recursos Principais</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Controle de Gastos", desc: "Monitore cada despesa e evite surpresas no final do mês." },
              { title: "Relatórios Detalhados", desc: "Tenha uma visão clara de suas finanças em gráficos interativos." },
              { title: "Segurança Garantida", desc: "Seus dados são protegidos com criptografia de ponta." }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-300">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold text-green-950 dark:text-white mb-8">O que dizem nossos usuários</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: "João Silva", feedback: "Esse app transformou minha vida financeira!" },
              { name: "Ana Pereira", feedback: "Simples e intuitivo. Recomendo para todos!" }
            ].map((testimonial, index) => (
              <div key={index} className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md">
                <p className="italic text-gray-600 dark:text-gray-300">"{testimonial.feedback}"</p>
                <h4 className="mt-4 font-semibold text-green-800 dark:text-green-300">- {testimonial.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-50 dark:bg-gray-800/50 transition-colors duration-300">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            Pronto para transformar suas finanças?
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-gray-800 dark:text-gray-200">
            Junte-se a milhares de pessoas que já conquistaram estabilidade financeira com nossa plataforma.
          </p>
          <Link to="/dashboard">
            <button size="lg" className="px-6 py-3 bg-green-600 dark:bg-blue-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-blue-600 transition-all duration-300">
              Começar Gratuitamente
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-950 dark:bg-gray-800 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Minhas Finanças</h3>
              <p className="text-gray-300">
                Transformando a maneira como as pessoas gerenciam suas finanças desde 2023.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/dashboard" className="hover:text-green-300">Dashboard</Link></li>
                <li><Link to="/transactions" className="hover:text-green-300">Transações</Link></li>
                <li><Link to="/budget" className="hover:text-green-300">Orçamento</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-green-300">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-green-300">Blog</a></li>
                <li><a href="#" className="hover:text-green-300">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-green-300">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-green-300">Contato</a></li>
                <li><a href="#" className="hover:text-green-300">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>© 2023 MF Finance. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
