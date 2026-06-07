import React from 'react';
import { 
  FileUp, 
  Settings2, 
  Sparkles, 
  Mic2, 
  CheckCircle2,
  PlayCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const User_Guide_Page: React.FC = () => {
  const navigate = useNavigate();

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
    <div className="bg-[#FAFAFA] min-h-screen pt-24 pb-20 font-sans selection:bg-blue-100">
      
      {/* --- 상단 히어로 섹션 --- */}
      <section className="py-20 px-4 text-center bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black mb-6 border border-blue-100">
            <PlayCircle size={14} />
            HOW TO USE SKOACH
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#2D2D2D] mb-6 leading-tight">
            완벽한 발표를 위한<br />
            <span className="text-blue-600">4단계 가이드</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto break-keep">
            어렵게만 느껴졌던 발표 준비, SKOACH와 함께라면 대본 생성부터 <br />발표 실전 연습까지 체계적으로 준비할 수 있습니다.
          </p>
        </div>
      </section>

      {/* --- 가이드 스텝 섹션 --- */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-[40px] p-8 sm:p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-black text-[#2D2D2D] mb-4">{step.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8 grow break-keep">
                  {step.desc}
                </p>
                
                {/* 팁 박스 */}
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
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

      {/* --- FAQ 스타일 간단 팁 --- */}
      <section className="py-20 px-4 sm:px-8 bg-[#2D2D2D] text-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl font-black mb-12 text-center">자주 묻는 질문</h2>
          <div className="space-y-6">
            {[
              { q: "파일 업로드 없이도 사용 가능한가요?", a: "네, 주제와 목차 가이드라인만 입력해도 AI가 풍부한 내용을 생성해 드립니다." },
              { q: "생성된 대본은 어디에 저장되나요?", a: "내 워크스페이스에 자동 저장되며, 언제든 다시 확인하고 수정할 수 있습니다." },
              { q: "발음 평가는 어떤 원리로 진행되나요?", a: "업계 표준 STT 기술과 자체 분석 알고리즘을 통해 텍스트 일치율과 음절 정확도를 계산합니다." }
            ].map((faq, i) => (
              <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-4xl hover:bg-white/10 transition-colors">
                <h4 className="text-lg font-bold mb-3 flex items-center gap-3">
                  <span className="text-blue-400">Q.</span> {faq.q}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
        {/* 배경 장식 원 */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </section>

      {/* --- 하단 CTA 섹션 --- */}
      <section className="py-32 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-[#2D2D2D] mb-8">
            준비가 되셨나요?<br />
            지금 바로 첫 발표를 준비해 보세요.
          </h2>
          <button 
            onClick={() => navigate('/file-upload')}
            className="group px-12 py-5 bg-[#2D2D2D] text-white rounded-2xl text-xl font-black flex items-center gap-4 mx-auto hover:bg-black transition-all shadow-2xl active:scale-95"
          >
            시작하기
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

    </div>
  );
};

export default User_Guide_Page;