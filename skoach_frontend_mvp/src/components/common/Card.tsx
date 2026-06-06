/*카드 컴포넌트 속성 인터페이스*/
interface CardProps {
  /*카드 상단에 표시될 텍스트*/
  title: string;
  /*카드 아래에 표시될 설명*/
  description?: string;
  /*카드에 표시될 아이콘*/
  icon?: React.ReactNode;
  /*현재 카드가 선택된 상태인지 여부*/
  isActive?: boolean;
  /*카드 클릭 이벤트 핸들러*/
  onClick?: () => void;
  /* 카드 내부에 삽입될 추가 요소 */
  children?: React.ReactNode;
}

/* 카드 레이아웃 컴포넌트*/
export const Card = ({ title, description, icon, isActive, onClick, children }: CardProps) => {
  return (
    <div 
      onClick={onClick} 
      className={`
        flex flex-col items-center justify-center 
        w-96 h-125 
        border-2 rounded-[40px] 
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${isActive 
          ? 'border-black bg-gray-50 shadow-2xl scale-105' 
          : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-xl hover:-translate-y-2'}
      `}
    >
      <div className="text-9xl mb-10 transition-transform duration-300">
        {icon}
      </div>

      <h3 className="text-3xl font-black mb-6">{title}</h3>

      {description && (
        <p className="text-base text-center text-gray-400 px-10 leading-relaxed break-keep">
          {description}
        </p>
      )}

      {children && (
        <div className="mt-8 w-full px-10">
          {children}
        </div>
      )}
    </div>
  );
};