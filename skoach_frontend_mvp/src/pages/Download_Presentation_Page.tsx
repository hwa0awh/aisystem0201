import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Download_Presentation() {
  const navigate = useNavigate();

  // 모달 상태 관리 (다운로드 완료 알림 / 코칭 경고 알림)
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#F9FAFB] p-6 overflow-hidden">
      
      <div className="flex flex-col items-center mb-10">
        <div className="w-48 h-48 bg-white border-8 border-black rounded-[40px] flex items-center justify-center shadow-sm">
          <div className="text-[100px] text-black font-bold">📄</div> 
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* 버튼 1: 단순 다운로드 */}
        <button 
          className="w-full py-4 bg-black text-white rounded-xl text-lg font-bold shadow-lg active:scale-95 transition-all"
          onClick={() => setShowDownloadModal(true)}
        >
          대본(.docx) 다운로드
        </button>

        {/* 버튼 2: 다운로드 & 발표 코칭 */}
        <button 
          className="w-full py-4 bg-black text-white rounded-xl text-lg font-bold shadow-lg active:scale-95 transition-all"
          onClick={() => setShowCoachingModal(true)} 
        >
          대본(.docx) 다운로드 & 발표 코칭
        </button>
      </div>

      {/* 하단 고정 주의사항 텍스트 */}
      <p className="mt-8 text-red-500 text-sm font-semibold flex items-center gap-1">
        ⚠️ 발표 코칭 모드에서는 대본을 수정할 수 없으니 유의해주세요.
      </p>

      {/* --- 모달 1: 일반 다운로드 시작 알림 --- */}
      {showDownloadModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDownloadModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[30px] border-2 border-black p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-5xl mb-4">📢</div>
            <h3 className="text-lg font-bold mb-2">다운로드를 시작합니다.</h3>
            <p className="text-gray-500 text-sm mb-6">
              대본 DOCX 파일 생성이 완료되었습니다.<br/>
              확인 버튼을 누르면 메인으로 이동합니다.
            </p>
            <button 
              onClick={() => { setShowDownloadModal(false); navigate('/'); }} 
              className="w-full py-3 bg-black text-white rounded-xl font-bold active:scale-95"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* --- 모달 2: 코칭 모드 진입 전 주의사항 알림 --- */}
      {showCoachingModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCoachingModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[30px] border-2 border-black p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold mb-2">잠시 확인해주세요!</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              발표 코칭 모드에서는 <span className="text-black font-bold underline">대본을 수정할 수 없습니다.</span><br/>
              이대로 코칭을 시작하시겠습니까?
            </p>
            
            {/* 버튼 영역: 취소와 확인 두 개를 배치 */}
            <div className="flex gap-3">
              <button 
                onClick={() => {setShowCoachingModal(false); navigate('/final-script')}} 
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold active:scale-95 transition-all"
              >
                취소
              </button>
              <button 
                onClick={() => { setShowCoachingModal(false); navigate('/script-upload'); }} 
                className="flex-1 py-3 bg-black text-white rounded-xl font-bold active:scale-95 transition-all"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}