import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, PieChart } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5110/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

function Dashboard() {

  // Estados para armazenar os dados da API
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [balanceOverTime, setBalanceOverTime] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para armazenar as porcentagens de variação
  const [incomePercentage, setIncomePercentage] = useState("+0.0%");
  const [expensesPercentage, setExpensesPercentage] = useState("+0.0%");
  const [savingsPercentage, setSavingsPercentage] = useState("+0.0%");

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para calcular a variação percentual
  const calculatePercentage = (current, previous) => {
    if (previous === 0) return "+100%";
    const percentage = ((current - previous) / Math.abs(previous)) * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  // Obter dados iniciais ao carregar o componente
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Configurar o período para análise (mês atual)
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Obter dados do mês anterior para comparação
        const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        const prevStartDateStr = prevMonth.toISOString().split('T')[0];
        const prevEndDateStr = prevMonthEnd.toISOString().split('T')[0];

        // Chamadas paralelas à API usando axios
        const [
          balanceResponse,
          incomeResponse,
          expensesResponse,
          savingsResponse,
          balanceOverTimeResponse,
          expensesByCategoryResponse,
          prevIncomeResponse,
          prevExpensesResponse
        ] = await Promise.all([
          api.get('/financial-reports/balance'),
          api.get(`/financial-reports/income?startDate=${startDateStr}&endDate=${endDateStr}`),
          api.get(`/financial-reports/expenses?startDate=${startDateStr}&endDate=${endDateStr}`),
          api.get(`/financial-reports/savings?startDate=${startDateStr}&endDate=${endDateStr}`),
          api.get('/financial-reports/balance-over-time?months=6'),
          api.get(`/financial-reports/expenses-by-category?startDate=${startDateStr}&endDate=${endDateStr}`),
          api.get(`/financial-reports/income?startDate=${prevStartDateStr}&endDate=${prevEndDateStr}`),
          api.get(`/financial-reports/expenses?startDate=${prevStartDateStr}&endDate=${prevEndDateStr}`)
        ]);

        // Processar as respostas (com axios, os dados já estão na propriedade data)
        const balance = balanceResponse.data;
        const income = incomeResponse.data;
        const expenses = expensesResponse.data;
        const savings = savingsResponse.data;
        const balanceData = balanceOverTimeResponse.data;
        const expensesData = expensesByCategoryResponse.data;
        const prevIncome = prevIncomeResponse.data;
        const prevExpenses = prevExpensesResponse.data;

        // Calcular a economia do mês anterior para comparação
        const prevSavings = prevIncome - Math.abs(prevExpenses);

        // Atualizar os estados com os dados da API
        setCurrentBalance(balance);
        setTotalIncome(income);
        setTotalExpenses(Math.abs(expenses)); // Convertendo para valor positivo para exibição
        setTotalSavings(savings);

        // Formatar dados para os gráficos
        setBalanceOverTime(balanceData.map(item => ({
          month: item.month,
          balance: item.balance
        })));

        setExpensesByCategory(expensesData.map(item => ({
          category: item.category,
          amount: Math.abs(item.amount) // Convertendo para valor positivo para exibição
        })));

        // Variáveis para armazenar as percentagens de variação
        const incomePercentage = calculatePercentage(income, prevIncome);
        const expensesPercentage = calculatePercentage(Math.abs(expenses), Math.abs(prevExpenses));
        const savingsPercentage = calculatePercentage(savings, prevSavings);

        // Atualizar variáveis locais para usar nos cards
        setIncomePercentage(incomePercentage);
        setExpensesPercentage(expensesPercentage);
        setSavingsPercentage(savingsPercentage);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError("Não foi possível carregar os dados do dashboard. Por favor, tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Componente Card reutilizável
  const Card = ({ title, value, icon: Icon, percentage, isNegative = false }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        <Icon size={24} className="text-gray-400" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className={`text-sm ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
        {percentage}
      </p>
    </div>
  );

  // Exibir mensagem de carregamento
  if (isLoading) {
    return <div className="p-6 text-center">Carregando dados do dashboard...</div>;
  }

  // Exibir mensagem de erro
  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return <div className="p-6">
    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Painel Principal</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card title="Saldo Atual" value={formatCurrency(currentBalance)} icon={DollarSign} percentage="+20,1%" />
      <Card title="Receita" value={formatCurrency(totalIncome)} icon={TrendingUp} percentage="+2,5%" />
      <Card title="Despesas" value={formatCurrency(totalExpenses)} icon={CreditCard} percentage="+4,3%" isNegative />
      <Card title="Economia" value={formatCurrency(totalSavings)} icon={PieChart} percentage="+18,7%" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Saldo ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={balanceOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Despesas por Categoria</h3>
        {expensesByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">Nenhum dado disponível</p>
        )}
      </div>
    </div>
  </div>
}

export default Dashboard;