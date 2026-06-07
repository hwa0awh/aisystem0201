// components/Toast.tsx
import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface ToastProps {
  isOpen: boolean;
  type?: 'error' | 'success' | 'info';
  title?: string;
  messages: string[];
  onClose: () => void;
  autoCloseDuration?: number; // 자동으로 닫히는 시간 (기본값 설정 가능)
}

const Toast: React.FC<ToastProps> = ({
  isOpen,
  type = 'error',
  title,
  messages,
  onClose,
  autoCloseDuration,
}) => {
  // 사용자가 autoCloseDuration(밀리초)을 설정하면 그 이후 자동으로 닫히는 기능
  useEffect(() => {
    if (isOpen && autoCloseDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDuration, onClose]);

  if (!isOpen) return null;

  // 타입별 디자인 테마 정의
  const theme = {
    error: {
      bg: 'bg-white border-red-200',
      iconBg: 'bg-red-50 text-red-500',
      title: '설정을 완성해주세요',
    },
    success: {
      bg: 'bg-white border-green-200',
      iconBg: 'bg-green-50 text-green-500',
      title: '성공 완료',
    },
    info: {
      bg: 'bg-white border-blue-200',
      iconBg: 'bg-blue-50 text-blue-500',
      title: '안내 알림',
    },
  };

  const currentTheme = theme[type];

  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 border rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200 ${currentTheme.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${currentTheme.iconBg}`}>
            {type === 'error' && <AlertCircle size={20} />}
            {type === 'success' && <CheckCircle size={20} />}
            {type === 'info' && <Info size={20} />}
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 mb-1.5">
              {title || currentTheme.title}
            </h4>
            <ul className="space-y-1">
              {messages.map((msg, index) => (
                <li key={index} className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full shrink-0 ${type === 'error' ? 'bg-red-400' : 'bg-blue-400'}`} />
                  {msg}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-300 hover:text-gray-500 transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;