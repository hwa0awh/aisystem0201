import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, ArrowUp, X, ChevronRight, Clock, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';


const File_Upload_Page: React.FC = () => {
  const [progress, setProgress] = useState(0); 
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [subject, setSubject] = useState("");
  const [outline, setOutline] = useState(""); 

  // --- 발표 설정 관련 상태 추가 ---
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [time, setTime] = useState("5분");
  const [style, setStyle] = useState("격식체");

  const [toast, setToast] = useState<{ isOpen: boolean; messages: string[] }>({
    isOpen: false,
    messages: [],
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const timeOptions = ["5분", "10분", "15분", "20분 이상"];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: any;
    
    if (file) {
      setProgress(0); // 새 파일이면 초기화
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1; // 1씩 증가
        });
      }, 30); // 속도 조절
    } else {
      setProgress(0); // 파일 삭제 시 초기화
      if (interval) clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [file]);

  const handleFile = (files: FileList | null) => {
    if (files && files[0]) {
      const selectedFile = files[0];
      // 확장자 제한 (PPT, PPTX, PDF)
      const allowedTypes = ['/pdf', '/pptx', '/ppt'];
      
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(pptx|ppt|pdf)$/i)) {
        setFile(selectedFile);
        console.log("업로드된 파일:", selectedFile.name);
      } else {
        alert("PPT, PPTX, PDF 파일만 업로드 가능합니다.");
      }
    }
  };

  const handleNextStep = () => {
    const errors: string[] = [];

    if (!file) {
      errors.push("발표 슬라이드(PPT/PDF) 자료를 업로드해주세요.");
    } else if (progress < 100) {
      errors.push("업로드한 슬라이드 자료 분석이 아직 진행 중입니다.");
    }

    if (!subject.trim()) {
      errors.push("발표 주제를 입력해주세요.");
    }

    // 파일/주제가 누락되었다면 화면 중앙 토스트로 차단
    if (errors.length > 0) {
      setToast({ isOpen: true, messages: errors });
      return;
    }

    // 필수 조건 통과 시, 토스트를 닫고 "최종 확인 모달"을 띄움
    setToast({ isOpen: false, messages: [] });
    setIsConfirmModalOpen(true);
  };

  // 2단계: 모달에서 최종 [네, 맞습니다] 클릭 시 페이지 진짜 이동
  const handleFinalConfirm = () => {
    setIsConfirmModalOpen(false);
    navigate('/script-preview', { state: { subject, time, style, outline } });
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files);
  }, []);

  // 클릭 이벤트 핸들러
  const onContainerClick = () => {
    fileInputRef.current?.click();
  };

  // 다음 단계 이동 활성화 조건 (파일 분석 완료 혹은 주제 입력 완료 시)
  // const isReady = (file && progress === 100) || subject.trim().length > 0;

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
        onConfirm={handleFinalConfirm} // 최종 이동 함수 실행
      />
      <div className="max-w-7xl mx-auto">
        
        {/* --- 1. 중앙 스텝 인디케이터 --- */}
        <div className="flex items-center justify-center gap-4 sm:gap-12 mb-16 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg">1</div>
            <span className="font-black text-sm sm:text-base text-gray-800">자료 업로드/가이드라인 입력</span>
          </div>
          <div className="w-8 sm:w-16 h-px bg-gray-300" />
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center text-sm font-black text-gray-400">2</div>
            <span className="font-bold text-sm sm:text-base text-gray-400">대본 미리보기</span>
          </div>
          <div className="w-8 sm:w-16 h-px bg-gray-300" />
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center text-sm font-black text-gray-400">3</div>
            <span className="font-bold text-sm sm:text-base text-gray-400">대본 생성</span>
          </div>
        </div>

        {/* --- 2. 메인 입력 영역 (좌우 분할 통합) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-stretch">
          
          {/* 왼쪽: 파일 업로드 카드 */}
          <div className="bg-white rounded-[40px] p-8 sm:p-10 border border-gray-200 relative group transition-all hover:shadow-xl flex flex-col justify-between">
            <h2 className="text-2xl font-black mb-2 text-[#2D2D2D]">
              PPT / PDF 업로드<span className="text-blue-600">(필수)</span>
            </h2>
            <p className="text-sm text-gray-400 mb-8 font-medium">슬라이드 파일을 업로드하면 AI가 내용을 분석합니다.</p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => handleFile(e.target.files)}
              accept=".ppt,.pptx,.pdf"
              className="hidden"
            />

            {/* 업로드 드롭존 */}
            <div 
              onClick={onContainerClick}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative border-2 border-dashed rounded-4xl px-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group/dropzone flex-1 min-h-100
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-400'}
                ${file ? 'border-blue-600 bg-blue-50/30' : ''}
              `}
            >
              {file && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // 부모 클릭(파일창 열기) 방지
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-4 right-4 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm z-20"
                >
                  <X size={18} />
                </button>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform 
                ${isDragging ? 'scale-110 bg-blue-500 text-white' : 'bg-gray-50 text-gray-400 group-hover/dropzone:scale-110'}
              `}>
                <ArrowUp size={28} />
              </div>
              
              {file ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <p className="font-bold text-blue-600 mb-1 break-all px-4">{file.name}</p>
                  <p className="text-[11px] text-blue-400 font-bold uppercase">파일이 선택되었습니다</p>
                </div>
              ) : (
                <>
                  <p className="font-bold text-gray-800 mb-1 break-keep">파일을 여기에 끌어다 놓거나 클릭하세요</p>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">PPT, PPTX, PDF 지원 · 최대 20MB</p>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button 
                onClick={onContainerClick}
                className="bg-[#F4F4F4] hover:bg-gray-300 px-10 py-4 rounded-2xl font-black text-sm transition-colors shadow-sm active:scale-95"
              >
                {file ? "파일 변경" : "파일 선택"}
              </button>
              
              {!file && (
                <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] hidden sm:inline">
                  or Drag & Drop
                </span>
              )}
            </div>
          </div>

          {/* 오른쪽: 주제 입력 및 발표 상세 설정 통합 카드 */}
          <div className="bg-white rounded-[40px] p-8 sm:p-10 border border-gray-200 transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <h2 className="text-2xl font-black mb-2 text-[#2D2D2D]">주제 설정 및 가이드라인</h2>
            <p className="text-sm text-gray-400 mb-8 font-medium">발표의 핵심 정보와 스타일을 원하는 대로 구성하세요.</p>
            
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
                <label className="block text-[15px] font-black text-gray-800 mb-3 ml-1 uppercase tracking-widest">목차 / 가이드라인 (선택)</label>
                <textarea 
                  rows={4}
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
                <label className="block text-[15px] font-black text-gray-400 mb-3 uppercase tracking-widest">발표 시간 (선택)</label>
                <div className="relative">
                  <button
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
                <label className="block text-[15px] font-black text-gray-400 mb-3 uppercase tracking-widest">말투 스타일 (선택)</label>
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

        {/* --- 3. 하단 분석 진행 바 --- */}
        {file && (
          <div className="bg-[#D7E3FC] rounded-4xl p-6 sm:p-8 border border-blue-100 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6 w-full sm:w-auto">
              <div className="w-16 h-16 bg-[#5078AF] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                <FileText size={28} />
              </div>
              <div className="shrink-0">
                <h3 className="text-lg font-black text-[#2D2D2D] mb-1 truncate max-w-37.5">{file.name}</h3>
                <p className="text-[11px] text-[#5078AF] font-black uppercase">{(file.size / (1024 * 1024)).toFixed(1)}MB · 분석 가능</p>
              </div>
            </div>

            <div className="flex-1 w-full text-center">
              <h4 className="text-xl sm:text-2xl font-black text-[#2D2D2D] mb-3 tracking-tight">
                {progress < 100 ? "발표 슬라이드 분석 중" : "슬라이드 분석 완료"}
              </h4>
              <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#5078AF] transition-all duration-300 rounded-full" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] font-black text-[#5078AF] mt-3 tracking-[0.3em] uppercase">
                {progress < 100 ? "ANALYZING PPT STRUCTURE..." : "READY TO NEXT STEP"}
              </p>
            </div>

            <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-4xl sm:text-5xl font-black text-[#5078AF] italic w-32 text-right">{progress}%</div>
              <button 
                onClick={() => setFile(null)}
                className="bg-white/80 hover:bg-white px-6 py-3 rounded-xl text-xs font-black text-gray-500 transition-all active:scale-95 border border-blue-100"
              >
                제거
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- 4. 하단 고정 내비게이션 바 --- */}
      <div className="w-full bg-[#FAFAFA] border-t border-gray-200 mt-15">
        <div className="max-w-7xl mx-auto px-8 py-10 flex justify-end items-center gap-5">
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
            다음 · 대본 미리보기
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default File_Upload_Page;