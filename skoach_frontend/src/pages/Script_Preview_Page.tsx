import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Zap, Sliders, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingPage } from '../components/Loading';

const Script_Preview_Page: React.FC = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateScript = () => {
    setIsLoading(true); // 로딩 화면 켜기

    setTimeout(() => {
      setIsLoading(false); // 로딩 꺼주기
      navigate('/script-generate'); // 진짜 대본 결과 페이지로 이동
    }, 10000); 
  };

  // 5. 로딩 상태일 때는 메인 화면 대신 전체 화면 로딩창 가로채기 발동
  if (isLoading) {
    return <LoadingPage type="SCRIPT_GENERATE" />;
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-25 pb-12 px-4 sm:px-8 font-sans selection:bg-blue-100">
      <div className="max-w-7xl mx-auto">
        
        {/* --- 1. 중앙 스텝 인디케이터 --- */}
        <div className="flex items-center justify-center gap-4 sm:gap-12 mb-16 pt-8">
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center text-xs font-black text-gray-400">✓</div>
            <span className="font-bold text-sm sm:text-base text-gray-400">자료 업로드/가이드라인 입력</span>
          </div>
          <div className="w-8 sm:w-16 h-px bg-gray-300" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg">2</div>
            <span className="font-black text-sm sm:text-base text-gray-800">대본 미리보기</span>
          </div>
          <div className="w-8 sm:w-16 h-px bg-gray-300" />
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center text-sm font-black text-gray-400">3</div>
            <span className="font-bold text-sm sm:text-base text-gray-400">대본 생성</span>
          </div>
        </div>

        {/* --- 2. 메인 설정 영역 (비대칭을 깨고 6:4 비율로 꽉 차게 수정) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-8 items-stretch">

          {/* 왼쪽: 대본 미리보기 (6칸 차지) */}
          <div className="lg:col-span-6 bg-white rounded-[40px] p-8 sm:p-10 border border-gray-200 relative flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <div>
              <h2 className="text-2xl font-black mb-2 text-[#2D2D2D]">대본 미리보기</h2>
              <p className="text-sm text-gray-400 mb-10 font-medium">설정에 따라 생성될 대본의 구조를 미리 확인하세요</p>

              <div className="space-y-6">
                {[
                  { step: "대본", 
                    content: "안녕하세요 여러분, 오늘 이 자리에 선 이유는 바로 여러분의 발표 고민을 덜어드리기 위해섭니다. '발표가 두려운 당신의 코치'라고 들어보셨나요? 대본 생성부터 발표 코칭까지, 이 모든 걸 한 번에 해결할 수 있는 서비스를..." },
                ].map((slide, i) => (
                  <div key={i} className="bg-white/60 border border-gray-200 rounded-[28px] p-6 shadow-sm min-h-75">
                    <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 mb-4 uppercase tracking-wider">
                      {slide.step}
                    </div>
                    {slide.content ? (
                      <p className="text-sm font-black text-[#2D2D2D] leading-relaxed opacity-80">{slide.content}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded-full w-full opacity-60" />
                        <div className="h-2 bg-gray-200 rounded-full w-full opacity-60" />
                        <div className="h-2 bg-gray-200 rounded-full w-3/4 opacity-60" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 빈 공간을 채워줄 발표 설정 요약 정보 카드 (4칸 차지) */}
          <div className="lg:col-span-4 bg-white rounded-[40px] p-8 sm:p-10 border border-gray-200 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <div>
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-700 mb-6 border border-gray-100">
                <Sliders size={22} />
              </div>
              <h2 className="text-2xl font-black mb-2 text-[#2D2D2D]">선택된 스타일 반영</h2>
              <p className="text-sm text-gray-400 mb-8 font-medium">이전 단계에서 세팅한 설정을 기반으로 AI가 맞춤형 대본 생성을 준비합니다.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">발표 시간</span>
                  <span className="text-sm font-black text-gray-800">5분 발표</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">말투 스타일</span>
                  <span className="text-sm font-black text-gray-800">격식체 · 전문적</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 bg-blue-50/40 rounded-2xl border border-blue-100/50 flex gap-3.5 items-start">
              <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-blue-900">맞춤 가이드라인 적용 완료</h4>
                <p className="text-[11px] text-blue-600 font-medium leading-relaxed">작성하신 목차와 업로드된 파일을 분석하여 문맥 흐름이 어색하지 않게 정교한 대본을 빌드합니다.</p>
              </div>
            </div>
          </div>

        </div>

        {/* 하단 안내 텍스트 */}
        <div className="flex justify-center items-center gap-2 mb-20 text-gray-400">
          <Zap size={14} className="text-yellow-400 fill-yellow-400" />
          <p className="text-xs font-bold italic">설정은 대본 생성 후에도 변경하여 재생성할 수 있습니다</p>
        </div>

      </div>

      {/* --- 3. 하단 고정 내비게이션 바 --- */}
      <div className="w-full bg-[#FAFAFA] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-10 flex justify-end items-center gap-5">
          <button 
            onClick={() => navigate('/file-upload')}
            className="px-10 py-4 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-400 hover:bg-gray-50 transition-all active:scale-95 shadow-sm flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            이전
          </button>
          
          <button 
            onClick={handleGenerateScript}
            className="px-10 py-4 rounded-2xl text-base font-bold flex items-center gap-3 transition-all shadow-lg bg-[#2D2D2D] text-white hover:bg-black active:scale-95"
          >
            대본 생성하기
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Script_Preview_Page;