import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export default function Recording_Upload() {
  const navigate = useNavigate();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const allowedExtensions = ['mp3', 'wav'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension && allowedExtensions.includes(fileExtension)) {
      setSelectedFile(file);
    } else {
      setShowModal(true); 
    }
  };

  const handleCardClick = () => { if (!selectedFile) fileInputRef.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); if (!selectedFile) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="h-full w-full flex flex-col items-center bg-[#F9FAFB] font-noto relative">
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full">
        
        {/* 녹음 파일 업로드 카드 */}
        <div 
          onClick={handleCardClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-96 h-125 rounded-[40px] flex flex-col items-center justify-center p-8 bg-white transition-all duration-300
            ${selectedFile 
              ? 'border-2 border-black shadow-2xl'
              : isDragging 
                ? 'border-4 border-black bg-gray-50 scale-105 shadow-lg'
                : 'border-4 border-dashed border-gray-200 shadow-sm hover:border-gray-400 cursor-pointer'
            }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".mp3, .wav" 
          />

          {/* 아이콘 영역 */}
          <div className="relative mb-8 pointer-events-none">
            <div className="text-8xl text-black">
              {selectedFile ? '🎙️' : isDragging ? '➕' : '📤'}
            </div>
            
            {selectedFile && (
              <div className="absolute -bottom-2 -right-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center border-4 border-white text-xs">
                ✔️
              </div>
            )}
          </div>

          {/* 텍스트 및 버튼 영역 */}
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center justify-center gap-2 mb-8 w-full px-4">
              <h2 className="text-2xl font-bold text-black truncate max-w-55">
                {selectedFile 
                  ? selectedFile.name                   
                  : isDragging 
                    ? "여기에 놓으세요!"                 
                    : "녹음 파일 업로드"               
                }
              </h2>
              {/* 파일이 있을 때만 X 버튼 표시 */}
              {selectedFile && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  className="text-xl font-light cursor-pointer hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* 하단 설명 혹은 다시 업로드 버튼 */}
            {selectedFile ? (
              <button 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-8 py-3 border-2 border-black rounded-2xl font-bold text-base hover:bg-gray-50 transition-colors"
              >
                다시 업로드
              </button>
            ) : (
              <p className="text-gray-400 text-sm text-center leading-relaxed">
                대본 발표를 녹음한 파일을 업로드해주세요.
              </p>
            )}
          </div>
        </div>

        {/* 하단 코칭 버튼 */}
        <div className="mt-10">
          <Button 
            text="코칭" 
            className="px-24 py-4 text-xl rounded-2xl shadow-lg active:scale-95 transition-all bg-black text-white font-bold"
            onClick={() => {
              if (!selectedFile) setShowModal(true);
              else navigate('/feedback-presentation');
            }}
          />
        </div>
      </main>

      {/* 모달 생략 (동일) */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[30px] border-2 border-black p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-5xl mb-4">📢</div>
            <h3 className="text-lg font-bold mb-2">녹음 파일을 확인해주세요.</h3>
            <p className="text-gray-500 text-xs mb-6">녹음 파일(.mp3, .wav)을<br/>업로드해야 코칭을 시작할 수 있습니다.</p>
            <button onClick={() => setShowModal(false)} className="w-full py-3 bg-black text-white rounded-xl font-bold">확인</button>
          </div>
        </div>
      )}
    </div>
  );
}