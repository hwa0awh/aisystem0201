// components/EditModal.tsx
import React, { useState } from 'react';
import { X, Edit3 } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  initialContent: string;
  initialTime: string;
  initialStyle: string;
  onClose: () => void;
  onApply: (updatedData: { content: string; }) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  initialContent,
  onClose,
  onApply,
}) => {
  // 부모에게 받은 초기값을 로컬 상태로 관리 (취소 시 복구 가능하도록)
  const [content, setContent] = useState(initialContent);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({ content});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden mx-4 animate-in zoom-in-95 duration-200">
        
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold">대본 편집</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 space-y-6">
          {/* 대본 직접 편집 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">대본 직접 편집</label>
            <textarea
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none resize-none text-sm leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          
        {/* 모달 푸터 */}
        <div className="flex gap-3 p-6 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 border border-gray-300 bg-white rounded-xl font-bold hover:bg-gray-50 transition active:scale-95"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 bg-[#2D2D2D] text-white rounded-xl font-bold hover:bg-black transition shadow-md active:scale-95"
          >
            적용 
          </button> 
        </div>
      </div>
    </div>
  </div>
  );
};

export default EditModal;