import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Bem-vindo ao Minhas Finanças</h1>
      <p className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">Gerencie suas finanças com facilidade e segurança.</p>
            
      <button
        onClick={() => navigate("/dashboard")}
        className="px-6 py-3 sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
      >
        Acessar Demonstração
      </button>
    </div>
  );
};

export default LandingPage;
