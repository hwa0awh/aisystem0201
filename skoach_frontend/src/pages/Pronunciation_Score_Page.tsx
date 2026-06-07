// pages/PronunciationScorePage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RotateCcw, 
  ChevronRight, 
  Lock, 
  AlertCircle,   
} from 'lucide-react';

const PronunciationScorePage = () => {
  const navigate = useNavigate();
  
  // 테스트를 위해 유료 회원 여부 상태 (false일 때 잠금 표시됨)
  const [isPremium, setIsPremium] = useState(false);

  const handleUpgradeTest = () => {
    setIsPremium(true);
    alert("✨ [테스트 알림] 프리미엄 회원으로 전환되었습니다! 잠금 해제된 화면을 확인하세요.");
  };

  return (
    <div className="flex h-[calc(100vh-80px)] mt-20 bg-gray-50 text-gray-800 font-sans overflow-hidden select-none justify-center">
      
      {/* 가로폭 6xl 스케일 유지용 컨테이너 */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-6xl w-full px-6 sm:px-10">
        
        {/* 상단 헤더 */}
        <header className="flex justify-between items-center py-6 shrink-0 border-b border-gray-100">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">평가 결과 — AI 분석</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-bold hover:bg-gray-50 transition cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> 다시 테스트
            </button>
          </div>
        </header>

        {/* 대시보드 컨텐츠 */}
        <div className="flex-1 overflow-y-auto py-8 space-y-8">
          
          {/* [1] 최상단 점수 섹션 */}
          <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex items-center gap-10">
            {/* 원형 점수 */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center border-8 border-blue-500 rounded-full">
              <div className="text-center">
                <span className="text-4xl font-black text-gray-900">87</span>
                <span className="text-sm font-bold text-gray-400 block -mt-1">점</span>
              </div>
            </div>
            
            {/* 텍스트 정보 */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                총점 87점 — <span className="text-blue-600">우수</span>
              </h2>
              <p className="text-sm font-bold text-gray-400">원본 대본 대비 발음 정확도 분석 결과</p>
            </div>
          </section>

          {/* [2] 원본 vs 인식 텍스트 섹션 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                원본 vs 인식 텍스트
                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-black border border-blue-200">유료 전용</span>
              </h3>
            </div>

            {/* 💡 3번 섹션과 규격을 정교하게 맞춘 relative 카드 컨테이너 (p-8 부여) */}
            <div className="relative border border-gray-200 rounded-3xl bg-white p-8 shadow-sm">
              <div className="grid grid-cols-2 gap-8">
                {/* 왼쪽 텍스트 */}
                <div className="space-y-3">
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">원본 대본</div>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed min-h-16">
                    안녕하세요. 오늘 발표를... <br />
                    인공지능(AI) 기반의...
                  </p>
                </div>
                {/* 오른쪽 텍스트 (경계선 구분 추가) */}
                <div className="space-y-3 border-l border-gray-100 pl-8">
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">인식 텍스트</div>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed min-h-16">
                    안녕하세요. 오눌 발표를... <br />
                    <span className="text-rose-500 underline decoration-red-300">인공지준(AI) 가반의</span>...
                  </p>
                </div>
              </div>

              {/* 유료 블러 락 레이어 */}
              {isPremium && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[6px] flex flex-col items-center justify-center p-6 text-center rounded-3xl animate-in fade-in duration-300">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <Lock className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-black text-gray-900 mb-4">
                    Pro 회원만 원본 vs 인식 텍스트 비교를 확인할 수 있습니다
                  </p>
                  <button 
                    type="button"
                    onClick={handleUpgradeTest}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-100 cursor-pointer"
                  >
                    프리미엄 요금제 구독하기 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* [3] 상세 피드백 섹션 */}
          <section className="space-y-4">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              상세 피드백
              <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-black border border-blue-200">유료 전용</span>
            </h3>

            {/* 💡 2번 섹션과 완벽히 호응하는 relative 카드 컨테이너 (p-8 및 rounded-3xl 일치) */}
            <div className="relative border border-gray-200 rounded-3xl bg-white p-8 shadow-sm">
              <div className="grid grid-cols-1 gap-4">
                {/* 피드백 항목 1 */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-start gap-4 shadow-xs">
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-red-600">개선 필요</span>
                      <span className="text-xs text-gray-300">|</span>
                      <span className="text-sm font-black text-gray-900">인공지능 발음</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 leading-relaxed min-h-4xl">
                      '인공지능'이라는 발음: 받침 <span className="text-red-500 font-black">ㄴ</span> 주의, 정확도 62% — 연음 권장 5회
                    </p>
                  </div>
                </div>
              </div>

              {/* 유료 블러 락 레이어 */}
              {isPremium && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[6px] flex flex-col items-center justify-center p-6 text-center rounded-3xl animate-in fade-in duration-300">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
                    <Lock className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-black text-gray-900 mb-4">
                    Pro 회원만 AI 상세 피드백을 확인할 수 있습니다
                  </p>
                  <button 
                    type="button"
                    onClick={handleUpgradeTest}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-100 cursor-pointer"
                  >
                    프리미엄 요금제 구독하기 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PronunciationScorePage;