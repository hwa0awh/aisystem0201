import React from 'react';
import { FileUp, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Script_Method_Selection_Page: React.FC = () => {
  const navigate = useNavigate();

  const methods = [
    {
      id: "file",
      title: "슬라이드 파일 업로드",
      desc: "작성해 둔 PPT, PPTX, PDF 발표 자료가 있으신가요? 파일을 업로드하면 AI가 슬라이드 구조와 시각 자료 내용을 정밀 분석하여 맞춤 대본을 생성합니다.",
      icon: <FileUp size={32} className="text-blue-600" />,
      badge: "추천 모드",
      badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
      buttonText: "파일 분석 후 대본 생성",
      action: () => navigate('/file-upload') // 슬라이드 파일 파일업로드 컴포넌트로 이동
    },
    {
      id: "guide",
      title: "가이드라인만 입력",
      desc: "따로 준비된 발표 자료 파일이 없어도 괜찮습니다. 발표 주제와 간단한 목차, 청중 대상 등의 안내 요약만 적어주시면 AI가 풍성한 대본을 빌드해 드립니다.",
      icon: <FileText size={32} className="text-indigo-600" />,
      badge: "빠른 생성",
      badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
      buttonText: "가이드라인 작성 후 대본 생성",
      action: () => navigate('/guideline-only') // 방금 전 가로로 길게 수정한 가이드 전용 컴포넌트로 이동
    }
  ];

  return (
    <div className="bg-[#F4F4F4] min-h-screen pt-32 pb-24 font-sans selection:bg-blue-100 flex flex-col justify-center">
      
      {/* 1. 상단 인트로 헤더 */}
      <section className="px-8 max-w-7xl mx-auto text-center mb-16 animate-in fade-in duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-gray-700 rounded-full text-xs font-black mb-6 tracking-wider uppercase border border-gray-200 shadow-xs">
          <Sparkles size={14} className="text-blue-600 animate-pulse" /> Script Generation Mode
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#2D2D2D] mb-6 leading-tight tracking-tight">
          대본 생성을 위한 <span className="text-blue-600">준비 방식</span>을 골라주세요
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto font-medium break-keep">
          준비된 슬라이드 자료 분석을 통해 디테일한 대본을 완성하거나, <br />
          간단한 키워드 입력만으로 발표의 핵심을 짚어내는 똑똑한 대본을 빠르게 생성할 수 있습니다.
        </p>
      </section>

      {/* 2. 두 가지 생성 방식 선택 카드 섹션 */}
      <section className="px-4 sm:px-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {methods.map((method) => (
            <div 
              key={method.id}
              onClick={method.action}
              className="group relative flex flex-col justify-between rounded-[40px] p-8 sm:p-10 bg-white border border-gray-200 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl"
            >
              <div>
                {/* 카드 상단 배지 및 아이콘 */}
                <div className="flex items-center justify-between mb-8">
                  <div className={`px-3 py-1 border rounded-lg text-[10px] font-black tracking-wide uppercase ${method.badgeStyle}`}>
                    {method.badge}
                  </div>
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                    {method.icon}
                  </div>
                </div>

                {/* 타이틀 및 설명문 */}
                <h3 className="text-2xl sm:text-3xl font-black text-[#2D2D2D] mb-4 group-hover:text-blue-600 transition-colors">
                  {method.title}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base font-medium leading-relaxed break-keep mb-8">
                  {method.desc}
                </p>
              </div>

              {/* 하단 화살표 액션 링크 */}
              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-gray-800 font-bold group-hover:text-blue-600 transition-colors">
                <span className="text-base">{method.buttonText}</span>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 이전 단계로 돌아가기 (선택 사항) */}
      <div className="max-w-5xl mx-auto w-full text-center mt-12">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 서비스 선택 단계로 돌아가기
        </button>
      </div>

    </div>
  );
};

export default Script_Method_Selection_Page;