import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Mic, 
  Download, 
  Edit2, 
  RefreshCw 
} from 'lucide-react';
import EditModal from '../components/EditModal';
import RefreshModal from '../components/RefreshModal';
import { LoadingPage } from '../components/Loading';
import { DownloadModal } from '../components/DownloadModal';

// 스크립트 데이터의 타입 정의
interface ScriptData {
  content: string;
  time: string;
  style: string;
}

const GenerateScriptPage = () => {
  const navigate = useNavigate();
  
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  
  // 로딩 상태 관리
  const [isCoachingLoading, setIsCoachingLoading] = useState(false);

  // 더미 데이터 상태 초기화
  const [scriptData, setScriptData] = useState<ScriptData>({
    content: `[1페이지]
안녕하세요 여러분, 오늘 이 자리에 선 이유는 바로 여러분의 발표 고민을 덜어드리기 위해섭니다. "발표가 두려운 당신의 코치"라고 들어보셨나요? 대본 생성부터 발표 코칭까지, 이 모든 걸 한 번에 해결할 수 있는 서비스를 소개해 드리겠습니다. 자, 그럼 이제 발표 주제나 PPT를 입력해 보세요. 저희 서비스가 그 고민의 해결사가 되어드릴 것입니다!

[2페이지]
오늘 발표의 주요 내용은 다음과 같습니다. 첫 번째로 '프로젝트 개요'를 설명드리고, 두 번째로는 '시스템 구조'에 대해 자세히 알아보겠습니다. 세 번째로는 '데이터 & AI 모델'을 소개하고, 네 번째로는 'MVP 설계'에 대해 이야기하겠습니다. 마지막으로 '사용자 테스트' 결과를 공유하고 '구현 계획'까지 다루도록 하겠습니다. 지금부터 하나씩 차근차근 설명드리겠습니다.

[3페이지]
먼저 '프로젝트 개요'에 대해 짚고 넘어가야겠죠. 혹시 발표가 두려워 밤잠 설치며 고민하셨던 경험 있으신가요? 많은 분들이 비슷한 고민을 안고 계십니다. 특히 대본 작성이 어렵거나 PPT 내용을 효과적으로 전달하는 방법에 대해 갈증을 느끼시는 경우가 많습니다. 이런 문제를 해결하기 위해 탄생한 것이 바로 SKOACH입니다. 다음 슬라이드에서 SKOACH의 핵심 기능을 더 구체적으로 살펴보겠습니다.

[4페이지]
여기, 바로 이 녀석이 우리의 주인공 SKOACH입니다. ㅎㅎㅎ 간단히 말해, SKOACH는 발표의 든든한 동반자 역할을 해주는 AI 기반 코칭 서비스입니다. 이제 본격적으로 SKOACH의 세부 기능들을 살펴보기 전에, 어떤 문제들이 있는지 짚어보는 시간을 갖겠습니다.

[5페이지]
오늘 발표의 첫 번째 챕터인 '프로젝트 개요' 부분에서는 SKOACH의 전반적인 개념을 이해하게 되셨습니다. 그렇다면 이제부터는 'SKOACH란!'이라는 주제로 조금 더 깊이 들어가 볼까요? 도대체 SKOACH가 어떤 방식으로 작동하는지, 그리고 어떤 혜택을 제공하는지에 대해 알아보겠습니다. 다음 슬라이드를 통해 SKOACH의 작동 원리를 시각적으로 보여드리겠습니다. 기대해도 좋습니다!

[6페이지]
그렇다면 SKOACH는 과연 어떤 구조를 가지고 있을까요? 저희 SKOACH의 시스템은 크게 Frontend, Backend, 그리고 AI & 외부 API 세 가지로 나뉩니다.
먼저 프론트엔드는 React 기반으로 구성되어 있으며, PPT나 PDF 파일을 쉽게 업로드할 수 있도록 설계되었습니다. 백엔드는 Flask 서버를 통해 안정적이고 신속하게 데이터를 처리하며, REST API를 사용해 클라이언트와 상호작용합니다. 또한, AI 부분은 CLOVA를 활용해 대본 생성 및 발음 단어 추출 작업을 수행하고, ETRI WiseASR을 통해 발음 평가를 진행합니다. 이 외에도 표준국어대사전과 Vision AI를 통해 다양한 데이터를 효율적으로 처리합니다.`,
    time: '5분',
    style: '격식체 (합니다)'
  });

  // 발음 코칭 이동 핸들러 (3초 가짜 로딩 포함)
  const handlePronunciationCoach = () => {
    setIsCoachingLoading(true);

    // 컴포넌트가 급작스럽게 언마운트될 때 발생할 수 있는 메모리 누수 방지 로직 필요 시 적용 가능
  };

  // 편집 모달 적용 완료 핸들러 (수정된 시간과 말투도 함께 저장 가능하도록 확장)
  const handleModalApply = (updatedData: Partial<ScriptData>) => {
    setScriptData((prev) => ({ ...prev, ...updatedData }));
    setIsModalOpen(false);
  };

  // AI 재생성 요청 핸들러
  const handleRefreshStart = (refreshData: { time: string; style: string; prompt: string }) => {
    console.log("AI 재생성 요청 파라미터:", refreshData);
    setIsRefreshModalOpen(false);
    alert(`시간: ${refreshData.time}\n말투: ${refreshData.style}\n요구사항: ${refreshData.prompt}\n\n위 조건으로 AI 대본 재생성을 시작합니다!`);
  };

  // 파일 다운로드 핸들러
  const handleDownloadSubmit = (format: 'DOCX' | 'PDF') => {
    setIsDownloadModalOpen(false);
    alert(`${format} 형식으로 대본 다운로드를 시작합니다.`);
  };

  // 로딩 상태 레이아웃 분리
  if (isCoachingLoading) {
    return <LoadingPage type="PRONUNCIATION_COACH" />;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] mt-20 bg-gray-50 text-gray-800 font-sans overflow-hidden">
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 액션 헤더 */}
        <header className="flex justify-end items-center p-6 bg-white border-b border-gray-100 shrink-0">
          <div className="flex gap-2">
            <button 
              onClick={handlePronunciationCoach} 
              type="button" 
              className="flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 mr-2 text-blue-800" /> 발음 코칭
            </button>
            <button 
              onClick={() => navigate('/pronunciation-evaluate')} 
              type="button" 
              className="flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
            >
              <Mic className="w-4 h-4 mr-2 text-blue-400" /> 발음 평가
            </button>
            <button 
              onClick={() => setIsDownloadModalOpen(true)} 
              type="button" 
              className="flex items-center px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" /> 다운로드
            </button>
          </div>
        </header>

        {/* 본문 대본 영역 */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs text-gray-400">대본 (AI 생성)</div>
              {/* 현재 대본 정보 가시성 확보 */}
              <div className="flex gap-2 text-xs font-medium text-gray-500">
                <span className="bg-gray-100 px-2 py-0.5 rounded">{scriptData.time}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">{scriptData.style}</span>
              </div>
            </div>
            
            <p className="text-base sm:text-lg text-gray-800 leading-relaxed mb-6 whitespace-pre-wrap select-text">
              {scriptData.content}
            </p>
            
            <div className="flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
              >
                <Edit2 className="w-4 h-4 mr-2 text-blue-400" /> 편집
              </button>
              <button 
                type="button" 
                onClick={() => setIsRefreshModalOpen(true)}
                className="flex items-center px-5 py-2.5 border border-blue-600 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> 부분 재생성 
                <span className="ml-1.5 text-xs bg-blue-50 px-1.5 py-0.5 rounded text-blue-600 font-semibold">유료</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* 모달 레이어 모음 */}
      <EditModal 
        isOpen={isModalOpen}
        initialContent={scriptData.content}
        initialTime={scriptData.time}
        initialStyle={scriptData.style}
        onClose={() => setIsModalOpen(false)}
        onApply={handleModalApply}
      />

      <RefreshModal 
        isOpen={isRefreshModalOpen}
        currentContent={scriptData.content}
        initialTime={scriptData.time}
        initialStyle={scriptData.style}
        onClose={() => setIsRefreshModalOpen(false)}
        onRefreshStart={handleRefreshStart}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        type="GENERAL_SCRIPT"
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownloadSubmit}
      />
    </div>
  );
};

export default GenerateScriptPage;