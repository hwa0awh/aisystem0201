import React from 'react';
import { FileText, Mic, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Service_Selection_Page: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: "script",
      title: "AI 대본 생성",
      desc: "발표 주제나 가이드라인, 혹은 PPT/PDF 슬라이드를 기반으로 AI가 청중과 시간, 말투에 딱 맞는 완벽한 발표 대본을 만들어 드립니다.",
      icon: <FileText size={32} className="text-blue-600" />,
      badge: "인기 모드",
      badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
      buttonText: "대본 만들러 가기",
      action: () => navigate('/script-method-select') // 기존에 사용하시던 대본 생성 업로드/입력 페이지 주소로 연결
    },
    {
      id: "coaching",
      title: "발표 발음 코칭",
      desc: "이미 준비된 대본이 있으신가요? 작성해 둔 대본을 입력하고 연습하면, AI가 정확한 표준 발음 표기와 함께 취약점을 정밀 분석해 드립니다.",
      icon: <Mic size={32} className="text-emerald-600" />,
      badge: "실전 대비",
      badgeStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
      buttonText: "발음 코칭 시작하기",
      action: () => navigate('/coaching-setup') // 발음 코칭 설정 혹은 입력 페이지 주소로 연결
    }
  ];

  return (
    <div className="bg-[#F4F4F4] min-h-screen pt-32 pb-24 font-sans selection:bg-blue-100 flex flex-col justify-center">
      
      {/* 1. 상단 인트로 헤더 */}
      <section className="px-8 max-w-7xl mx-auto text-center mb-16 animate-in fade-in duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-gray-700 rounded-full text-xs font-black mb-6 tracking-wider uppercase border border-gray-200 shadow-xs">
          <Sparkles size={14} className="text-blue-600 animate-pulse" /> Welcome to SKOACH
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#2D2D2D] mb-6 leading-tight tracking-tight">
          오늘 어떤 <span className="text-blue-600">발표 연습</span>을 시작할까요?
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto font-medium break-keep">
          대본 작성이 막막할 때도, 실전 무대 전 확실한 피드백이 필요할 때도<br />
          SKOACH의 지능형 AI 코치가 1:1 맞춤형으로 밀착 가이드합니다.
        </p>
      </section>

      {/* 2. 두 가지 서비스 선택 카드 섹션 */}
      <section className="px-4 sm:px-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {services.map((service) => (
            <div 
              key={service.id}
              onClick={service.action}
              className="group relative flex flex-col justify-between rounded-[40px] p-8 sm:p-10 bg-white border border-gray-200 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl"
            >
              <div>
                {/* 카드 상단 배지 및 아이콘 */}
                <div className="flex items-center justify-between mb-8">
                  <div className={`px-3 py-1 border rounded-lg text-[10px] font-black tracking-wide uppercase ${service.badgeStyle}`}>
                    {service.badge}
                  </div>
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                    {service.icon}
                  </div>
                </div>

                {/* 타이틀 및 설명문 */}
                <h3 className="text-2xl sm:text-3xl font-black text-[#2D2D2D] mb-4 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base font-medium leading-relaxed break-keep mb-8">
                  {service.desc}
                </p>
              </div>

              {/* 하단 화살표 액션 링크 */}
              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-gray-800 font-bold group-hover:text-blue-600 transition-colors">
                <span className="text-base">{service.buttonText}</span>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Service_Selection_Page;