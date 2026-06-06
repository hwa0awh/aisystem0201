import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export default function PPT_Upload() {
  const navigate = useNavigate();

  // --- 상태 관리 (State) ---
  const [guideline, setGuideline] = useState(''); // 가이드라인 텍스트
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 업로드 파일
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태
  const [tone, setTone] = useState<'formal' | 'casual'>('formal'); // 말투 설정
  const [showModal, setShowModal] = useState(false); // 커스텀 모달 표시 여부

  // --- 참조 (Ref) ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 파일 처리 로직 ---
  // 사용자가 파일을 선택하거나 드롭했을 때, 허용된 확장자인지 체크
  const processFile = (file: File) => {
    const allowedExtensions = ['ppt', 'pptx', 'pdf'];
    // 파일명에서 확장자만 추출하여 소문자로 변환
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    // 확장자가 존재하고 허용 목록에 포함되어 있는지 확인
    if (fileExtension && allowedExtensions.includes(fileExtension)) {
      setSelectedFile(file);
    } else {
      // 확장자가 맞지 않을 때 경고문
      setShowModal(true);
    }
  };

  // 업로드 카드 클릭 이벤트
  const handleCardClick = () => {
    if (!selectedFile) fileInputRef.current?.click();
  };

  // 파일 입력창(input) 변경 이벤트
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // 드래그 오버(Drag Over) 이벤트
  // 파일을 카드 위로 끌고 왔을 때, 브라우저의 기본 동작(파일 열기)을 막고
  // 드래그 중인 상태(isDragging)를 활성화하여 UI 피드백을 줌
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!selectedFile) setIsDragging(true);
  };

  // 드래그 리브(Drag Leave) 이벤트
  // 파일을 카드 밖으로 끌고 나갔을 때 드래그 효과를 해제
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 드롭(Drop) 이벤트
  // 마우스를 놓아 파일을 떨어뜨렸을 때 실행
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // 이미 업로드된 파일이 있다면 추가 처리를 막음
    if (selectedFile) return;

    // 드롭된 데이터에서 파일 목록 중 첫 번째 파일을 추출
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // 파일 초기화(Reset) 로직
  // 선택된 파일을 제거하고, 다시 업로드할 수 있도록 input 값을 비움
  const resetFile = (e: React.MouseEvent) => {
    // 부모 요소(카드)로 클릭 이벤트가 전달되어 파일 창이 다시 뜨는 것을 방지
    e.stopPropagation();
    setSelectedFile(null); // 파일 상태 비우기
    // input 태그의 value를 비워줘야 동일한 파일을 다시 올려도 onChange가 발생함
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    // 전체 컨테이너 디자인: 화면 꽉 차게, 연한 회색 바탕, 중앙 정렬
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#F9FAFB] p-6 overflow-hidden font-noto relative">
      
      {/* 메인 콘텐츠 영역 */}
      {/* 파일 업로드 카드와 가이드라인 카드 두개 가로 배치*/}
      <div className="flex gap-12 items-center justify-center mb-12 transform scale-90 lg:scale-100 origin-center">
        
        {/* 파일 업로드 카드 */}
        <div 
          onClick={handleCardClick} // 클릭 시 파일 탐색기 열기
          onDragOver={handleDragOver} // 드래그 중일 때 시각 효과 처리
          onDragLeave={handleDragLeave} // 드래그가 영역을 벗어날 때
          onDrop={handleDrop} // 파일을 놓았을 때 업로드 처리
          className={`w-96 h-125 rounded-[40px] flex flex-col items-center justify-center p-10 bg-white transition-all duration-300
            ${selectedFile 
              ? 'border-2 border-black shadow-2xl'  // 파일 선택 시: 검은 테두리와 강한 그림자
              : isDragging
                ? 'border-4 border-black bg-gray-50 scale-105 shadow-lg' // 드래그 중일 때 디자인
                : 'border-4 border-dashed border-gray-100 shadow-sm hover:border-gray-400 cursor-pointer' // 기본 디자인
            }`}
        >
          {/* 실제 숨겨진 파일 Input*/}
          {/* 파일을 받으려면 Input이 필요 but 웹 브라우저가 기본적으로 제공하는 input은 디자인 수정이 불가능*/}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".ppt, .pptx, .pdf" 
          />

          {/* 아이콘 표시: 상태(선택/드래그/기본)에 따라 이모지 변경*/}
          <div className="relative mb-10">
            <div className="text-9xl text-black transition-transform duration-300">
              {selectedFile ? '📁' : isDragging ? '➕' : '📤'}
            </div>
            {/* 파일 선택 시 우측 하단에 체크 표시 아이콘*/}
            {selectedFile && (
              <div className="absolute -bottom-2 -right-2 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center border-4 border-white text-xl">
                ✔️
              </div>
            )}
          </div>

          {/* 파일 선택 여부에 따른 텍스트 분기 처리*/}
          {selectedFile ? (
            // Case1: 파일이 선택되었을 때(파일명 표시 및 삭제 버튼)
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-3 mb-10">
                <span className="text-2xl font-extrabold truncate max-w-50">
                  {selectedFile.name}
                </span>
                <button 
                  onClick={resetFile} 
                  className="text-2xl font-light cursor-pointer hover:text-red-500 transition-colors"
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
            // Case2: 파일이 선택되지 않았을 때 (안내 문구)
            <div className="flex flex-col items-center pointer-events-none">
              <h2 className="text-3xl font-black mb-8">
                {isDragging ? "여기에 놓으세요!" : "PPT 업로드"} 
              </h2>
              <p className="text-gray-400 text-center text-sm leading-relaxed">
                PPT 파일을 드래그하거나<br />클릭하여 업로드하세요.
              </p>
              <p className="mt-8 text-red-500 text-xs font-semibold flex items-center gap-1">
                ⚠️ PDF 또는 PPTX 형식의 파일만 업로드 가능합니다.
              </p>
            </div>
          )}
        </div>

        {/* 가이드라인 카드 */}
        <div className="w-96 h-125 border-2 border-black rounded-[40px] flex flex-col items-center p-10 bg-white shadow-2xl">
          <div className="text-9xl mt-6 mb-8 text-black">✔️</div>
          <h2 className="text-3xl font-black mb-8">가이드 라인</h2>

          {/* 말투 선택 탭 (격식vs편안)*/}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 w-full">
            <button
              onClick={() => setTone('formal')}
              className={`flex-1 py-3 rounded-xl text-base font-bold transition-all ${
                tone === 'formal' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              격식
            </button>
            <button
              onClick={() => setTone('casual')}
              className={`flex-1 py-3 rounded-xl text-base font-bold transition-all ${
                tone === 'casual' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              편안
            </button>
          </div>
            
          {/* 가이드라인 입력 */}
          <div className="w-full px-1 text-center mb-auto">
            <textarea 
              value={guideline}
              onChange={(e) => setGuideline(e.target.value)}
              placeholder="발표 주제, 발표 대상 등 가이드 라인을 작성해주세요."
              className="w-full h-24 p-6 border border-gray-100 rounded-3xl text-sm text-center resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-300 bg-white shadow-inner leading-relaxed"
              style={{ textAlignLast: 'center' }}
            />
          </div>
        </div>
      </div>

      {/* 생성 버튼 (파일 업로드 여부 체크 후 페이지 이동) */}
      <Button 
        text="생성" 
        width="w-64"
        onClick={() => {
          if (!selectedFile) {
            setShowModal(true); // 파일 없을 때 경고문
          } else {
            console.log("선택 데이터:", { file: selectedFile.name, tone, guideline });
            navigate('/script-generate'); 
          }
        }}
      />

      {/*파일이 없거나 잘못된 파일 형식일 경우 경고문*/}
      {showModal && (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
        
        <div className="relative bg-white w-full max-w-sm rounded-[35px] border-2 border-black p-10 shadow-2xl text-center">
          <div className="text-6xl mb-6">🤖</div>
          <h3 className="text-xl font-black mb-2 text-black">파일이 없거나 형식이 틀렸습니다.</h3>
          <p className="text-gray-500 text-[12px] mb-8 leading-relaxed">
            PPT 또는 PDF 파일을 업로드해야<br />발표 대본을 생성할 수 있습니다.
          </p>
          <button 
            onClick={() => setShowModal(false)}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95"
          >
            확인
          </button>
        </div>
      </div>
      )}
    </div>
  );
}