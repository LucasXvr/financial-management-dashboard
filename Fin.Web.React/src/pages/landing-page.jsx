import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

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
                  className="px-6 py-3 bg-green-600 dark:bg-blue-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Acessar Demonstração
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="/HomePage.png"
                alt="Dashboard Preview"
                className="rounded-lg shadow-xl dark:shadow-green-900/20 w-full"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x400/2F4F4F/FFFFFF?text=Dashboard+Preview";
                }}
              />
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
      <section className="py-16 bg-green-600 dark:bg-blue-500 text-white text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-4">Comece a organizar suas finanças agora!</h2>
          <p className="mb-6">Cadastre-se gratuitamente e tenha o controle total do seu dinheiro.</p>
          <form className="flex flex-col sm:flex-row justify-center gap-4">
            <input 
              type="email" 
              placeholder="Seu e-mail" 
              className="px-4 py-3 rounded-lg text-black w-full sm:w-auto"
            />
            <button 
              className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cadastre-se
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
