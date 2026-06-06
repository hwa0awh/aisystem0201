import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export default function Script_Upload() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태 추가
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 처리 공통 함수
  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      // 파일 확장자 체크 (pdf, docx)
      const allowedExtensions = /(\.pdf|\.docx)$/i;
      if (!allowedExtensions.exec(file.name)) {
        alert("PDF 또는 DOCX 파일만 업로드 가능합니다.");
        return;
      }
      setSelectedFile(file);
    }
  };

  // 드래그 이벤트 핸들러
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // 클릭 시 파일 선택창 열기
  const handleCardClick = () => {
    if (!selectedFile) fileInputRef.current?.click();
  };

  // 파일 입력 변경 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  // 파일 초기화
  const resetFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#F9FAFB] p-4 overflow-hidden font-noto">
      
      {/* 카드 섹션 */}
      <div className="flex items-center justify-center mb-10 transform scale-90 lg:scale-100 origin-center">
        <div 
          onClick={handleCardClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`w-96 h-125 rounded-[40px] flex flex-col items-center justify-center p-8 bg-white transition-all duration-200
            ${selectedFile 
            ? 'border-2 border-black shadow-2xl'
            : isDragging 
              ? 'border-4 border-black bg-gray-50 scale-105 shadow-lg'
              : 'border-4 border-dashed border-gray-100 shadow-sm hover:border-gray-400 cursor-pointer'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf, .docx" 
          />

          <div className="relative mb-6 pointer-events-none">
            <div className="text-8xl text-black">
              {selectedFile ? '📄' : isDragging ? '➕' : '📤'}
            </div>
            {selectedFile && (
              <div className="absolute -bottom-2 -right-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center border-4 border-white">
                ✔️
              </div>
            )}
          </div>

          {selectedFile ? (
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-2 mb-8">
                <span className="text-xl font-extrabold truncate max-w-37.5">
                  {selectedFile.name}
                </span>
                <button 
                  onClick={resetFile} 
                  className="text-xl font-light cursor-pointer hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 border-2 border-black rounded-2xl font-bold text-base hover:bg-gray-50 transition-colors"
              >
                다시 업로드
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center pointer-events-none">
              <h2 className="text-2xl font-extrabold mb-6">
                {isDragging ? "여기에 놓으세요!" : "발표 대본 업로드"}
              </h2>
              <p className="text-gray-400 text-xs leading-relaxed">
                발표 대본을 드래그하거나<br />클릭하여 업로드하세요.
              </p>
              <p className="mt-8 text-red-500 text-xs font-semibold flex items-center gap-1">
                ⚠️ PDF 또는 DOCX 형식의 파일만 가능합니다.
              </p>
            </div>
          )}
        </div>
      </div>

      <Button 
        text="다음" 
        className="px-24 py-4 text-xl rounded-2xl shadow-lg active:scale-95 transition-all"
        onClick={() => {
          if (!selectedFile) {
            setShowErrorModal(true);
          } else {
            navigate('/highlight-script');
          }
        }}
      />
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowErrorModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[30px] border-2 border-black p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-5xl mb-4">📢</div>
            <h3 className="text-lg font-bold mb-2">대본을 확인해주세요!</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">발표 코칭을 시작하려면<br/>대본 파일을 업로드해야 합니다.</p>
            <button onClick={() => setShowErrorModal(false)} className="w-full py-3 bg-black text-white rounded-xl font-bold">확인</button>
          </div>
        </div>
      )}
    </div>
  );
}