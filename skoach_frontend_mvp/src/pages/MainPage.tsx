import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';

export default function MainPage() {
  const navigate = useNavigate(); 

  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center gap-12 pb-20">
        <Card 
          title="대본 생성" 
          description="AI가 발표 대본을 생성해줍니다."
          icon="📄"
        >
          <div className="flex flex-col gap-3 w-full mt-2">
            <button 
              onClick={() => navigate('/ppt-upload')}
              className="w-full py-4 rounded-2xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-all cursor-pointer active:scale-95"
            >
              PPT 업로드 & 가이드라인 입력
            </button>
            
            <button 
              onClick={() => navigate('/guideline-only')}
              className="w-full py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all cursor-pointer active:scale-95"
            >
              가이드라인만 입력
            </button>
          </div>
        </Card>

        <Card 
          title="발표 코칭" 
          description="녹음된 파일을 분석하여 맞춤형 피드백을 제공합니다."
          icon="👤"
          onClick={() => navigate('/script-upload')}
        />
      </main>
    </div>
  );
}