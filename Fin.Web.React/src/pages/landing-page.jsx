import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
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
                  className="px-6 py-3 sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
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
    </div>
  );
};

export default LandingPage;
