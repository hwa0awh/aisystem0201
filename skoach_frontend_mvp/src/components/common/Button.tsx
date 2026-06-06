import React from 'react';

/*버튼 컴포넌트 속성 인터페이스*/
interface ButtonProps {
  /*버튼 내부에 표시될 텍스트*/
  text: React.ReactNode; 
  /*클릭 이벤트 핸들러*/
  onClick?: () => void;
  /*버튼의 너비 조절*/
  width?: string; 
  className?: string;
}

/* 범용적으로 사용 가능한 공용 버튼 컴포넌트 */
export const Button: React.FC<ButtonProps> = ({ 
  text, 
  onClick, 
  width = 'w-60',
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        ${width}
        h-14 
        bg-black text-white 
        font-bold text-lg 
        rounded-2xl 
        shadow-md 
        transition-all 
        hover:bg-gray-800 hover:shadow-lg
        active:scale-95 
        flex items-center justify-center
        font-noto select-none cursor-pointer
        ${className}
      `}
    >
      {text}
    </button>
  );
};