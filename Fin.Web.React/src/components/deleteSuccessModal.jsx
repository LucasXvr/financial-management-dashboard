import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const DeleteSuccessModal = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2 size={48} className="text-green-500" />
          <p className="text-center text-gray-700 dark:text-gray-200 text-lg">
            {title} Excluído com sucesso!
          </p>
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

export default DeleteSuccessModal; 