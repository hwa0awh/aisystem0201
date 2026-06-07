// components/PremiumModal.tsx
import React from 'react';
import { X, Crown, CheckCircle2 } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-4xl shadow-2xl w-full max-w-md overflow-hidden mx-4 border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* 닫기 버튼 */}
        <div className="flex justify-end p-4 absolute right-2 top-2 z-10">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 모달 상단 비주얼 영역 */}
        <div className="bg-linear-to-b from-blue-50 to-white pt-12 pb-6 px-6 text-center">
          <div className="w-14 h-14 bg-linear-to-tr from-blue-600 to-indigo-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-100 animate-bounce duration-1000">
            <Crown size={28} className="fill-current" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">유료 회원 전용 기능입니다</h2>
          <p className="text-xs font-bold text-blue-600 mt-1.5 uppercase tracking-widest">SKOACH PREMIUM ONLY</p>
        </div>

        {/* 모달 본문 혜택 안내 */}
        <div className="px-8 pb-4 space-y-3">
          <p className="text-sm font-bold text-gray-500 text-center mb-5 leading-relaxed">
            지금 프리미엄 플랜으로 업그레이드하고<br />발표 대본을 무제한으로 편집해보세요!
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-100">
            <div className="flex items-center gap-2.5 text-sm font-bold text-gray-700">
              <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
              <span>원하는 문장만 쏙쏙! 슬라이드별 부분 재생성</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-bold text-gray-700">
              <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
              <span>AI 실시간 정밀 발음 코칭 & 피드백</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-bold text-gray-700">
              <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
              <span>작성된 대본 무제한 다운로드 권한</span>
            </div>
          </div>
        </div>

        {/* 모달 푸터 액션 버튼 */}
        <div className="p-6 pt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onUpgrade}
            className="w-full py-4 bg-[#2D2D2D] text-white rounded-2xl font-black text-sm hover:bg-black transition shadow-lg active:scale-95"
          >
            프리미엄 혜택 받으러 가기
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-white text-gray-400 rounded-2xl font-bold text-xs hover:text-gray-600 transition"
          >
            다음에 하기
          </button>
        </div>

      </div>
    </div>
  );
};

export default PremiumModal;