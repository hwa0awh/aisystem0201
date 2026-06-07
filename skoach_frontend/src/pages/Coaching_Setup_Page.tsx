import React, { useEffect, useState } from 'react';
import { ChevronRight, FileText, UploadCloud, Type, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const Coaching_Setup_Page: React.FC = () => {
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [inputType, setInputType] = useState<"text" | "file">("text"); // 입력 방식 선택
  const [scriptText, setScriptText] = useState(""); // 직접 입력 대본
  const [file, setFile] = useState<File | null>(null); // 업로드 파일
  const [progress, setProgress] = useState(0); // 파일 분석 프로그레스

  const [toast, setToast] = useState<{ isOpen: boolean; messages: string[] }>({
    isOpen: false,
    messages: [],
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- 파일 가짜 분석 이펙트 (기존 로직 유지) ---
  useEffect(() => {
    let interval: any;
    if (file && inputType === 'file') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 20);
    } else {
      setProgress(0);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [file, inputType]);

  // --- 드래그 앤 드롭 핸들러 ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // --- 다음 단계 검증 ---
  const handleNextStep = () => {
    const errors: string[] = [];

    if (inputType === 'text' && !scriptText.trim()) {
      errors.push("발음 코칭을 진행할 대본 텍스트를 입력해주세요.");
    }
    
    if (inputType === 'file') {
      if (!file) {
        errors.push("대본 파일(DOCX/TXT/PDF)을 업로드해주세요.");
      } else if (progress < 100) {
        errors.push("업로드한 대본 파일 분석이 아직 진행 중입니다.");
      }
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
    // 실전 발음 코칭 연습 페이지로 데이터 전송하며 이동
    navigate('/guideline-coach', { 
      state: { 
        inputType, 
        script: inputType === 'text' ? scriptText : file?.name, 
      } 
    });
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
        title={`대본 입력 또는 발표 대본을\n모두 알맞게 설정하셨습니까?`}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleFinalConfirm}
      />
      
      <div className="max-w-7xl mx-auto">
        
        {/* --- 1. 스텝 인디케이터 --- */}
        <div className="flex items-center justify-center gap-4 sm:gap-12 mb-16 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg">1</div>
            <span className="font-black text-sm sm:text-base text-gray-800">코칭 대본 업로드</span>
          </div>
          <div className="w-8 sm:w-16 h-px bg-gray-300" />
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center text-sm font-black text-gray-400">2</div>
            <span className="font-bold text-sm sm:text-base text-gray-400">실시간 발음 코칭</span>
          </div>
          <div className="w-8 sm:w-16 h-px bg-gray-300" />
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center text-sm font-black text-gray-400">3</div>
            <span className="font-bold text-sm sm:text-base text-gray-400">코칭 리포트</span>
          </div>
        </div>

        {/* --- 2. 메인 와이드 카드 콘텐츠 --- */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-[40px] p-8 sm:p-12 border border-gray-200 transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-[#2D2D2D]">발음 코칭 대본 설정</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-10 font-medium">연습할 대본을 넣고 스피치 가이드라인을 세팅하세요.</p>
            
            {/* 탭 메뉴: 텍스트 직접 입력 vs 파일 업로드 */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#F4F4F4] rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setInputType("text")}
                className={`py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${inputType === 'text' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Type size={16} /> 대본 직접 입력
              </button>
              <button
                type="button"
                onClick={() => setInputType("file")}
                className={`py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${inputType === 'file' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <UploadCloud size={16} /> 대본 파일 업로드
              </button>
            </div>

            {/* 상단 분기 피드: 입력 양식 */}
            <div className="space-y-6 pb-8 border-b border-gray-100">
              {inputType === 'text' ? (
                <div>
                  <label className="block text-[15px] font-black text-gray-800 mb-3 ml-1 uppercase tracking-widest">대본 내용 입력 <span className="text-blue-600">(필수)</span></label>
                  <textarea 
                    rows={8}
                    value={scriptText}
                    onChange={(e) => setScriptText(e.target.value)}
                    placeholder="발표 연습을 진행할 대본 전체를 입력하거나 붙여넣기 해주세요."
                    className="w-full px-6 py-5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 bg-white placeholder:text-gray-300 font-bold text-sm resize-none leading-relaxed"
                  />
                  <div className="text-right text-xs text-gray-400 font-bold mt-2 mr-1">
                    글자 수: {scriptText.length}자
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[15px] font-black text-gray-800 mb-3 ml-1 uppercase tracking-widest">대본 파일 등록 <span className="text-blue-600">(필수)</span></label>
                  
                  {!file ? (
                    <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-white hover:bg-gray-50/50 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <UploadCloud size={40} className="text-gray-300 group-hover:text-blue-500 transition-colors mb-4" />
                        <p className="text-sm font-black text-gray-700 mb-1">클릭하거나 파일을 여기로 드래그하세요</p>
                        <p className="text-xs text-gray-400 font-medium">DOCX, TXT, PDF (최대 20MB)</p>
                      </div>
                      <input type="file" accept=".docx, .txt, .pdf" className="hidden" onChange={handleFileChange} />
                    </label>
                  ) : (
                    /* 파일 업로드 진행 및 완료바 카드 */
                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                          <FileText size={22} />
                        </div>
                        <div className="min-w-0 flex-1 sm:flex-none">
                          <h4 className="text-sm font-black text-[#2D2D2D] truncate max-w-50 sm:max-w-62.5">{file.name}</h4>
                          <p className="text-[10px] text-blue-600 font-bold uppercase">{(file.size / 1024).toFixed(0)} KB · 분석가능</p>
                        </div>
                      </div>

                      <div className="flex-1 w-full">
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-blue-100">
                          <div className="h-full bg-blue-600 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-xl font-black text-blue-600 italic w-12 text-right">{progress}%</span>
                        <button type="button" onClick={() => setFile(null)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. 하단 고정 내비게이션 바 --- */}
      <div className="w-full bg-[#FAFAFA] border-t border-gray-200 mt-15">
        <div className="max-w-4xl mx-auto px-4 sm:px-0 py-10 flex justify-end items-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="px-10 py-4 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-400 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            이전
          </button>
          
          <button 
            type="button"
            onClick={handleNextStep} 
            className="px-10 py-4 rounded-2xl text-base font-bold flex items-center gap-3 transition-all shadow-lg bg-[#2D2D2D] text-white hover:bg-black active:scale-95"
          >
            다음 · 실전 발음 코칭
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coaching_Setup_Page;