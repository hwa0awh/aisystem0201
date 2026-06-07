import React from 'react';
import { 
  Layers, 
  Mic, 
  CheckCircle2,
  FileUp, 
  Settings2, 
  Sparkles, 
  Mic2, 
  PlayCircle, 
  ChevronRight
} from 'lucide-react';
import GlassCard from './../../components/GlassCard';
import { Link } from 'react-router-dom';

const Service_Introduce_Page: React.FC = () => {

  // 이용 가이드 스텝 데이터
  const steps = [
    {
      icon: <FileUp size={32} className="text-blue-600" />,
      title: "01. 자료 업로드",
      desc: "발표용 PPTX 또는 PDF 파일을 업로드하세요. 파일이 없다면 주제와 목차만 입력해도 충분합니다.",
      tip: "텍스트가 풍부한 슬라이드일수록 더 정확한 대본이 나옵니다."
    },
    {
      icon: <Settings2 size={32} className="text-blue-600" />,
      title: "02. 발표 조건 설정",
      desc: "발표 시간, 청중의 성격, 원하는 말투를 선택하세요. AI가 상황에 가장 적합한 톤앤매너를 잡습니다.",
      tip: "'교수/심사' 모드는 논리적이고 격식 있는 문장을 생성합니다."
    },
    {
      icon: <Sparkles size={32} className="text-blue-600" />,
      title: "03. AI 대본 생성",
      desc: "슬라이드별 핵심 내용을 바탕으로 AI가 자연스러운 스크립트를 작성합니다. 생성 후 자유롭게 수정이 가능합니다.",
      tip: "생성된 대본을 직접 읽어보며 나만의 문장으로 다듬어보세요."
    },
    {
      icon: <Mic2 size={32} className="text-blue-600" />,
      title: "04. 발음 코칭 & 평가",
      desc: "연습 모드에서 대본을 읽어보세요. 어려운 발음을 짚어주고, 녹음 파일을 올리면 정확도 점수를 측정해 드립니다.",
      tip: "실전처럼 녹음하여 나의 취약한 발음을 반복 연습하세요."
    }
  ];

  return (
    <div className="bg-[#F4F4F4] min-h-screen font-sans selection:bg-blue-100">
      
      {/* 1. 상단 히어로 섹션 */}
      <section className="pt-32 pb-20 px-8 max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black mb-6 tracking-widest uppercase border border-blue-100">
          Deep Dive Into SKOACH
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-[#2D2D2D] mb-8 leading-tight">
          완벽한 발표를 위한<br />
          <span className="text-blue-600">압도적인 기술력</span>
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto font-medium break-keep">
          단순한 대본 생성을 넘어, 청중의 마음을 움직이는 스피치 메커니즘을 AI가 직접 설계합니다.
          대본 생성부터 발표 실전 연습까지 체계적으로 준비해보세요.
        </p>
      </section>

      {/* 2. 핵심 상세 기능 섹션 */}
      <section className="pb-24 px-8 max-w-7xl mx-auto space-y-24">
        
        {/* 기능 01: AI 대본 생성 */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Layers size={28} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#2D2D2D]">
              지능형 슬라이드 분석 및<br />자동 대본 생성
            </h2>
            <p className="text-gray-500 leading-relaxed text-lg font-medium break-keep">
              PPT 레이아웃과 텍스트를 AI가 실시간으로 분석하여<br /> 핵심 키워드를 뽑아냅니다.<br />
              신뢰감 있는 톤부터 유쾌한 스타일까지, 발표 상황과 환경에 딱 맞는 최적의 스크립트를 즉시 생성합니다.
            </p>
            <ul className="space-y-3">
              {['PDF/PPTX/DOCX 완벽 호환', '청중 타겟별 맞춤 어조 설정', '총 발표 소요 시간 설정'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 font-semibold">
                  <CheckCircle2 size={18} className="text-blue-600" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full">
            <GlassCard className="p-10 aspect-video flex flex-col justify-center border-none bg-white/60">
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-blue-100 rounded-full animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded-full" />
                <div className="h-4 w-5/6 bg-gray-100 rounded-full" />
                <div className="pt-8 flex justify-between items-end">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-blue-200 rounded-full" />
                    <div className="h-3 w-32 bg-gray-200 rounded-full" />
                  </div>
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl rotate-12 flex items-center justify-center text-white font-bold italic shadow-md">AI</div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* 기능 02: 발음 및 억양 코칭 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="flex-1 space-y-6 text-right lg:text-left lg:pl-12">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg ml-auto lg:ml-0">
              <Mic size={28} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#2D2D2D]">
              실시간 발음 분석 및<br />맞춤형 코칭 가이드
            </h2>
            <p className="text-gray-500 leading-relaxed text-lg font-medium break-keep">
              단순히 읽는 것을 넘어 정확하게 말하는 법을 가이드합니다.<br /> 
              어려운 단어나 한국인이 자주 틀리는 발음을 실시간으로 분석하여, 올바른 발음법을 정확하게 코칭해 드립니다.
            </p>
            <div className="flex flex-wrap gap-3 justify-end lg:justify-start">
              {['발음 하이라이팅', '취약 발음 분석', '발음 교정 AI 엔진'].map((tag) => (
                <span key={tag} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full">
            <GlassCard className="p-10 aspect-video flex items-center justify-center gap-2 bg-white/60 text-white overflow-hidden relative">
              <div className="flex gap-2 h-32 items-center">
                  {[20, 50, 80, 40, 90, 60, 30, 70, 50, 40].map((h, i) => (
                    <div key={i} className="w-3 bg-blue-500 rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
              </div>
            </GlassCard>
          </div>
        </div>

      </section>

      {/* 3. 서비스 이용 4단계 가이드 섹션 */}
      <section className="py-24 px-8 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black mb-4 border border-blue-100">
              <PlayCircle size={14} />
              HOW TO USE SKOACH
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D]">
              이용 프로세스 <span className="text-blue-600">4단계 가이드</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="group bg-[#FAFAFA] rounded-[40px] p-8 sm:p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-black text-[#2D2D2D] mb-4">{step.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8 grow break-keep">
                  {step.desc}
                </p>
                
                {/* 팁 박스 */}
                <div className="p-5 bg-white rounded-2xl border border-gray-100 flex items-start gap-3 shadow-sm">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-gray-500 leading-normal">
                    <span className="text-[#2D2D2D]">PRO TIP:</span> {step.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 하단 최종 통합 CTA 섹션 */}
      <section className="py-32 px-4 text-center bg-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl sm:text-4xl font-black text-[#2D2D2D] leading-tight">
            이제 당신의 무대를 준비할 시간입니다.<br />
            지금 바로 첫 발표를 시작해 보세요.
          </h2>
          <p className="text-gray-500 text-lg font-medium">지금 무료로 AI 코치와 함께 완벽한 발표를 경험해 보세요.</p>
          <Link
              to="/service-select" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl text-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group"
            >
              시작하기
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
        </div>
      </section>

    </div>
  );
};

export default Service_Introduce_Page;