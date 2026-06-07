import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Copy, Check, Edit3, Save, Clock, Sparkles, Download } from 'lucide-react';
import Toast from '../components/Toast';
import { DownloadModal } from '../components/DownloadModal';

const Guideline_Script_Page: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 이전 가이드라인 페이지에서 넘겨받은 데이터 (방어 코드 포함)
  const { subject, time, style } = location.state || {
    subject: "AI 기반 발표 코칭 서비스",
    time: "5분",
    style: "격식체",
    outline: ""
  };

  // 💡 가짜 AI 생성 대본 데이터 (실제 환경에서는 API 결과값이 들어옵니다)
  const initialGeneratedScript = `안녕하십니까. 오늘 발표를 맡은 발표자입니다. 오늘 제가 여러분께 소개해 드릴 주제는 바로 '${subject}'입니다.\n\n최근 프레젠테이션의 중요성이 날로 커지고 있지만, 많은 사람들이 여전히 청중 앞에 서는 것에 큰 두려움을 느끼곤 합니다. 저희 SKOACH는 바로 이러한 페인 포인트를 해결하기 위해 탄생했습니다.\n\n본 발표에서는 크게 세 가지 핵심 축을 중심으로 말씀드리겠습니다. 첫째는 대본 구성의 자동화, 둘째는 실시간 시각적 피드백 시스템, 마지막 셋째는 딥러닝 기반의 정밀 발음 평가 리포트입니다.\n\n먼저 첫 번째 파트인 대본 구성 자동화에 대해 설명드리겠습니다. 사용자가 구조화된 슬라이드나 간단한 가이드라인을 입력하면, AI가 타깃 청중의 연령대와 선호도, 그리고 목표 발표 시간에 정밀하게 템포를 맞춘 초안을 즉시 빌드합니다. 이를 통해 발표 준비 시간을 최대 80%까지 획기적으로 단축할 수 있습니다.\n\n이어서 두 번째로...`;

  // --- 상태 관리 ---
  const [script, setScript] = useState(initialGeneratedScript);
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 토글
  const [isCopied, setIsCopied] = useState(false); // 복사 완료 상태
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [toast, setToast] = useState<{ isOpen: boolean; messages: string[] }>({
    isOpen: false,
    messages: [],
  });

  // --- 클립보드 복사 함수 ---
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setIsCopied(true);
      setToast({ isOpen: true, messages: ["대본이 클립보드에 성공적으로 복사되었습니다!"] });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setToast({ isOpen: true, messages: ["복사에 실패했습니다. 다시 시도해주세요."] });
    }
  };

  const handleDownloadSubmit = (format: 'DOCX' | 'PDF') => {
    setIsDownloadModalOpen(false);
    
    // TODO: 나중에 실제 파일 다운로드 API 연동할 구역!
    alert(`${format} 형식으로 대본 다운로드를 시작합니다.`);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-25 pb-12 px-4 sm:px-8 font-sans selection:bg-blue-100">
      
      <Toast 
        isOpen={toast.isOpen} 
        messages={toast.messages} 
        type={toast.messages[0]?.includes("실패") ? "error" : "success"}
        onClose={() => setToast({ isOpen: false, messages: [] })}
      />
      
      <div className="max-w-7xl mx-auto">
        
        {/* --- 1. 스텝 인디케이터 (2단계 활성화) --- */}
        <div className="flex items-center justify-center gap-4 sm:gap-12 mb-12 pt-8">
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center text-sm font-black text-gray-400">1</div>
            <span className="font-bold text-sm sm:text-base text-gray-400">가이드라인 입력</span>
          </div>
          <div className="w-8 sm:w-16 h-px bg-gray-300" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg">2</div>
            <span className="font-black text-sm sm:text-base text-gray-800">대본 생성</span>
          </div>
        </div>

        {/* --- 2. 상단 요약 배지 라인 --- */}
        <div className="max-w-5xl mx-auto mb-6 flex flex-wrap gap-3 items-center justify-center lg:justify-start">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black border border-blue-100 shadow-xs">
            <Sparkles size={14} /> {style}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-xs font-black border border-gray-200 shadow-xs">
            <Clock size={14} /> 목표 {time} 분량
          </div>
          <span className="text-sm font-bold text-gray-400 truncate max-w-xs sm:max-w-md">
            주제: {subject}
          </span>
        </div>

        {/* --- 3. 메인 대본 카드 뷰어 --- */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-white rounded-[40px] p-8 sm:p-12 border border-gray-200 shadow-xs relative">
            
            {/* 우측 상단 유틸리티 버튼 그룹 */}
            <div className="flex justify-end items-center gap-2 mb-6 border-b border-gray-100 pb-6">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 border text-sm font-medium rounded-lg transition active:scale-95 cursor-pointer ${
                  isEditing 
                    ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" 
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {isEditing ? (
                  <>
                    <Save size={14} /> 대본 저장하기
                  </>
                ) : (
                  <>
                    <Edit3 size={14} /> 자유 편집 모드
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                대본 복사
              </button>
              <button onClick={() => setIsDownloadModalOpen(true)} type="button" 
                className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition">
                <Download className="w-4 h-4 mr-2" /> 다운로드
              </button>
            </div>

            {/* 대본 텍스트 에어리어 / 뷰어 렌더링 영역 */}
            <div className="min-h-96">
              {isEditing ? (
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="w-full min-h-110 p-4 border border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 font-medium text-base text-gray-800 leading-relaxed resize-none bg-blue-50/5"
                  placeholder="AI가 생성한 대본을 자유롭게 커스텀해 보세요."
                />
              ) : (
                <div className="whitespace-pre-wrap font-medium text-base text-[#2D2D2D] leading-8 px-2 tracking-wide font-sans select-text selection:bg-blue-200">
                  {script}
                </div>
              )}
            </div>

            {/* 카드 하단 글자수 계산기 */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-gray-400 px-2">
              <span>상태: AI 초안 생성 완료</span>
              <span>공백 포함 총 {script.length}자</span>
            </div>

          </div>
        </div>

      </div>

      {/* --- 4. 하단 고정 내비게이션 바 --- */}
      <div className="w-full bg-[#FAFAFA] border-t border-gray-200 mt-15">
        <div className="max-w-5xl mx-auto px-4 sm:px-0 py-10 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="px-10 py-4 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-400 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            다시 만들기
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/guideline-coach', { state: { inputType: "text", script: script } })} 
            className="px-10 py-4 rounded-2xl text-base font-bold flex items-center gap-3 transition-all shadow-lg bg-[#2D2D2D] text-white hover:bg-black active:scale-95"
          >
            이 대본으로 발음 코칭받기
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <DownloadModal
        isOpen={isDownloadModalOpen}
        type="GENERAL_SCRIPT"
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownloadSubmit}
      />

    </div>
  );
};

export default Guideline_Script_Page;