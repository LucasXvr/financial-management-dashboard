import React, { useEffect, useState } from 'react';
import AddCategoryModal from '../components/addCategoryModal';
import { Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/v1/categories', {
        params: {
          pageNumber: 1,
          pageSize: 25,
        }
      });
      setCategories(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erro ao carregar categorias. Por favor, tente novamente.');
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = (newCategory) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);
  };

  const handleEditCategory = (updatedCategory) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) => 
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    try {
      await api.delete(`/v1/categories/${categoryId}`);
      setCategories(categories.filter(c => c.id !== categoryId));
      setError(null);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erro ao excluir categoria. Por favor, tente novamente.');
      }
    }
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  }

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Gerenciar Categorias
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-grow">
          <input
            type="text"         
            value={searchTerm}   
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar categorias..."
            className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
        </div>

        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="flex-grow sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
        >
          Adicionar Categoria
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
        <ul>
          {filteredCategories.map((category) => (
            <li key={category.id} className="flex justify-between items-center py-2 px-4 border-b">
              <span className="text-gray-800 dark:text-gray-200">{category.title}</span>
              <div className="flex space-x-3">
                <button
                    onClick={() => handleOpenEditModal(category)}
                    className="p-2 rounded-md bg-green-100 text-green-600 hover:bg-green-200 dark:bg-blue-100 dark:text-blue-600 dark:hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-100 dark:text-red-600 dark:hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> 
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        category={editingCategory}
      />      
    </div>
  );
};

export default Categories;