import React from 'react';

const budgetItems = [
  { category: 'Alimentação', spent: 800, total: 1000 },
  { category: 'Transporte', spent: 300, total: 500 },
  { category: 'Moradia', spent: 1500, total: 1500 },
  { category: 'Lazer', spent: 400, total: 300 },
  { category: 'Saúde', spent: 200, total: 400 },
];

const Budget = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Orçamento Mensal</h2>
      <div className="space-y-6">
        {budgetItems.map((item) => (
          <div key={item.category} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{item.category}</span>
              <span className="text-gray-600 dark:text-gray-400">
                R$ {item.spent} / R$ {item.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className={`h-2.5 rounded-full ${
                  item.spent > item.total ? 'bg-red-600' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min((item.spent / item.total) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm">
              {item.spent > item.total ? (
                <span className="text-red-500">Excedido em R$ {(item.spent - item.total).toFixed(2)}</span>
              ) : (
                <span className="text-green-500">Restante: R$ {(item.total - item.spent).toFixed(2)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Budget;