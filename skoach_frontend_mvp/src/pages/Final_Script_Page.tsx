import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export default function Final_Script() {
  const navigate = useNavigate();

  // 실제로는 Chat에서 완성된 최종 대본 데이터를 state나 context로 받아와야 함

  return (
    <div className="h-full w-full flex flex-col items-center bg-white p-8 overflow-hidden">
    
      <div className="w-full max-w-6xl flex-1 border-2 border-black rounded-[40px] p-10 mb-8 bg-white shadow-sm overflow-y-auto">
        <h2 className="text-gray-400 mb-6 text-sm font-medium">최종 대본 확인</h2>
      </div>
      
      <div className="pb-4">
        <Button 
          text="완료" 
          className="px-24 py-4 text-xl rounded-2xl shadow-lg active:scale-95 transition-all"
          onClick={() => {
            navigate('/download-presentation');
          }} 
        />
      </div>
    </div>
  );
}