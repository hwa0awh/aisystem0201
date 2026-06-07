import React, { useState } from 'react';
import { ChevronRight, Clock, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const Guide_Only_Page: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [outline, setOutline] = useState(""); 

  // --- 발표 설정 관련 상태 ---
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [time, setTime] = useState("5분");
  const [style, setStyle] = useState("격식체");

  const [toast, setToast] = useState<{ isOpen: boolean; messages: string[] }>({
    isOpen: false,
    messages: [],
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const timeOptions = ["5분", "10분", "15분", "20분 이상"];
  const navigate = useNavigate();

  const handleNextStep = () => {
    const errors: string[] = [];

    // 💡 PPT 파일 업로드 관련 차단 로직 제거 후 주제만 깔끔하게 검증
    if (!subject.trim()) {
      errors.push("발표 주제를 입력해주세요.");
    }

    if (errors.length > 0) {
      setToast({ isOpen: true, messages: errors });
      return;
    }

    setToast({ isOpen: false, messages: [] });
    setIsConfirmModalOpen(true);
  };

  const handleFinalConfirm = () => {
    setIsConfirmModalOpen(false);
    navigate('/guideline-script', { state: { subject, time, style, outline } });
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-25 pb-12 px-4 sm:px-8 font-sans selection:bg-blue-100">

      <Toast 
        isOpen={toast.isOpen} 
        messages={toast.messages} 
        type="error"
        onClose={() => setToast({ isOpen: false, messages: [] })}
      />
      
      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        title={`발표 주제, 발표 시간, 말투 스타일\n모두 알맞게 설정하셨습니까?`}
        subTitle={`선택 값: ${time} / ${style}`}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleFinalConfirm}
      />
      
      <div className="max-w-7xl mx-auto">
        
        {/* --- 1. 중앙 스텝 인디케이터 --- */}
        <div className="flex items-center justify-center gap-4 sm:gap-12 mb-16 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg">1</div>
            <span className="font-black text-sm sm:text-base text-gray-800">가이드라인 입력</span>
          </div>
          <div className="w-8 sm:w-16 h-px bg-gray-300" />
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center text-sm font-black text-gray-400">2</div>
            <span className="font-bold text-sm sm:text-base text-gray-400">대본 생성</span>
          </div>
        </div>

        {/* --- 2. 메인 입력 영역 (가로로 길고 웅장하게 확장된 단일 카드) --- */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-[40px] p-8 sm:p-12 border border-gray-200 transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-[#2D2D2D]">주제 설정 및 가이드라인</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-10 font-medium">발표의 핵심 정보와 스타일을 원하는 대로 구성하세요.</p>
            
            {/* 상단: 주제 및 목차 입력 필드 */}
            <div className="space-y-6 pb-8 border-b border-gray-100">
              <div>
                <label className="block text-[15px] font-black text-gray-800 mb-3 ml-1 uppercase tracking-widest">
                  발표 주제<span className="text-blue-600">(필수)</span>
                </label>
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="예) AI 기반 발표 코칭 서비스 기획"
                  className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 bg-white placeholder:text-gray-300 font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-[15px] font-black text-gray-800 mb-3 ml-1 uppercase tracking-widest">
                  목차 / 가이드라인<span className="text-blue-600">(필수)</span>
                </label>
                <textarea 
                  rows={5}
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  placeholder="1. 발표 내용&#10;2. 청중 대상&#10;3. 상세한 설명"
                  className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 bg-white placeholder:text-gray-300 font-bold text-sm resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* 하단: 발표 상세 설정 필드 */}
            <div className="space-y-8 pt-8">
              {/* 커스텀 발표 시간 드롭다운 */}
              <div>
                <label className="block text-[15px] font-black text-gray-400 mb-3 uppercase tracking-widest">
                  발표 시간<span className="text-blue-600">(필수)</span>
                  </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTimeOpen(!isTimeOpen)}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-200 bg-white font-bold text-sm flex justify-between items-center focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-gray-400" />
                      <span className="text-[#2D2D2D]">{time}</span>
                    </div>
                    <ChevronDown className={`transition-transform duration-300 text-gray-400 ${isTimeOpen ? 'rotate-180' : ''}`} size={18} />
                  </button>

                  {isTimeOpen && (
                    <>
                      <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-200 overflow-hidden">
                        {timeOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={`w-full px-6 py-3 text-left text-sm font-bold transition-colors
                              ${time === option ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => {
                              setTime(option);
                              setIsTimeOpen(false);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <div className="fixed inset-0 z-40" onClick={() => setIsTimeOpen(false)} />
                    </>
                  )}
                </div>
              </div>

              {/* 말투 스타일 */}
              <div>
                <label className="block text-[15px] font-black text-gray-400 mb-3 uppercase tracking-widest">
                  말투 스타일<span className="text-blue-600">(필수)</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F4F4F4] rounded-2xl">
                  {["격식체", "편안한 말투"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setStyle(item)}
                      className={`py-3 rounded-xl text-xs font-black transition-all ${style === item ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- 3. 하단 고정 내비게이션 바 --- */}
      <div className="w-full bg-[#FAFAFA] border-t border-gray-200 mt-15">
        <div className="max-w-4xl mx-auto px-4 sm:px-0 py-10 flex justify-end items-center gap-5">
          <button 
            onClick={() => navigate('/')}
            className="px-10 py-4 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-400 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            이전
          </button>
          
          <button 
            type="button"
            onClick={handleNextStep} 
            className="px-10 py-4 rounded-2xl text-base font-bold flex items-center gap-3 transition-all shadow-lg bg-[#2D2D2D] text-white hover:bg-black active:scale-95"
          >
            다음 · 대본 생성하기
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Guide_Only_Page;