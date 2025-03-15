import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const AddCategoryModal = ({ isOpen, onClose, onAddCategory, category, onEditCategory }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setDescription(category.description || '');
    }
    else {
      setTitle('');
      setDescription('');
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (category) {
        const response = await axios.put(`http://localhost:5110/v1/categories/${category.id}`, {
          title,
          description,
        });
        onEditCategory(response.data.data);
      }
      else {
        const response = await axios.post('http://localhost:5110/v1/categories', {
          userId: '123', // 🔹 Mock temporário do usuário
          title,
          description,
        });
        onAddCategory(response.data.data);
      }      
            
      setTitle('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      alert('Erro ao adicionar categoria');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{category ? 'Editar Categoria' : 'Adicionar Categoria'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Descrição (Opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-grow sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
            >
              {loading ? 'Salvando...' : category ? 'Editar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
