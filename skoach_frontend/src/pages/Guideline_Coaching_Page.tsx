// pages/PronunciationCoachPage.tsx
import { useState } from 'react';
import { ArrowLeft, Download, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DownloadModal } from '../components/DownloadModal';

interface CoachingCard {
  id: number;
  type: '장단음' | '연음' | '표기불일치';
  original: string;
  pronunciation: string;
  rule: string;
  location: string;
}

const Guideline_Coaching_Page = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'view' | 'list'>('view'); // 기본값을 'view'(대본 뷰어)로 설정
  const [activeFilter, setActiveFilter] = useState<'전체' | '장단음' | '연음' | '표기불일치'>('전체');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const coachingCards: CoachingCard[] = [
    { id: 1, type: '장단음', original: '오늘', pronunciation: '오:늘', rule: '사전 발음 표기에 장모음(:) 표시 | 1번째 문장', location: '클릭 → 위치 이동' },
    { id: 2, type: '장단음', original: '인공지능', pronunciation: '인:공지능', rule: '인(人)의 장모음 표기 | 1번째 문장', location: '클릭 → 위치 이동' },
    { id: 3, type: '연음', original: '오늘은', pronunciation: '[오느른]', rule: '앞 음절 종성 ㄹ이 뒤 음절 초성으로 연결', location: '클릭 → 위치 이동' },
    { id: 4, type: '연음', original: '기업의', pronunciation: '[기어비]', rule: '앞 음절 종성 ㅂ이 뒤 음절 초성으로 연결', location: '클릭 → 위치 이동' },
    { id: 5, type: '표기불일치', original: '프레젠테이션', pronunciation: '[프레젠테이션]', rule: '규칙: 표기와 표준국어대사전 발음 표기 상이', location: '클릭 → 위치 이동' }
  ];

  const countType = (type: '장단음' | '연음' | '표기불일치') => 
    coachingCards.filter(card => card.type === type).length;

  const filteredCards = coachingCards.filter(card => {
    if (activeFilter === '전체') return true;
    return card.type === activeFilter;
  });

  const handleDownloadSubmit = (format: 'DOCX' | 'PDF') => {
    setIsDownloadModalOpen(false); // 모달 닫기
    alert(`하이라이팅이 포함된 대본 다운로드를 시작합니다. 형식: ${format}`);
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-50 text-gray-800 font-sans selection:bg-blue-100">
      
      {/* 메인 웅장한 가로폭 제한 컨테이너 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
        
        {/* 1. 상단 헤더 영역 */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-6 border-b border-gray-200 gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              발음 코칭
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">
              AI가 분석한 취약 발음과 표준 규칙을 와이드 모드로 집중 연습하세요.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-100 transition active:scale-95 bg-white text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> 대본으로
            </button>

            <button 
              onClick={() => navigate('/pronunciation-evaluate')} 
              type="button" 
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-100 transition active:scale-95 bg-white text-gray-800"
            >
              <Mic className="w-4 h-4 mr-2 text-blue-500" /> 발음 평가
            </button>

            <button 
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="flex items-center px-4 py-2.5 bg-gray-800 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-black transition active:scale-95 shadow-md"
            >
              <Download className="w-4 h-4 mr-1.5" /> 다운로드 (하이라이팅)
            </button>
          </div>
        </header>

        {/* 2. 본문 메인 섹션 */}
        <div className="space-y-6">
          
          {/* 하이라이트 범례 패널 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs text-xs font-bold flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="font-black text-gray-900 text-sm sm:border-r sm:pr-4 border-gray-200">하이라이트 범례</span>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#FCE7F3] text-[#DB2777] px-2 py-0.5 rounded font-black">분홍</span>
              <span className="text-gray-500 font-semibold">장단음 (사전 장모음 표시 단어)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#E0F2FE] text-[#0284C7] px-2 py-0.5 rounded font-black">하늘</span>
              <span className="text-gray-500 font-semibold">연음 (앞 음절 종성→뒤 음절 초성)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded font-black">노랑</span>
              <span className="text-gray-500 font-semibold">표기-발음 불일치 (표준국어대사전 기준)</span>
            </div>
            <span className="text-[11px] text-gray-400 ml-auto font-medium">* 겹치면 높은 우선순위 색 표시 (분홍 &gt; 하늘 &gt; 노랑)</span>
          </div>

          {/* 메뉴 탭 바 */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('view')}
              className={`px-6 py-3 font-black text-sm border-b-2 transition-all ${
                activeTab === 'view' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              대본 뷰어
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 font-black text-sm border-b-2 transition-all ${
                activeTab === 'list' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              단어 목록
            </button>
          </div>

          {/* 탭 분기 처리 구역 */}
          {activeTab === 'view' ? (
            /* 대본 뷰어 레이아웃 마크업 */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="w-full bg-white border border-gray-200 rounded-4xl p-8 sm:p-10 shadow-xs">
                <div className="text-xs font-bold text-gray-300 mb-6 uppercase tracking-widest">전체 하이라이트 적용 대본</div>
                
                <div className="text-base sm:text-lg font-bold text-gray-800 leading-[2.8] tracking-wide break-keep px-2">
                  <span>오늘은 </span>
                  <span className="bg-[#FCE7F3] text-[#DB2777] border-b-2 border-[#DB2777] px-1.5 py-0.5 mx-0.5 rounded-lg cursor-pointer transition-colors hover:bg-[#FBCFE8]">오늘</span>
                  <span className="bg-[#E0F2FE] text-[#0284C7] border-b-2 border-[#0284C7] px-1.5 py-0.5 mx-0.5 rounded-lg cursor-pointer transition-colors hover:bg-[#BAE6FD]">은</span>
                  <span className="bg-[#FCE7F3] text-[#DB2777] border-b-2 border-[#DB2777] px-1.5 py-0.5 mx-0.5 rounded-lg cursor-pointer transition-colors hover:bg-[#FBCFE8]">인공지능</span>
                  <span>(AI) 기반의 </span>
                  <span className="bg-[#FEF3C7] text-[#D97706] border-b-2 border-[#D97706] px-1.5 py-0.5 mx-0.5 rounded-lg cursor-pointer transition-colors hover:bg-[#FDE68A]">프레젠테이션</span>
                  <span> 자동화에 대해 발표하겠습니다. </span>
                  <span className="bg-[#E0F2FE] text-[#0284C7] border-b-2 border-[#0284C7] px-1.5 py-0.5 mx-0.5 rounded-lg cursor-pointer transition-colors hover:bg-[#BAE6FD]">기업의</span>
                  <span> </span>
                  <span className="bg-[#FEF3C7] text-[#D97706] border-b-2 border-[#D97706] px-1.5 py-0.5 mx-0.5 rounded-lg cursor-pointer transition-colors hover:bg-[#FDE68A]">효율</span>
                  <span>을 높이기 위한 </span>
                  <span className="bg-[#FCE7F3] text-[#DB2777] border-b-2 border-[#DB2777] px-1.5 py-0.5 mx-0.5 rounded-lg cursor-pointer transition-colors hover:bg-[#FBCFE8]">알고리즘</span>
                  <span>을 소개합니다.</span>
                </div>
              </div>
              <div className="text-xs font-bold text-gray-400 pl-2 tracking-wide">
                💡 단어 클릭 → 발음 규칙 툴팁 표시 | [단어 목록] 탭에서 필터별 전체 목록 확인 가능
              </div>
            </div>
          ) : (
            /* 단어 목록 탭 UI */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setActiveFilter('전체')} className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${activeFilter === '전체' ? 'bg-black text-white border-black shadow-xs' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>전체</button>
                <button type="button" onClick={() => setActiveFilter('장단음')} className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${activeFilter === '장단음' ? 'bg-[#FCE7F3] text-[#DB2777] border-[#FBCFE8] shadow-xs' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>장단음 ({countType('장단음')})</button>
                <button type="button" onClick={() => setActiveFilter('연음')} className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${activeFilter === '연음' ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD] shadow-xs' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>연음 ({countType('연음')})</button>
                <button type="button" onClick={() => setActiveFilter('표기불일치')} className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${activeFilter === '표기불일치' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] shadow-xs' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>표기불일치 ({countType('표기불일치')})</button>
              </div>

              <div className="space-y-3">
                {filteredCards.map((card) => (
                  <div key={card.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md flex items-center justify-between group cursor-pointer transition-all duration-200">
                    <div className="flex items-center gap-5">
                      <span className={`w-20 py-2 rounded-xl text-center text-xs font-black shrink-0 ${card.type === '장단음' ? 'bg-[#FCE7F3] text-[#DB2777]' : card.type === '연음' ? 'bg-[#E0F2FE] text-[#0284C7]' : 'bg-[#FEF3C7] text-[#D97706]'}`}>{card.type}</span>
                      <div>
                        <div className="text-base font-black text-gray-900 flex items-center gap-2">
                          <span>{card.original}</span>
                          <span className="text-gray-300 font-normal">→</span>
                          <span className={`font-black ${card.type === '장단음' ? 'text-[#DB2777]' : card.type === '연음' ? 'text-[#0284C7]' : 'text-[#D97706]'}`}>{card.pronunciation}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 mt-1">{card.rule}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-gray-400 group-hover:text-black transition-colors shrink-0">{card.location} →</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DownloadModal
        isOpen={isDownloadModalOpen}
        type="PRONUNCIATION_COACH"
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownloadSubmit}
      />
    </div>
  );
};

export default Guideline_Coaching_Page;