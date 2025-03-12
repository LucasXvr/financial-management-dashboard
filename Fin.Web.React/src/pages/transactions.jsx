import React, { useState } from 'react';
import { Plus, Search, Filter, Link } from 'lucide-react';
import AddTransactionModal from '../components/addTransactionModal';
import AddCategoryModal from '../components/addCategoryModal';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [transactions, setTransactions] = useState([
    { id: 1, description: 'Supermercado', category: 'Alimentação', date: '2023-06-15', amount: -250 },
    { id: 2, description: 'Salário', category: 'Renda', date: '2023-06-01', amount: 5000 },
    { id: 3, description: 'Aluguel', category: 'Moradia', date: '2023-06-05', amount: -1200 },
    { id: 4, description: 'Freelance', category: 'Renda Extra', date: '2023-06-20', amount: 1500 },
    { id: 5, description: 'Conta de luz', category: 'Contas Fixas', date: '2023-06-10', amount: -150 },
  ]);

  const categories = ['Alimentação', 'Renda', 'Moradia', 'Renda Extra', 'Contas Fixas'];

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || transaction.category === categoryFilter)
  );

  const handleAddTransaction = (newTransaction) => {
    setTransactions([
      ...transactions,
      { ...newTransaction, id: transactions.length + 1 }
    ]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Transações
      </h2>
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Pesquisar transações..."
            className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <div className="flex gap-4">
          <div className="relative flex-grow sm:flex-grow-0">
            <select
              name="transactionFilter"
              id="transactionFilter"
              className="w-full appearance-none pl-3 pr-10 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>

          <button
            className="flex-grow sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Plus size={20} className="mr-2" />
            Adicionar
          </button>

          {showMenu && (
            <div className="absolute bg-white dark:bg-gray-700 shadow-lg rounded-md mt-2 w-48 z-10">
              <button
                className="block w-full text-left px-4 py-2 bg-green-600 dark:bg-blue-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
                onClick={() => {
                  setIsTransactionModalOpen(true);
                  setShowMenu(false);
                }}
              >
                Nova Transação
              </button>
              <button
                className="block w-full text-left px-4 py-2 bg-green-600 dark:bg-blue-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
                onClick={() => {
                  setIsCategoryModalOpen(true);
                  setShowMenu(false);
                }}
              >
                Nova Categoria
              </button>
            </div>
          )}

          <button
            onClick={() => window.location.href = '/categories'}
            className="flex-grow sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
          >
            Gerenciar Categorias
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
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
                Categoria
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {transaction.category}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
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
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};

export default Transactions;
