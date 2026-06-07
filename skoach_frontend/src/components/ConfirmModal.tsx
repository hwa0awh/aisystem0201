// components/ConfirmModal.tsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subTitle?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, subTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white p-8 rounded-4xl shadow-2xl max-w-sm w-full mx-4 text-center border border-gray-100 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-gray-50 text-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <HelpCircle size={24} />
        </div>
        
        <h3 className="text-base font-black text-gray-900 mb-2 whitespace-pre-line leading-relaxed">
          {title}
        </h3>
        {subTitle && <p className="text-xs font-bold text-gray-400 mb-6">{subTitle}</p>}
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 bg-[#F4F4F4] hover:bg-gray-200 text-gray-500 rounded-xl font-bold text-sm transition-colors active:scale-95"
          >
            다시 확인하기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3.5 bg-[#2D2D2D] hover:bg-black text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            네, 맞습니다
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;