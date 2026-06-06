import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export default function Highlight_Script() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const scriptData = [
    { text: "이번 ", highlight: false },
    { 
      text: "판례", 
      highlight: true, 
      pronunciation: "판녜",
      note: "유음화 예외 현상입니다. [ㄴ]으로 발음하세요." 
    },
    { text: "의 핵심은 ", highlight: false },
    { 
      text: "공권력", 
      highlight: true, 
      pronunciation: "공꿘녁", 
      note: "된소리 및 비음화 주의" 
    },
    { text: "의 남용을 막는 것입니다.", highlight: false },
  ];

  // 2. 확인 버튼 클릭 시 동작
  const handleConfirm = () => {
    setShowModal(false);
    navigate('/record-upload');
  };

  return (
    <div className="h-full w-full flex flex-col items-center bg-[#F9FAFB] p-6 font-noto">
      
      <div className="w-full max-w-6xl flex-1 border-2 border-black rounded-[40px] p-10 mb-8 bg-white shadow-sm overflow-y-auto">
        <h3 className="text-gray-400 mb-6 text-sm font-medium">발음 및 강조 표시</h3>

        <div className="text-sm leading-12 text-gray-800 break-keep">
          {scriptData.map((item, index) => (
            <span key={index} className="relative"> 
              {item.highlight ? (
                <span className="bg-yellow-200 px-1 rounded-md decoration-orange-400 underline decoration-2 underline-offset-4">
                  {item.text}
                  
                  {item.pronunciation && (
                    <span className="text-orange-600 font-bold ml-1 text-sm">
                      [{item.pronunciation}]
                    </span>
                  )}
                </span>
              ) : (
                item.text
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="pb-4">
        <Button 
          text={
            <div className="leading-tight">
              <div className="text-[10px] font-normal opacity-80">DOCX (Highlighting)</div>
              <div className="text-lg font-bold">다운로드</div>
            </div>
          }
          className="px-16 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-md"
          onClick={() => setShowModal(true)}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setShowModal(false)} 
          />
          
          <div className="relative bg-white w-full max-w-sm rounded-[30px] border-2 border-black p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-5xl mb-4">📥</div>
            <h3 className="text-lg font-bold mb-2">다운로드 안내</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              발음 가이드가 포함된<br/>
              <span className="text-black font-bold">대본(.docx) 다운로드</span>를 시작합니다.
            </p>
            <button 
              onClick={handleConfirm} 
              className="w-full py-3 bg-black text-white rounded-xl font-bold active:scale-95 transition-all shadow-md hover:bg-gray-800"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}