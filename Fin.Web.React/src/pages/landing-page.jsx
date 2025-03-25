import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Financial Management</h1>
      <p className="text-lg mb-6">Gerencie suas finanças com facilidade e segurança.</p>
      
      <button 
        onClick={() => navigate("/dashboard")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition"
      >
        Acessar Demonstração
      </button>
    </div>
  );
};

export default LandingPage;
