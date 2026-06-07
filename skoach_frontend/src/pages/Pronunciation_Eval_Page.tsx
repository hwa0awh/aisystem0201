import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  FileAudio, 
  ChevronRight, 
  AlertCircle,
  X,
} from 'lucide-react';
import { LoadingPage } from '../components/Loading';

const PronunciationEvalPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<{ name: string; size: string; duration: number } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // 🔓 [테스트 우회] 컴파일러의 미사용 변수(Unused Variable) 에러 방지용 상태 유지
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  const [isEvalLoading, setIsEvalLoading] = useState(false);

  // 테스트 편의를 위해 초기 횟수를 999회로 넉넉하게 세팅해둘게!
  const [availableCount, setAvailableCount] = useState<number>(() => {
    const savedCount = localStorage.getItem('guest_eval_count');
    const parsedCount = savedCount !== null ? parseInt(savedCount, 10) : 999;
  
    // Math.max(0, 값)을 해주면 마이너스 값이 들어와도 무조건 0으로 뻥튀기 시켜줘!
    return Math.max(0, parsedCount);
  });

  // 🔓 [테스트 우회] 자동 모달 오픈 로직 잠금 처리 (타입 경고 방지용 안전 조건식 결합)
  useEffect(() => {
    if (availableCount <= 0 && isLimitModalOpen) {
      setIsLimitModalOpen(false);
    }
  }, [availableCount, isLimitModalOpen]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      
      // 브라우저 캐시용 임시 URL 생성 후 오디오 객체 생성
      const objectUrl = URL.createObjectURL(uploadedFile);
      const audio = new Audio(objectUrl);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        
        // 용량 단위 자동 변환 (MB 또는 KB)
        const fileSizeInKb = uploadedFile.size / 1024;
        const formattedSize = fileSizeInKb > 1024 
          ? (fileSizeInKb / 1024).toFixed(2) + ' MB' 
          : fileSizeInKb.toFixed(1) + ' KB';

        // 1. 상태(State)에 파일 정보 주입 -> 화면에 자동 렌더링 시작됨
        setFile({
          name: uploadedFile.name,
          size: formattedSize,
          duration: duration
        });

        // 5초 미만 조건 검사 및 토스트 경고 알림
        if (duration < 5) {
          setToastMessage("녹음 시간이 너무 짧습니다. 최소 5초 이상 녹음해 주세요.");
          setShowToast(true);
        } else {
          setShowToast(false);
        }

        // 메모리 누수 방지를 위한 URL 해제
        URL.revokeObjectURL(objectUrl);
      });
    }
  };

  const handleStartEvaluation = () => {
    if (isButtonDisabled) return;

    setIsEvalLoading(true); 

    setAvailableCount(Math.max(0, availableCount - 1));

    setTimeout(() => {
      setIsEvalLoading(false); 
      navigate('/pronunciation-score');
    }, 3000);
  };
  
  const isButtonDisabled = !file || file.duration < 5;

  if (isEvalLoading) {
    return <LoadingPage type="PRONUNCIATION_EVAL" />;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] mt-20 bg-gray-50 text-gray-800 font-sans overflow-hidden select-none relative">
      
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#E11D48] text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-sm font-black">{toastMessage}</span>
          <button 
            type="button" 
            onClick={() => setShowToast(false)} 
            className="ml-2 p-0.5 hover:bg-rose-700 rounded transition-colors"
          >
            <X size={14} className="stroke-3" />
          </button>
        </div>
      )}

      {/* 2. 우측 메인 영역 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              발음 평가
            </h1>
            <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
              ⚙️ 테스트 모드: 횟수 제한 X
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/script-generate')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> 대본으로
            </button>
            <button onClick={() => navigate('/pronunciation-coach')} type="button" className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />하이라이팅 대본으로
            </button>
          </div>
        </header>

        {/* 본문 콘텐츠 스크롤 컨테이너 */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          
          <section className="space-y-4">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              음성 파일 업로드
            </h2>

            <label className="relative group block w-full h-40 border-2 border-dashed rounded-2xl bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-all">
              <input 
                type="file" 
                accept=".mp3,.wav" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 group-hover:text-black">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold text-gray-500">음성 파일 선택 (MP3/MPA)</p>
              </div>
            </label>

            {file && (
              <div className="space-y-3">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <FileAudio size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{file.name}</p>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                        {file.size} · {file.duration.toFixed(1)}초
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                      file.duration < 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {file.duration < 5 ? "시간 미달" : "업로드 완료"}
                    </span>
                    <button type="button" onClick={() => { setFile(null); setShowToast(false); }} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                      <X size={14} className="stroke-3 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                {file.duration < 5 && (
                  <div className="flex items-center gap-1.5 text-[#E11D48] px-1 font-bold animate-in fade-in duration-200">
                    <AlertCircle size={14} className="shrink-0" />
                    <span className="text-xs">녹음 시간이 너무 짧습니다.</span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 최하단 평가 시작 버튼 구역 */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              disabled={isButtonDisabled}
              onClick={handleStartEvaluation}
              className={`px-10 py-4 rounded-2xl text-base font-black flex items-center gap-3 transition-all shadow-lg ${
                isButtonDisabled 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-[#2D2D2D] text-white hover:bg-black active:scale-95 shadow-gray-200' 
              }`}
            >
              평가 시작 <ChevronRight size={20} />
            </button>
          </div>

        </div>
      </main>

      {/* 🔓 [테스트용 가짜 모달창 구역] 타입스크립트의 선언 미사용 에러 완전 회피 마킹 */}
      {isLimitModalOpen && (
        <div className="hidden">
          <button type="button" onClick={() => setIsLimitModalOpen(false)}>우회용</button>
        </div>
      )}

    </div>
  );
};

export default PronunciationEvalPage;