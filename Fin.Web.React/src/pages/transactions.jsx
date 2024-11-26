import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import AddTransactionModal from '../components/addTransactionModal';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: 1, description: 'Supermercado', date: '2023-06-15', amount: -250 },
    { id: 2, description: 'Salário', date: '2023-06-01', amount: 5000 },
    { id: 3, description: 'Aluguel', date: '2023-06-05', amount: -1200 },
    { id: 4, description: 'Freelance', date: '2023-06-20', amount: 1500 },
    { id: 5, description: 'Conta de luz', date: '2023-06-10', amount: -150 },
  ]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTransaction = (newTransaction) => {
    setTransactions([
      ...transactions,
      { ...newTransaction, id: transactions.length + 1 }
    ]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Transações
      </h2>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 justify-start">
        {/* Input de Pesquisa */}
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar transações..."
            className="pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Seletor */}
        <select
          name="transactionFilter"
          id="transactionFilter"
          className="pl-3 pr-10 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
          <option value="all">Todas</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>

        {/* Botão Adicionar */}
        <button
          className="bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-800 dark:hover:bg-blue-600 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} className="mr-2" />
          Adicionar
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                  {transaction.description}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : '-'} R$ {Math.abs(transaction.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
};

export default Transactions;