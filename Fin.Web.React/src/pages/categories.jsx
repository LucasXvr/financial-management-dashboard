import React, { useState } from 'react';

const Categories = () => {
  const [categories, setCategories] = useState(['Alimentação', 'Renda', 'Moradia', 'Renda Extra', 'Contas Fixas']);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    setCategories([...categories, newCategory]);
    setNewCategory('');
  };

  const handleDeleteCategory = (category) => {
    setCategories(categories.filter(c => c !== category));
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Gerenciar Categorias
      </h2>

      <div className="mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nova Categoria"
          className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        />
        <button
          onClick={handleAddCategory}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Adicionar Categoria
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
        <ul>
          {categories.map((category, index) => (
            <li key={index} className="flex justify-between items-center py-2 px-4 border-b">
              <span className="text-gray-800 dark:text-gray-200">{category}</span>
              <button
                onClick={() => handleDeleteCategory(category)}
                className="text-red-500 hover:text-red-700"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Categories;