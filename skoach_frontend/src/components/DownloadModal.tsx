import React, { useState, useEffect } from 'react';
import { X, FileText, File } from 'lucide-react';
import type { DownloadModalProps } from '../types/download';

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  type,
  onClose,
  onDownload,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'DOCX' | 'PDF'>('DOCX');

  // 모달이 열릴 때마다 포맷을 기본값(DOCX)으로 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedFormat('DOCX');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 오늘 날짜 YYYYMMDD 포맷 함수 (예시 파일명용)
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  };

  const todayStr = getTodayString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 모달 창 */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl p-8 z-10 font-sans animate-in zoom-in-95 duration-200 text-left select-none">
        
        {/* 우상단 닫기 X 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 타이틀 구역 */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">📥</span>
          <h2 className="text-xl font-black text-[#2D2D2D]">대본 다운로드</h2>
        </div>


        {/* 현재 다운로드 상태 정보 상자 (동적 렌더링) */}
        <div className="bg-blue-100 border border-blue-400 rounded-xl p-4 mb-6 text-xs">
          <div className="font-bold text-blue-800 mb-1">
            현재 다운로드: {type === 'GENERAL_SCRIPT' ? '일반 대본' : '발음 하이라이팅 포함 대본'}
          </div>
          <div className="text-blue-700 font-medium font-mono">
            파일명: {todayStr}_PresentAI{type === 'PRONUNCIATION_COACH' && '_Highlight'}.{selectedFormat.toLowerCase()}
          </div>
        </div>

        {/* 파일 형식 선택 섹션 */}
        <div className="mb-8">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
            파일 형식 선택
          </label>
          <div className="space-y-3">
            {/* DOCX 옵션 */}
            <div
              onClick={() => setSelectedFormat('DOCX')}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedFormat === 'DOCX'
                  ? 'border-black bg-gray-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Custom Radio Button */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  selectedFormat === 'DOCX' ? 'border-black' : 'border-gray-300'
                }`}>
                  {selectedFormat === 'DOCX' && <div className="w-2.5 h-2.5 rounded-full bg-[#5078AF]" />}
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-black text-gray-900">DOCX (Word 문서)</h4>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">편집 가능한 워드 파일</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF 옵션 */}
            <div
              onClick={() => setSelectedFormat('PDF')}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedFormat === 'PDF'
                  ? 'border-black bg-gray-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Custom Radio Button */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  selectedFormat === 'PDF' ? 'border-black' : 'border-gray-300'
                }`}>
                  {selectedFormat === 'PDF' && <div className="w-2.5 h-2.5 rounded-full bg-[#5078AF]" />}
                </div>
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="text-sm font-black text-gray-900">PDF</h4>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">인쇄/공유용 PDF 파일</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 구역 */}
        <div className="flex gap-4">
          <button
            onClick={() => onDownload(selectedFormat)}
            className="flex-1 py-4 bg-[#2D2D2D] hover:bg-black text-white text-base font-black rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            다운로드
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-base font-black rounded-xl transition-all active:scale-[0.98]"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};