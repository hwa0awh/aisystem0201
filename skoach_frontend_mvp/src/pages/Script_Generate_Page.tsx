import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export default function Script_Generate() {
  const navigate = useNavigate();
  // 사용자가 입력창에 타이핑하는 텍스트
  const [userInput, setUserInput] = useState('');
  // AI와 대화한 메세지 목록 (초기값으로 AI의 첫 대본 포함)
  const [messages, setMessages] = useState([
    { role: 'ai', content: '[여기에 AI가 만든 대본이 출력됨...]' }
  ]);

  // 메시지 전송 함수
  const handleSendMessage = () => {
    // 입력값이 비어있으면 실행 X
    if (!userInput.trim()) return;
    // 1. 사용자가 입력한 메시지를 대화 창에 추가
    setMessages([...messages, { role: 'user', content: userInput }]);
    // 2. 입력창 비우기
    setUserInput('');
    // 3. AI의 응답 시뮬레이션 (0.8초 후 응답 메시지 추가)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: '요청하신 내용을 반영하여 수정 중입니다...' }]);
    }, 800);
  };

  return (
    // 전체 컨테이너 디자인: 화면 꽉 차게, 연한 회색 바탕, 중앙 정렬
    <div className="h-full w-full flex flex-col items-center bg-white p-6 overflow-hidden">
      {/* 채팅창 영역: 대화 내용이 많아지면 스크롤 생성*/}
      <div className="w-full max-w-6xl grow max-h-[60vh] border-2 border-black rounded-[40px] p-8 mb-4 overflow-y-auto bg-white shadow-sm flex flex-col gap-6">
        {messages.map((msg, idx) => (
          // 왼쪽: AI, 오른쪽: User
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 입력창 영역*/}
      <div className="w-full max-w-6xl relative mb-6">
        <input 
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          //  enter 키를 눌렀을 때도 전송 함수 실행
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="수정하고 싶은 부분을 입력하세요..."
          className="w-full h-14 pl-8 pr-20 border-2 border-black rounded-full text-lg focus:outline-none shadow-sm"
        />
        {/* 전송 버튼*/}
        <button onClick={handleSendMessage} className="absolute right-6 top-1/2 -translate-y-1/2 text-3xl text-black cursor-pointer">
          ➤
        </button>
      </div>
      
      {/* 최종 완료 버튼 */}
      <div className="mb-2">
        <Button 
          text="완료" 
          className="px-16 py-3 text-lg rounded-xl shadow-md active:scale-95 transition-all"
          onClick={() => navigate('/final-script')} 
        />
      </div>
    </div>
  );
}