import React, { useEffect, useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2 size={48} className="text-green-500" />
          <p className="text-center text-gray-700 dark:text-gray-200 text-lg">{message}</p>
          <button
            onClick={onClose}
            className="bg-green-600 dark:bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const AddCategoryModal = ({ isOpen, onClose, onAddCategory, category, onEditCategory }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleClose = () => {
    onClose();
    setError(null);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    try {
      if (category) {
        const response = await api.put(`/v1/categories/${category.id}`, {
          title,
          description,
        });
        onEditCategory(response.data.data);
        setSuccessMessage('Categoria editada com sucesso!');
      }
      else {
        const response = await api.post('/v1/categories', {
          title,
          description,
        });
        onAddCategory(response.data.data);
        setSuccessMessage('Categoria adicionada com sucesso!');
      }      
      
      setTitle('');
      setDescription('');
      handleClose();
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Erro ao salvar categoria. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{category ? 'Editar Categoria' : 'Adicionar Categoria'}</h2>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
                <X size={20} className="text-red-500" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Descrição (Opcional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-green-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Salvando...
                    </>
                  ) : category ? 'Editar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleSuccessClose} 
        message={successMessage}
      />
    </>
  );
};

export default AddCategoryModal;
