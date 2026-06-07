import React, { useState, useEffect } from 'react';
import { ChevronRight, FileText, Layers, Mic, TrendingUp, AlertCircle, BarChart3, Bot, Sparkles, X } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Link } from 'react-router-dom';

/**
 * 1. 기능 카드 하단 상세 요소
 */
const FeatureDetailArea = ({ type }: { type: string }) => {
  if (type === 'script') {
    const tags = [
      { name: 'PPT/PDF', icon: <FileText size={12} /> },
      { name: '텍스트', icon: <Bot size={12} /> },
      { name: 'DOCX/PDF', icon: <FileText size={12} /> }
    ];
    return (
      <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100 mt-auto">
        {tags.map((tag) => (
          <span key={tag.name} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-400">
            {tag.icon} {tag.name}
          </span>
        ))}
      </div>
    );
  }

  if (type === 'coaching') {
    return (
      <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mt-auto">
        <span className="px-2 py-1 bg-yellow-100/70 text-yellow-700 rounded-md text-[11px] font-black border border-yellow-200">
          편례 [필례]
        </span>
        <span className="text-[11px] font-medium text-gray-400">예시 하이라이트</span>
      </div>
    );
  }

  if (type === 'evaluation') {
    return (
      <div className="flex items-center gap-4 pt-6 border-t border-gray-100 mt-auto">
        <div className="relative flex items-center justify-center w-12 h-12">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
            <path className="text-blue-600" strokeDasharray={`${(4.2 / 5) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span className="absolute text-[11px] font-black text-gray-800">4.2</span>
        </div>
        <span className="text-[11px] font-medium text-gray-400">점수 미리보기</span>
      </div>
    );
  }
  return null;
};

/**
 * 2. 기능 카드 컴포넌트
 */
const FeatureCard = ({ badge, title, desc, detailType, icon: Icon }: any) => (
  <div className="flex flex-col h-full border border-gray-100 rounded-4xl overflow-hidden bg-white transition-all hover:shadow-2xl duration-300 group p-8 sm:p-10">
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
          {badge}
        </span>
        <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-gray-900">{title}</h3>
        <p className="text-base font-medium text-gray-500 leading-relaxed break-keep">
          {desc}
        </p>
      </div>
      <FeatureDetailArea type={detailType} />
    </div>
  </div>
);

/**
 * 3. 메인 홈 페이지 컴포넌트
 */
const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const hasSeenModal = localStorage.getItem('hideProNoticeModal');
      if (!hasSeenModal) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("LocalStorage에 접근할 수 없는 환경입니다.", error);
    }
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeVisualForever = () => {
    try {
      localStorage.setItem('hideProNoticeModal', 'true');
    } catch (error) {
      console.error("LocalStorage 저장에 실패했습니다.", error);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#F4F4F4] text-[#2D2D2D] font-sans selection:bg-blue-100 overflow-x-hidden w-full">
      
      {/* --- 1. 히어로 섹션 (가로 가득 확장 및 패딩 확보) --- */}
      <section className="relative pt-28 pb-20 sm:pt-40 sm:pb-44 px-6 sm:px-12 md:px-16 max-w-384 mx-auto flex flex-col lg:flex-row items-center min-h-[calc(100vh-80px)] gap-16 lg:gap-12">
        
        {/* 왼쪽: 메인 카피 영역 (텍스트 크기 밸런스 조정) */}
        <div className="w-full lg:w-[55%] z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black mb-6 sm:mb-8 border border-blue-100 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            AI PRESENTATION COACH
          </div>
          
          <h1 className="font-paperlogy font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[84px] leading-[1.08] tracking-tight mb-8 sm:mb-10 break-keep">
            발표가 두려운<br />
            당신을 위한<br />
            <span className="text-blue-600">AI 코치</span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-500 font-medium leading-relaxed mb-10 sm:mb-14 max-w-xl mx-auto lg:mx-0 break-keep">
            발표 준비에 드는 시간과 두려움을 AI로 줄입니다.<br className="hidden sm:inline" />
            PPT 분석부터 실시간 발음 평가까지, 당신의 무대를 완벽하게 지원합니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/service-select" 
              className="group w-full sm:w-auto px-10 py-4.5 bg-[#2D2D2D] text-white rounded-2xl text-base sm:text-lg font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-black/20 active:scale-95 cursor-pointer"
            >
              무료로 체험하기
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link
              to="/user-guide" 
              className="w-full sm:w-auto px-10 py-4.5 bg-white border-2 border-gray-200 text-[#2D2D2D] rounded-2xl text-base sm:text-lg font-bold hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
            >
              서비스 가이드
            </Link>
          </div>
        </div>

        {/* 오른쪽: 와이어프레임 기반 비주얼 (확장된 우측 공간을 넉넉하게 채움) */}
        <div className="w-full lg:w-[45%] relative min-h-100 sm:min-h-130 lg:h-auto self-stretch flex items-center justify-center mt-10 lg:mt-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-100 lg:w-120 aspect-square bg-blue-100 rounded-full blur-3xl opacity-60" />
          
          {/* 분석 카드 1 */}
          <GlassCard className="absolute top-4 lg:top-16 right-4 lg:right-4 w-[90%] sm:w-95 lg:w-105 p-7 lg:p-8 rotate-2 hover:rotate-0 transition-all duration-700 z-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                <Layers size={22} />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-base truncate">발표 슬라이드 분석</h4>
                <p className="text-[10px] text-gray-400 font-mono uppercase truncate">Analyzing PPT Structure...</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-2 w-full bg-blue-600/20 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-3/4 animate-pulse"></div>
              </div>
              <div className="h-2 w-5/6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="mt-6 flex justify-end">
              <span className="text-2xl font-black text-blue-600">78%</span>
            </div>
          </GlassCard>

          {/* 마이크 분석 카드 */}
          <GlassCard className="absolute bottom-6 lg:bottom-16 left-4 lg:left-2 w-44 lg:w-52 p-6 lg:p-7 -rotate-3 hover:rotate-0 transition-all duration-500 z-20 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mb-4">
                <Mic size={18} />
              </div>
              <p className="text-[10px] font-bold text-gray-400 mb-3 font-mono">3D/GlassMic</p>
              <div className="flex gap-1.5 h-10 items-end w-full justify-center">
                {[4, 7, 5, 9, 6].map((h, i) => (
                  <div key={i} className="w-2 bg-blue-400 rounded-full" style={{ height: `${h * 10}%` }} />
                ))}
              </div>
            </div>
          </GlassCard>

          {/* 디자인 에셋 원 구경 키움 */}
          <div className="absolute top-0 left-6 w-12 h-12 lg:w-14 lg:h-14 bg-linear-to-tr from-blue-400 to-blue-200 rounded-full blur-xs animate-bounce" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-8 right-2 w-8 h-8 lg:w-10 lg:h-10 bg-linear-to-tr from-blue-400 to-blue-200 rounded-full blur-xs animate-bounce" style={{ animationDuration: '4.5s' }} />
        </div>
      </section>

      {/* --- 2. 문제 제기 섹션 (가로폭 확장 및 카드 여백 조정) --- */}
      <section className="pt-12 pb-28 sm:pb-40 px-6 sm:px-12 md:px-16 max-w-384 mx-auto">
        <div className="mb-20 text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 tracking-tight">발표가 막막한 3가지 이유</h2>
          <p className="text-gray-500 text-base sm:text-lg lg:text-xl font-medium break-keep">대부분의 사람들이 발표를 앞두고 어려워하는 부분들입니다.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {[
            { icon: <FileText size={24} />, title: "대본 구성의 어려움", desc: "PPT 내용은 있지만, 이를 자연스러운 말로 풀어내기가 막막합니다." },
            { icon: <TrendingUp size={24} />, title: "불안정한 발표 흐름", desc: "긴장으로 인해 말이 빨라지거나 준비한 내용을 쉽게 잊어버립니다." },
            { icon: <Mic size={24} />, title: "전달력에 대한 확신 부족", desc: "내 발음과 억양이 청중에게 신뢰감을 주는지 알 방법이 없습니다." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-10 sm:p-12 rounded-[48px] shadow-sm hover:shadow-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-10 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-base text-gray-400 leading-relaxed mb-10 break-keep">{item.desc}</p>
              <div className="h-1 w-14 bg-gray-200 rounded-full group-hover:w-full group-hover:bg-blue-600 transition-all duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* --- 3. 핵심 기능 섹션 (전체 너비 영역 확장 및 웅장한 내부 패딩 배치) --- */}
      <section className="py-24 sm:py-36 bg-white px-6 sm:px-12 md:px-16 border-y border-gray-100">
        <div className="max-w-384 mx-auto">
          <div className="text-center mb-20 sm:mb-28">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">SKOACH의 3가지 핵심 기능</h2>
            <p className="text-gray-500 text-lg sm:text-xl lg:text-2xl font-medium break-keep">대본 생성부터 발음 평가까지, 발표의 모든 과정을 케어합니다.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <FeatureCard 
              badge="Script Generation"
              title="AI 대본 생성"
              desc="PPT/PDF 업로드 또는 텍스트 입력으로 AI가 자동으로 발표 대본을 생성합니다. 발표 시간·청중·말투 설정 가능."
              detailType="script"
              icon={FileText}
            />
            <FeatureCard 
              badge="Pronunciation Coaching"
              title="발음 코칭"
              desc="생성된 대본에서 발음 주의 단어를 자동 추출하고 표준 발음 표기를 제공합니다. 대본 내 위치 하이라이트."
              detailType="coaching"
              icon={AlertCircle}
            />
            <FeatureCard 
              badge="Pronunciation Evaluation"
              title="발음 평가"
              desc="음성 파일(MP3/MPA)을 업로드하면 AI가 발음 정확도를 0~5점으로 평가하고 실제 인식된 텍스트를 확인할 수 있습니다."
              detailType="evaluation"
              icon={BarChart3}
            />
          </div>
        </div>
      </section>

      {/* 🎯 --- 4. Pro 체험판 안내 모달 영역 --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#2D2D2D]/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-4xl p-8 max-w-md w-full border border-gray-100 shadow-2xl transform transition-all scale-100 duration-300 animate-in fade-in zoom-in-95">
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="text-center mt-4">
              <div className="inline-flex p-3.5 bg-blue-50 text-blue-600 rounded-2xl mb-5">
                <Sparkles size={28} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-[#2D2D2D] mb-3 tracking-tight">
                현재는 <span className="text-blue-600">Pro (체험판)</span>입니다! 🎉
              </h3>
              <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed break-keep px-2">
                SKOACH의 스마트 프리미엄 기능을 <br /> 제한 없이 경험해 보실 수 있도록 <br /><span className="text-blue-600 font-bold">현재 무료로 프로 플랜을 제공하고 있습니다.</span>
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={closeVisualForever}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all text-center order-2 sm:order-1 cursor-pointer"
              >
                다시 보지 않기
              </button>
              <button
                onClick={closeModal}
                className="w-full py-3.5 px-6 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all text-center order-1 sm:order-2 cursor-pointer"
              >
                무료로 프로 기능 쓰기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;