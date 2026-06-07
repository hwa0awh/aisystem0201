import React from 'react';
import { Check, X, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing_Introduction_Page: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Guest",
      price: "₩0",
      period: "로그인 없이",
      desc: "SKOACH의 강력한 AI 성능을 가볍게 맛보기 위한 체험 모드입니다.",
      features: [
        { text: "AI 대본 생성 (총 3회 제공)", available: true },
        { text: "발표 발음 코칭 (총 1회 제공)", available: true },
        { text: "발음 평가 리포트 (총 1회 / 점수만 제공)", available: true },
        { text: "개인 워크스페이스 대본 저장", available: false },
        { text: "발표 자료 없이 간단한 대본 생성 가능", available: false },
        { text: "상세 발음 취약점 분석 및 교정 가이드", available: false },
        { text: "대본 부분 재생성 기능", available: false },
      ],
      buttonText: "바로 체험해보기",
      buttonStyle: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
      action: () => navigate('/service-select')
    },
    // plans 배열 내부의 두 번째 객체(Basic)를 찾아서 이 부분만 교체해 주세요!
    {
      name: "Basic",
      price: "₩0",
      period: "평생 무료",
      desc: "회원가입만 해도 제공되는 혜택으로, 발표를 든든하게 준비할 수 있습니다.",
      features: [
        { text: "AI 대본 생성 무제한", available: true },
        { text: "발표 발음 코칭 무제한", available: true },
        { text: "발음 평가 리포트 무제한(점수만 제공)", available: true },
        { text: "개인 워크스페이스 대본 저장 ", available: true },
        { text: "발표 자료 없이 간단한 대본 생성 가능", available: false },
        { text: "상세 발음 취약점 분석 및 교정 가이드", available: false },
        { text: "대본 부분 재생성 기능", available: false },
      ],
      buttonText: "무료로 시작하기",
      // 1. 스타일을 회색 톤으로 바꾸고 마우스 포인터를 차단(cursor-not-allowed)합니다.
      buttonStyle: "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed",
      // 2. action이 실행되지 않도록 null 처리하거나 비워둡니다.
      isDisabled: true, // 렌더링 스크립트에서 활용할 수 있도록 플래그 추가
      action: () => {} 
    },
    {
      name: "Pro(체험판)",
      price: "Free",
      originalPrice: "₩4,990",
      period: "/ 월",
      desc: "중요한 발표, 발표 면접, 비즈니스 경쟁 PT를 완벽하게 정복하기 위한 마스터 플랜입니다.",
      features: [
        { text: "AI 대본 생성 무제한", available: true },
        { text: "발표 발음 코칭 무제한", available: true },
        { text: "발음 평가 리포트 무제한", available: true },
        { text: "개인 워크스페이스 저장", available: true },
        { text: "발표 자료 없이 간단한 대본 생성 가능", available: true },
        { text: "상세 발음 취약점 분석 및 교정 가이드", available: true },
        { text: "대본 부분 재생성 기능", available: true },
      ],
      buttonText: "프로 플랜 시작하기",
      buttonStyle: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100",
      isPopular: true,
      action: () => navigate('/service-select')
    }
  ];

  return (
    <div className="bg-[#F4F4F4] min-h-screen pt-32 pb-24 font-sans selection:bg-blue-100">
      
      {/* 1. 상단 타이틀 헤더 */}
      <section className="px-8 max-w-7xl mx-auto text-center mb-20">
        <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black mb-6 tracking-widest uppercase border border-blue-100">
          PRICING PLANS
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#2D2D2D] mb-6 leading-tight">
          발표 목적에 맞는<br />
          <span className="text-blue-600">합리적인 플랜</span>을 선택하세요
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium break-keep">
          SKOACH의 지능형 AI 코치와 함께라면<br /> 무대 위의 긴장감이 완벽한 자신감으로 바뀝니다.
        </p>
      </section>

      {/* 2. 요금제 카드 섹션 */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative flex flex-col rounded-[40px] p-8 sm:p-10 bg-white border transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl hover:lg:scale-105`}
            >
              {/* 카드 상단 정보 */}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-[#2D2D2D] mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm font-medium min-h-10 break-keep">{plan.desc}</p>
                
                {/* 가격 표시 영역 (원래가격 세트를 아래로 정렬) */}
                <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-2">
                  
                  {/* 1. 원래 가격과 기간 뭉치 (mt-2.5를 주어 Free 글자 아래 라인과 맞춤) */}
                  {plan.originalPrice && (
                    <div className="flex items-center gap-1 text-gray-400 font-bold mt-2.5">
                      <span className="text-xl line-through opacity-80">
                        {plan.originalPrice}
                      </span>
                      <span className="text-sm">
                        {plan.period}
                      </span>
                    </div>
                  )}
                  
                  {/* 2. 현재 가격 (Free) */}
                  <span className={`text-4xl sm:text-5xl font-black tracking-tight ${plan.price === 'Free' ? 'text-red-500' : 'text-[#2D2D2D]'}`}>
                    {plan.price}
                  </span>
                  
                  {/* 3. 🟢 체험판 한정 배지 */}
                  {plan.price === 'Free' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-600 mt-1.5">
                      체험판 한정
                    </span>
                  )}
                  
                </div>
              </div>

              {/* 플랜별 기능 리스트 */}
              <div className="grow mb-10 border-t border-gray-100 pt-8 space-y-4">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3 text-sm font-semibold">
                    {feature.available ? (
                      <Check size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    ) : (
                      <X size={18} className="text-gray-300 shrink-0 mt-0.5" />
                    )}
                    <span className={feature.available ? "text-gray-700" : "text-gray-300 line-through"}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* 액션 버튼 */}
              <button
                onClick={plan.action}
                disabled={plan.isDisabled}
                className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-200 inline-flex items-center justify-center gap-2 ${
                  plan.isDisabled ? plan.buttonStyle : `${plan.buttonStyle} active:scale-[0.98]`
                }`}
              >
                {plan.buttonText}
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 심플 FAQ 가이드 */}
      <section className="px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-4xl p-8 sm:p-10 border border-gray-100 shadow-sm">
          <h4 className="text-xl font-black text-[#2D2D2D] mb-6 flex items-center gap-2">
            <HelpCircle className="text-blue-600" /> 요금 관련 자주 묻는 질문
          </h4>
          <div className="space-y-6 divide-y divide-gray-100">
            {[
              { q: "언제든 플랜을 변경하거나 해지할 수 있나요?", a: "네, 유료 플랜은 마이페이지에서 언제든 위약금 없이 즉시 해지 가능하며, 다음 결제일부터 청구되지 않습니다." },
              { q: "무료 회원과 비회원의 가장 큰 차이는 무엇인가요?", a: "무료 회원은 슬라이드 분석 장수가 늘어날 뿐만 아니라 개별 대본을 보관할 수 있는 전용 워크스페이스를 제공받습니다." },
              { q: "결제 수단은 어떤 것들을 지원하나요?", a: "신용/체크카드 정기결제를 비롯하여 카카오페이, 네이버페이, 토스페이 등 간편결제를 완벽하게 지원합니다." }
            ].map((faq, i) => (
              <div key={i} className={i > 0 ? "pt-6" : ""}>
                <h5 className="text-base font-bold text-[#2D2D2D] mb-2">Q. {faq.q}</h5>
                <p className="text-gray-500 text-sm font-medium leading-relaxed break-keep">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Pricing_Introduction_Page;