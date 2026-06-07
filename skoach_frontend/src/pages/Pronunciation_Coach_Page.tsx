// pages/PronunciationCoachPage.tsx
import { useState } from 'react';
import { ArrowLeft, Download, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DownloadModal } from '../components/DownloadModal';

interface CoachingCard {
  id: number;
  type: 'long_short_vowel' | 'connected' | 'Notation_discrepancy';
  original: string;
  pronunciation: string;
  rule: string;
}

// 공통적으로 들어가는 기본 스타일 스타일 (중복 제거용)
const BASE_SPAN_STYLE = "border-b-2 px-1.5 py-0.5 mx-0.5 rounded cursor-pointer transition-colors";

// 각 타입별 스타일 정의
const HIGHLIGHT_STYLES = {
  long_short_vowel: `${BASE_SPAN_STYLE} bg-[#FCE7F3] text-[#DB2777] border-[#DB2777] hover:bg-[#FBCFE8]`,
  connected: `${BASE_SPAN_STYLE} bg-[#E0F2FE] text-[#0284C7] border-[#0284C7] hover:bg-[#BAE6FD]`,
  Notation_discrepancy: `${BASE_SPAN_STYLE} bg-[#FEF3C7] text-[#D97706] border-[#D97706] hover:bg-[#FDE68A]`,
};

const PronunciationCoachPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'view' | 'list'>('view'); // 기본값을 'view'(대본 뷰어)로 설정
  const [activeFilter, setActiveFilter] = useState<'전체' | 'long_short_vowel' | 'connected' | 'Notation_discrepancy'>('전체');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // 1~4페이지 대본 기준으로 압축된 코칭 카드 데이터 목록
  const coachingCards: CoachingCard[] = [
    // 1페이지
    { id: 1, type: 'long_short_vowel', original: '고민', pronunciation: '[고:민]', rule: '표준국어대사전에 장단음(:)으로 표기'},
    { id: 2, type: 'connected', original: '고민을', pronunciation: '[고미늘]', rule: '연음 현상' },
    { id: 3, type: 'connected', original: '덜어드리기', pronunciation: '[더러드리기]', rule: '연음 현상' },
    { id: 4, type: 'Notation_discrepancy', original: '위해섭니다', pronunciation: '[위해섬니다]', rule: '표기-발음 불일치' },
    { id: 5, type: 'connected', original: '당신의', pronunciation: '[당시네]', rule: '연음 현상' },
    { id: 6, type: 'long_short_vowel', original: '코치', pronunciation: '[코:치]', rule: '표준국어대사전에 장단음(:)으로 표기' },
    { id: 7, type: 'Notation_discrepancy', original: '들어보셨나요', pronunciation: '[드러보션나요]', rule: '표기-발음 불일치' },
    { id: 8, type: 'connected', original: '한 번에', pronunciation: '[한 버네]', rule: '연음 현상' },
    { id: 9, type: 'Notation_discrepancy', original: '해결할 수 있는', pronunciation: '[해결할 쑤 인는]', rule: '표기-발음 불일치' },
    { id: 10, type: 'Notation_discrepancy', original: '드리겠습니다', pronunciation: '[드리겓씀니다]', rule: '표기-발음 불일치' },
    { id: 11, type: 'Notation_discrepancy', original: '입력해 보세요', pronunciation: '[임녀캐 보세요]', rule: '표기-발음 불일치' },
    { id: 12, type: 'connected', original: '고민의', pronunciation: '[고미네]', rule: '연음 현상' },
    { id: 13, type: 'Notation_discrepancy', original: '것입니다', pronunciation: '[거심니다]', rule: '표기-발음 불일치' },

    // 2페이지
    { id: 14, type: 'Notation_discrepancy', original: '발표의', pronunciation: '[발표에]', rule: '표기-발음 불일치' },
    { id: 15, type: 'Notation_discrepancy', original: '같습니다.', pronunciation: '[갇씀니다]', rule: '표기-발음 불일치' },
    { id: 16, type: 'Notation_discrepancy', original: '알아보겠습니다', pronunciation: '[아라보겓씀니다]', rule: '표기-발음 불일치' },
    { id: 17, type: 'connected', original: "모델'을", pronunciation: "[모데를]", rule: '연음 현상' },
    { id: 18, type: 'Notation_discrepancy', original: '이야기하겠습니다', pronunciation: '[이야기하겓씀니다]', rule: '표기-발음 불일치' },
    { id: 19, type: 'long_short_vowel', original: '마지막', pronunciation: '[마:지막]', rule: '표준국어대사전에 장단음(:)으로 표기' },
    { id: 20, type: 'connected', original: '마지막으로', pronunciation: '[마지마그로]', rule: '연음 현상' },
    { id: 21, type: 'Notation_discrepancy', original: '하겠습니다', pronunciation: '[하겓씀니다]', rule: '표기-발음 불일치' },
    { id: 22, type: 'Notation_discrepancy', original: '설명드리겠습니다', pronunciation: '[설명드리겓씀니다]', rule: '표기-발음 불일치' },
    
    // 3페이지
    { id: 23, type: 'Notation_discrepancy', original: '짚고', pronunciation: '[집꼬]', rule: '표기-발음 불일치' },
    { id: 24, type: 'Notation_discrepancy', original: '넘어가야겠죠', pronunciation: '[너머가야겓쪼]', rule: '표기-발음 불일치' },
    { id: 25, type: 'Notation_discrepancy', original: '고민하셨던', pronunciation: '[고민하셔떤]', rule: '표기-발음 불일치' },
    { id: 26, type: 'connected', original: '있으신가요', pronunciation: '[이쓰신가요]', rule: '연음 현상' },
    { id: 27, type: 'connected', original: '많은', pronunciation: '[마는]', rule: '연음 현상' },
    { id: 28, type: 'long_short_vowel', original: '고민', pronunciation: '[고:민]', rule: '표준국어대사전에 장단음(:)으로 표기'},
    { id: 29, type: 'connected', original: '고민을', pronunciation: '[고미늘]', rule: '연음 현상' },
    { id: 30, type: 'Notation_discrepancy', original: '안고', pronunciation: '[안꼬]', rule: '표기-발음 불일치' },
    { id: 31, type: 'Notation_discrepancy', original: '계십니다', pronunciation: '[계심니다]', rule: '표기-발음 불일치' },
    { id: 32, type: 'Notation_discrepancy', original: '특히', pronunciation: '[트키]', rule: '표기-발음 불일치' },
    { id: 33, type: 'Notation_discrepancy', original: '작성', pronunciation: '[작썽]', rule: '표기-발음 불일치' },
    { id: 34, type: 'Notation_discrepancy', original: '어렵거나', pronunciation: '[어렵꺼나]', rule: '표기-발음 불일치' },
    { id: 35, type: 'Notation_discrepancy', original: '많으십니다', pronunciation: '[마느심니다]', rule: '표기-발음 불일치' },
    { id: 36, type: 'Notation_discrepancy', original: '핵심', pronunciation: '[핵씸]', rule: '표기-발음 불일치' },
    { id: 37, type: 'Notation_discrepancy', original: '살펴보겠습니다', pronunciation: '[살펴보겓씀니다]', rule: '표기-발음 불일치' },
    
    // 4페이지
    { id: 38, type: 'connected', original: '녀석이', pronunciation: '[녀서기]', rule: '연음 현상' },
    { id: 39, type: 'long_short_vowel', original: '우리', pronunciation: '우:리', rule: '표준국어대사전에 장단음(:)으로 표기' },
    { id: 40, type: 'Notation_discrepancy', original: '우리의', pronunciation: '[우리에]', rule: '표기-발음 불일치' },
    { id: 41, type: 'long_short_vowel', original: '말해', pronunciation: '말:해', rule: '표준국어대사전에 장단음(:)으로 표기' },
    { id: 42, type: 'Notation_discrepancy', original: '발표의', pronunciation: '[발표에]', rule: '표기-발음 불일치' },
    { id: 43, type: 'Notation_discrepancy', original: '역할을', pronunciation: '[여카를]', rule: '표기-발음 불일치' },
    { id: 44, type: 'long_short_vowel', original: '기반', pronunciation: '기:반', rule: '표준국어대사전에 장단음(:)으로 표기' },
    { id: 45, type: 'Notation_discrepancy', original: '서비스입니다', pronunciation: '[서비스임니다]', rule: '표기-발음 불일치' },
    { id: 46, type: 'Notation_discrepancy', original: '본격적으로', pronunciation: '[본껵쩌그로]', rule: '표기-발음 불일치' },
    { id: 47, type: 'connected', original: '전에', pronunciation: '[저네]', rule: '연음 현상' },
    { id: 48, type: 'connected', original: '문제들이', pronunciation: '[문제드리]', rule: '연음 현상' },
    { id: 49, type: 'connected', original: '짚어보는', pronunciation: '[지퍼보는]', rule: '연음 현상' },
    { id: 50, type: 'connected', original: '시간을', pronunciation: '[시가늘]', rule: '연음 현상' },
    { id: 51, type: 'Notation_discrepancy', original: '갖겠습니다', pronunciation: '[갇겓씀니다]', rule: '표기-발음 불일치' }
  ];

  // 영어 타입에 맞춰 개수를 세도록 카운트 함수 수정
  const countType = (type: 'long_short_vowel' | 'connected' | 'Notation_discrepancy') => 
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
    <div className="flex h-[calc(100vh-80px)] mt-20 bg-gray-50 text-gray-800 font-sans overflow-hidden select-none justify-center">
      
      {/* 메인 영역 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* 헤더 구역 */}
        <header className="flex justify-end items-center p-6 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
            >
              <ArrowLeft className="w-4.5 h-4.5 mr-2.5" /> 대본으로
            </button>

            <button 
              onClick={() => navigate('/pronunciation-evaluate')} 
              type="button" 
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
            >
              <Mic className="w-4.5 h-4.5 mr-2.5 text-blue-500" /> 발음 평가
            </button>

            <button 
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition cursor-pointer"
            >
              <Download className="w-4.5 h-4.5 mr-2.5" /> 다운로드 (하이라이팅)
            </button>
          </div>
        </header>

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* 하이라이트 범례 패널 */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-xs font-medium flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-bold text-gray-900">하이라이트 범례:</span>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#FCE7F3] text-[#DB2777] px-1.5 py-0.5 rounded font-bold">분홍</span>
              <span className="text-gray-500">장단음 (사전 장모음 표시 단어)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#E0F2FE] text-[#0284C7] px-1.5 py-0.5 rounded font-bold">하늘</span>
              <span className="text-gray-500">연음 (앞 음절 종성→뒤 음절 초성)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded font-bold">노랑</span>
              <span className="text-gray-500">표기-발음 불일치 (표준국어대사전 기준)</span>
            </div>
            <span className="text-[11px] text-gray-400 ml-auto">* 겹치면 높은 우선순위 색 표시 (분홍 &gt; 하늘 &gt; 노랑)</span>
          </div>

          {/* 메뉴 탭 바 */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('view')}
              className={`px-6 py-2.5 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'view' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              대본 뷰어
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-6 py-2.5 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'list' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              단어 목록
            </button>
          </div>

          {/* 탭 분기 처리 구역 */}
          {activeTab === 'view' ? (
            <div className="space-y-3">
              <div className="w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="text-xs font-bold text-gray-300 mb-4">전체 대본 — 하이라이트 적용</div>
                
                <div className="text-lg font-bold text-gray-800 leading-[2.6] tracking-wide break-keep">
                  <strong>[1페이지]</strong><br />
                  안녕하세요 여러분, 오늘 이 자리에 선 이유는 바로 여러분의 발표 <span className={HIGHLIGHT_STYLES.connected}><span className={HIGHLIGHT_STYLES.long_short_vowel}>고민</span>을</span> <span className={HIGHLIGHT_STYLES.connected}>덜어드리기</span> <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>위해섭니다.</span>
                  "발표가 두려운 <span className={HIGHLIGHT_STYLES.connected}>당신의</span> <span className={HIGHLIGHT_STYLES.long_short_vowel}>코치</span>라고 <span className={HIGHLIGHT_STYLES.connected}>들어보셨나요?</span> 
                  대본 생성부터 발표 코칭까지, 이 모든 걸 <span className={HIGHLIGHT_STYLES.connected}>한 번에</span> <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>해결할 수 있는</span> 서비스를 소개해 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>드리겠습니다.</span> 자, 그럼 이제 발표 주제나 PPT를 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>입력해 보세요.</span>  저희 서비스가 그 <span className={HIGHLIGHT_STYLES.connected}>고민의</span> 해결사가 되어드릴 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>것입니다!</span><br /><br />

                  <strong>[2페이지]</strong><br />
                  오늘 <span className={HIGHLIGHT_STYLES.connected}>발표의</span> 주요 내용은 다음과 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>같습니다.</span> 첫 번째로 '프로젝트 개요'를 설명드리고, 두 번째로는 '시스템 구조'에 대해 자세히 <span className={HIGHLIGHT_STYLES.connected}>알아보겠습니다.</span>
                  세 번째로는 '데이터 & AI <span className={HIGHLIGHT_STYLES.connected}>모델'을</span> 소개하고, 네 번째로는 'MVP 설계'에 대해 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>이야기하겠습니다.</span>
                  <span className={HIGHLIGHT_STYLES.connected}><span className={HIGHLIGHT_STYLES.long_short_vowel}>마지막</span>으로</span> '사용자 테스트' 결과를 공유하고 '구현 계획'까지 다루도록 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>하겠습니다.</span> 
                  지금부터 하나씩 차근차근 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>설명드리겠습니다.</span> <br /><br />

                  <strong>[3페이지]</strong><br />
                  먼저 '프로젝트 개요'에 대해 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>짚고</span> <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>넘어가야겠죠</span>. 
                  혹시 발표가 두려워 밤잠 설치며 <span className={HIGHLIGHT_STYLES.connected}>고민하셨던</span> 경험 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>있으신가요</span>? 
                  <span className={HIGHLIGHT_STYLES.connected}>많은</span> 분들이 비슷한 <span className={HIGHLIGHT_STYLES.connected}><span className={HIGHLIGHT_STYLES.long_short_vowel}>고민</span>을</span> <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>안고</span> <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>계십니다.</span>
                  <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>특히</span> 대본 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>작성</span>이 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>어렵거나</span> PPT 내용을 효과적으로 전달하는 방법에 대해 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>갈증</span>을 느끼시는 경우가 <span className={HIGHLIGHT_STYLES.connected}>많으십니다</span>. 
                  이런 문제를 해결하기 위해 탄생한 것이 바로 SKOACH입니다. 다음 슬라이드에서 SKOACH의 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>핵심</span> 기능을 더 구체적으로 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>살펴보겠습니다.</span><br /><br />

                  <strong>[4페이지]</strong><br />
                  여기, 바로 이 <span className={HIGHLIGHT_STYLES.connected}>녀석이</span> <span className={HIGHLIGHT_STYLES.Notation_discrepancy}><span className={HIGHLIGHT_STYLES.long_short_vowel}>우리</span>의</span> 주인공 SKOACH입니다. 
                  ㅎㅎㅎ 간단히 <span className={HIGHLIGHT_STYLES.long_short_vowel}>말해,</span> SKOACH는 <span className={HIGHLIGHT_STYLES.connected}>발표의</span> 든든한 동반자 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>역할을</span> 해주는 AI <span className={HIGHLIGHT_STYLES.long_short_vowel}>기반</span> 코칭 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>서비스입니다.</span>
                  이제 <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>본격적으로</span> SKOACH의 세부 기능들을 살펴보기 <span className={HIGHLIGHT_STYLES.connected}>전에,</span> 어떤 <span className={HIGHLIGHT_STYLES.connected}>문제들이</span> 있는지 <span className={HIGHLIGHT_STYLES.connected}>짚어보는</span> <span className={HIGHLIGHT_STYLES.connected}>시간을</span> <span className={HIGHLIGHT_STYLES.Notation_discrepancy}>갖겠습니다.</span>
                </div>
              </div>
              <div className="text-xs font-medium text-gray-400 pl-1">
                | 단어 클릭 → 발음 규칙 툴팁 표시 | [단어 목록] 탭에서 전체 목록 확인 가능
              </div>
            </div>
          ) : (
            /* 단어 목록 탭 UI */
            <div className="space-y-4">
              <div className="flex gap-2">
                <button type="button" onClick={() => setActiveFilter('전체')} className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${activeFilter === '전체' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}>전체</button>
                <button type="button" onClick={() => setActiveFilter('long_short_vowel')} className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${activeFilter === 'long_short_vowel' ? 'bg-[#FCE7F3] text-[#DB2777] border-[#FBCFE8]' : 'bg-white text-gray-500 border-gray-200'}`}>장단음 ({countType('long_short_vowel')})</button>
                <button type="button" onClick={() => setActiveFilter('connected')} className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${activeFilter === 'connected' ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]' : 'bg-white text-gray-500 border-gray-200'}`}>연음 ({countType('connected')})</button>
                <button type="button" onClick={() => setActiveFilter('Notation_discrepancy')} className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${activeFilter === 'Notation_discrepancy' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' : 'bg-white text-gray-500 border-gray-200'}`}>표기불일치 ({countType('Notation_discrepancy')})</button>
              </div>

              <div className="space-y-3">
                {filteredCards.map((card) => (
                  <div key={card.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <span className={`w-16 py-1.5 rounded-xl text-center text-xs font-bold shrink-0 ${card.type === 'long_short_vowel' ? 'bg-[#FCE7F3] text-[#DB2777]' : card.type === 'connected' ? 'bg-[#E0F2FE] text-[#0284C7]' : 'bg-[#FEF3C7] text-[#D97706]'}`}>{card.type === 'long_short_vowel' ? '장단음' : card.type === 'connected' ? '연음' : '표기불일치'}</span>
                      <div>
                        <div className="text-base font-black text-gray-900 flex items-center gap-2">
                          <span>{card.original}</span>
                          <span className="text-gray-300 font-normal">→</span>
                          <span className={`font-black ${card.type === 'long_short_vowel' ? 'text-[#DB2777]' : card.type === 'connected' ? 'text-[#0284C7]' : 'text-[#D97706]'}`}>{card.pronunciation}</span>
                        </div>
                        <p className="text-xs font-medium text-gray-400 mt-1">{card.rule}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DownloadModal
          isOpen={isDownloadModalOpen}
          type="PRONUNCIATION_COACH"
          onClose={() => setIsDownloadModalOpen(false)}
          onDownload={handleDownloadSubmit}
        />
      </main>
    </div>
  );
};

export default PronunciationCoachPage;