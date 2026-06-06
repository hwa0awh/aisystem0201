import { useNavigate } from 'react-router-dom';

export default function Feedback_Presentation() {
  const navigate = useNavigate();

  // 샘플 데이터
  const feedbackData = {
    totalScore: 85,
    summary: "전체적으로 발음이 정확하고 전달력이 좋습니다. 다만, 특정 단어에서 연음 처리가 조금 불안정합니다.",
    strengths: ["일정한 말하기 속도", "명확한 문장 종결 어미"],
    weaknesses: [
      { word: "공권력", pronunciation: "공꿘녁", feedback: "비음화 현상을 주의하여 [녁]으로 발음해 보세요." },
      { word: "판례", pronunciation: "판녜", feedback: "유음화 예외 단어입니다. [녜]로 발음하는 연습이 필요합니다." }
    ]
  };

  return (
    <div className="h-full w-full flex flex-col items-center bg-[#F9FAFB] pt-24 p-6 font-noto overflow-y-auto">
      
      {/* 헤더 섹션: 점수 표시 */}
      <div className="w-full max-w-4xl bg-white rounded-[40px] border-2 border-black p-10 mb-8 shadow-sm flex flex-col items-center">
        <div className="text-sm font-bold text-gray-400 mb-2">AI 발음 피드백 점수</div>
        <div className="text-7xl font-black text-black mb-4">{feedbackData.totalScore}점</div>
        <p className="text-gray-600 text-center leading-relaxed max-w-lg">
          "{feedbackData.summary}"
        </p>
      </div>

      {/* 하단 컨트롤 섹션 */}
      <div className="flex gap-4 pb-10 w-full max-w-4xl">
        <button 
          onClick={() => navigate('/record-upload')}
          className="flex-1 py-4 bg-white text-black border-2 border-black rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
        >
          다시 녹음하기
        </button>

        <button 
          onClick={() => navigate('/')}
          className="flex-1 py-4 bg-black text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
        >
          홈으로 이동
        </button>
      </div>
    </div>
  );
}