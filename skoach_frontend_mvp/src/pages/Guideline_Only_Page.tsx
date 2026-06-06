import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GuidelineOnlyPage() {
  const navigate = useNavigate();
  const [guideline, setGuideline] = useState('');
  const [tone, setTone] = useState('formal');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 가이드라인 입력 여부 확인
    if (!guideline.trim()) {
      setShowModal(true);
      return;
    }
    
    // 유효성 검사 통과 시에만 이동
    console.log({ guideline, tone });
    navigate('/script-generate');
  };

  return (
    <div className="p h-screen bg-gray-50 flex flex-col items-center justify-start pt-24 p-6 overflow-hidden">
      
      <div className="max-w-4xl w-full max-h-[85vh] bg-white rounded-[40px] shadow-xl p-10 border border-gray-100 flex flex-col">
        
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-1">가이드라인 입력</h1>
          <p className="text-sm text-gray-500">핵심 내용만 적어주시면 대본을 구성해 드립니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 space-y-6">
          <div className="flex-1 flex flex-col min-h-0">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              발표 내용 및 가이드라인
            </label>
            <textarea
              value={guideline}
              onChange={(e) => setGuideline(e.target.value)}
              placeholder="ex) '친환경 에너지의 필요성'에 대해 5분 발표 대본 써줘"
              className="w-full flex-1 p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-black focus:bg-white outline-none transition-all resize-none text-base leading-relaxed"
            />
          </div>

          <div className="shrink-0 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                발표 톤 설정
              </label>
              <div className="flex gap-3">
                {['formal', 'friendly'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${
                      tone === t 
                      ? 'bg-black text-white shadow-md' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {t === 'formal' ? '격식' : '편안'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-black text-white rounded-[20px] font-black text-lg hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              대본 생성
            </button>
          </div>

          {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            
            <div className="relative bg-white w-full max-w-sm rounded-[35px] border-2 border-black p-10 shadow-2xl text-center">
              <div className="text-6xl mb-6">🤖</div>
              <h3 className="text-xl font-black mb-2 text-black">가이드라인을 입력해주세요</h3>
              <p className="text-gray-500 text-[12px] mb-8 leading-relaxed">
                가이드라인을 입력해야<br />발표 대본을 생성할 수 있습니다.
              </p>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95"
              >
                확인
              </button>
            </div>
          </div>
          )}
        </form>
      </div>
    </div>
  );
}