// components/RefreshModal.tsx
import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';

interface RefreshModalProps {
  isOpen: boolean;
  currentContent: string;
  initialTime: string;
  initialStyle: string;
  onClose: () => void;
  onRefreshStart: (refreshData: { time: string; style: string; prompt: string }) => void;
}

const RefreshModal: React.FC<RefreshModalProps> = ({
  isOpen,
  currentContent,
  initialTime,
  initialStyle,
  onClose,
  onRefreshStart,
}) => {
  const [time, setTime] = useState(initialTime);
  const [style, setStyle] = useState(initialStyle);
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const quickSelections = ['더 짧게', '더 길게', '핵심만', '인사 추가'];

  const handleQuickSelect = (text: string) => {
    setPrompt((prev) => (prev ? `${prev} / ${text}` : text));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden mx-4 animate-in zoom-in-95 duration-200 p-8 space-y-6">
        
        {/* 헤더 영역 */}
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block text-[11px] font-black bg-[#6366F1] text-white px-2.5 py-1 rounded-md mb-2">
              유료 회원 전용
            </span>
            <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <RefreshCw className="w-5 h-5 text-[#6366F1]" />
              <h2>부분 재생성</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 영역 */}
        <div className="space-y-5">
          {/* 현재 대본 (읽기 전용 고정창) */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">현재 대본</label>
            <div className="w-full h-24 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm leading-relaxed text-gray-500 overflow-y-auto select-none">
              {currentContent}
            </div>
          </div>

          {/* 발표 시간 변경 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">발표 시간 변경</label>
            <div className="flex gap-3">
              {['5분', '10분', '15분 이상'].map((item) => (
                <label 
                  key={item} 
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer transition-all ${
                    time === item ? 'border-black bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="refresh-time"
                    className="accent-black w-4 h-4"
                    checked={time === item}
                    onChange={() => setTime(item)}
                  />
                  <span className="text-sm font-bold text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 말투 변경 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">말투 변경</label>
            <div className="flex gap-3">
              {['격식체 (합니다)', '친근한 구어체', '전문적 (학술)'].map((item) => (
                <label 
                  key={item} 
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer transition-all ${
                    style === item ? 'border-black bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="refresh-style"
                    className="accent-black w-4 h-4"
                    checked={style === item}
                    onChange={() => setStyle(item)}
                  />
                  <span className="text-sm font-bold text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 재생성 요구사항 자유 입력 */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <label className="text-sm font-semibold text-gray-700">재생성 요구사항</label>
              <span className="text-xs font-bold text-[#6366F1]">(자유 입력)</span>
            </div>
            <textarea
              className="w-full h-24 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6366F1] focus:outline-none resize-none text-sm leading-relaxed placeholder:text-gray-300"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 더 간결하게 / 인사말 빼고 바로 주제로 / 임원 대상이니 더 격식있게 / 숫자 데이터 강조해줘"
            />
          </div>

          {/* 빠른 선택 칩 배너 */}
          <div>
            <span className="block text-xs font-semibold text-gray-400 mb-2">빠른 선택</span>
            <div className="flex gap-2">
              {quickSelections.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickSelect(chip)}
                  className="px-3 py-1.5 border border-gray-200 rounded-full text-xs font-bold text-gray-500 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 푸터 영역 버튼 패널 */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => onRefreshStart({ time, style, prompt })}
            className="flex-1 py-4 bg-[#6366F1] text-white rounded-2xl font-black text-sm hover:bg-[#4F46E5] transition shadow-lg shadow-indigo-100 active:scale-95"
          >
            재생성 시작
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-4 border border-gray-200 bg-white rounded-2xl font-black text-sm text-gray-700 hover:bg-gray-50 transition active:scale-95"
          >
            취소
          </button>
        </div>

      </div>
    </div>
  );
};

export default RefreshModal;