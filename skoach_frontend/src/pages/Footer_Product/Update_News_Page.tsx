import React from 'react';
import { 
  Megaphone, 
  Sparkles, 
  Clock,
  ArrowRight
} from 'lucide-react';

const Update_News_Page: React.FC = () => {

  const updates = [
    {
      date: "2026. 05. 12",
      version: "v1.4.0",
      type: "New Feature",
      typeColor: "bg-blue-50 text-blue-600",
      title: "실시간 발음 코칭 기능 고도화",
      content: "AI 모델 업데이트를 통해 한국어 표준 발음 인식률이 15% 향상되었습니다. 이제 문장 속의 연음 법칙까지 정교하게 체크해 드립니다.",
      tags: ["AI 엔진", "발음 코칭", "정확도 향상"]
    },
    {
      date: "2026. 04. 28",
      version: "v1.3.5",
      type: "Improvement",
      typeColor: "bg-purple-50 text-purple-600",
      title: "PPT 슬라이드 분석 속도 개선",
      content: "대용량 PDF 및 PPTX 파일 업로드 시 발생하는 대기 시간을 50% 단축했습니다. 이제 더 빠르게 대본 생성을 시작하세요.",
      tags: ["성능 개선", "업로드 속도", "UX 개선"]
    },
    {
      date: "2026. 04. 15",
      version: "v1.3.0",
      type: "New Feature",
      typeColor: "bg-blue-50 text-blue-600",
      title: "발표 분위기 '열정적' 모드 추가",
      content: "대본 생성 시 선택할 수 있는 '발표 분위기'에 열정적 모드가 추가되었습니다. 스타트업 피칭이나 공모전에 적합한 힘 있는 문장을 제안합니다.",
      tags: ["대본 생성", "신규 모드", "스타트업"]
    },
    {
      date: "2026. 03. 20",
      version: "v1.2.1",
      type: "Bug Fix",
      typeColor: "bg-gray-100 text-gray-500",
      title: "모바일 뷰 레이아웃 안정화",
      content: "일부 안드로이드 기기에서 대본 미리보기 화면이 깨지던 현상을 수정하고 모바일 환경에서의 가독성을 높였습니다.",
      tags: ["버그 수정", "모바일", "UI/UX"]
    }
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-24 pb-20 font-sans selection:bg-blue-100">
      
      {/* --- 상단 헤더 섹션 --- */}
      <section className="py-20 px-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black mb-4 border border-blue-100 tracking-widest uppercase">
              <Megaphone size={12} />
              Changelog & Updates
            </div>
            <h1 className="text-4xl font-black text-[#2D2D2D] mb-4">새로운 소식</h1>
            <p className="text-gray-500 font-medium">SKOACH는 더 나은 발표 경험을 위해 매주 성장하고 있습니다.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="p-6 bg-gray-50 rounded-4xl border border-gray-100 text-center">
              <p className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-tighter">Current Version</p>
              <p className="text-xl font-black text-[#2D2D2D]">v1.4.0</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 업데이트 타임라인 리스트 --- */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 relative">
            {/* 세로선 디자인 */}
            <div className="absolute left-0 lg:left-10 top-0 w-px h-full bg-gray-100 hidden lg:block" />

            {updates.map((item, index) => (
              <div key={index} className="relative group">
                {/* 타임라인 포인트 (데스크탑용) */}
                <div className="absolute left-11 top-8 w-2 h-2 bg-gray-200 rounded-full border-4 border-white ring-1 ring-gray-100 hidden lg:block group-hover:bg-blue-600 transition-colors duration-300" />

                <div className="bg-white rounded-[40px] p-8 sm:p-10 border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/40">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${item.typeColor}`}>
                        {item.type}
                      </span>
                      <span className="text-sm font-bold text-gray-400 flex items-center gap-1.5">
                        <Clock size={14} />
                        {item.date}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-gray-300 font-bold">{item.version}</span>
                  </div>

                  <h3 className="text-2xl font-black text-[#2D2D2D] mb-4 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed mb-8 break-keep">
                    {item.content}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-50">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 더보기 버튼 (예시) */}
          <div className="mt-16 text-center">
            <button className="px-8 py-4 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-white hover:shadow-lg transition-all active:scale-95">
              이전 업데이트 더보기
            </button>
          </div>
        </div>
      </section>

      {/* --- 하단 배너 --- */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-[#2D2D2D] rounded-[40px] p-10 sm:p-16 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-6">원하는 기능이 없나요?</h2>
            <p className="text-gray-400 mb-10 font-medium break-keep">
              SKOACH는 사용자 여러분의 피드백으로 완성됩니다.<br className="hidden sm:block" />
              필요한 기능이나 제안 사항이 있다면 언제든 알려주세요.
            </p>
            <button className="inline-flex items-center gap-2 text-white font-bold group">
              피드백 보내기
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
          {/* 장식용 아이콘 */}
          <Sparkles className="absolute top-10 right-10 text-white/5 w-32 h-32" />
        </div>
      </section>
    </div>
  );
};

export default Update_News_Page;