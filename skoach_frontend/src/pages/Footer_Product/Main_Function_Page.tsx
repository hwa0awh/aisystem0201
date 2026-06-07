import React from 'react';
import { Layers, Mic, CheckCircle2, ChevronRight } from 'lucide-react';
import GlassCard from './../../components/GlassCard';
import { Link } from 'react-router-dom';

const Main_Function_Page: React.FC = () => {
  return (
    <div className="bg-[#F4F4F4] min-h-screen font-sans">
      
      {/* 1. 헤더 섹션 (Hero 스타일) */}
      <section className="pt-32 pb-20 px-8 max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black mb-6 tracking-widest uppercase">
          Deep Dive Into Features
        </div>
        <h1 className="text-4xl sm:text-6xl font-black mb-8 leading-tight">
          완벽한 발표를 위한<br />
          <span className="text-blue-600">압도적인 기술력</span>
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto font-medium break-keep">
          단순한 대본 생성을 넘어, 청중의 마음을 움직이는 스피치 메커니즘을 AI가 직접 설계합니다.
        </p>
      </section>

      {/* 2. 상세 기능 리스트 섹션 */}
      <section className="pb-32 px-8 max-w-7xl mx-auto space-y-24">
        
        {/* 기능 01: AI 대본 생성 */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Layers size={28} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">지능형 슬라이드 분석 및<br />자동 대본 생성</h2>
            <p className="text-gray-500 leading-relaxed text-lg font-medium break-keep">
              PPT 레이아웃과 텍스트를 AI가 실시간으로 분석하여 <br />핵심 키워드를 뽑아냅니다.<br />
              신뢰감 있는 톤부터 유쾌한 스타일까지, <br />발표 상황과 환경에 딱 맞는 최적의 스크립트를 즉시 생성합니다.
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
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl rotate-12 flex items-center justify-center text-white font-bold italic">AI</div>
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
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">실시간 발음 분석 및<br />맞춤형 코칭 가이드</h2>
            <p className="text-gray-500 leading-relaxed text-lg font-medium break-keep">
              단순히 읽는 것을 넘어 정확하게 말하는 법을 가이드합니다.<br /> 
              어려운 단어나 한국인이 자주 틀리는 발음을 실시간으로 분석하여, 
              올바른 발음법을 정확하게 코칭해 드립니다.
            </p>
            <div className="flex flex-wrap gap-3 justify-end lg:justify-start">
              {['실시간 음성 파형 분석', '취약 발음 분석', '발음 교정 AI 엔진'].map((tag) => (
                <span key={tag} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full">
            <GlassCard className="p-10 aspect-video flex items-center justify-center gap-2 bg-blue-100 text-white overflow-hidden relative">
              <div className="flex gap-2 h-32 items-center">
                  {[20, 50, 80, 40, 90, 60, 30, 70, 50, 40].map((h, i) => (
                    <div key={i} className="w-3 bg-blue-500 rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
              </div>
            </GlassCard>
          </div>
        </div>

      </section>

      {/* 3. 하단 CTA */}
      <section className="bg-white py-24 px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">이제 당신의 무대를 준비할 시간입니다.</h2>
          <p className="text-gray-500 text-lg font-medium">지금 무료로 AI 코치와 함께 완벽한 발표를 경험해 보세요.</p>
          <Link
              to="/service-select" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl text-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group"
            >
              무료로 체험하기
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
        </div>
      </section>
    </div>
  );
};

export default Main_Function_Page;