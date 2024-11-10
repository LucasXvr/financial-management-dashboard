import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, PieChart } from 'lucide-react';
import './dashboard.css';

const balanceData = [
    { month: 'Jan', balance: 5000 },
    { month: 'Feb', balance: 5600 },
    { month: 'Mar', balance: 6200 },
    { month: 'Apr', balance: 6100 },
    { month: 'May', balance: 6700 },
    { month: 'Jun', balance: 7300 },
  ];
  
  const expensesData = [
    { category: 'Moradia', amount: 1500 },
    { category: 'Alimentação', amount: 800 },
    { category: 'Transporte', amount: 400 },
    { category: 'Lazer', amount: 300 },
    { category: 'Saúde', amount: 200 },
  ];

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

function Dashboard () {
    return <div className="p-6">
    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Painel Principal</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card title="Saldo Atual" value="R$ 45.231,89" icon={DollarSign} percentage="+20,1%" />
      <Card title="Receita" value="R$ 5.231,89" icon={TrendingUp} percentage="+2,5%" />
      <Card title="Despesas" value="R$ 3.045,20" icon={CreditCard} percentage="+4,3%" isNegative />
      <Card title="Economia" value="R$ 2.186,69" icon={PieChart} percentage="+18,7%" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Saldo ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={balanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Despesas por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={expensesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="category" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="amount" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
}

export default Dashboard;