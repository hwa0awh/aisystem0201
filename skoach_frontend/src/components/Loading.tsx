import React from 'react';
import type { LoadingType, StepItem } from '../types/loading';

interface LoadingPageProps {
  type: LoadingType;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ type }) => {
  const getContent = () => {
    switch (type) {
      case 'SCRIPT_GENERATE':
        return {
          title: 'AI가 대본을 생성하고 있어요',
          description: '슬라이드 내용을 분석하고 슬라이드별 대본을 작성하는 중입니다.',
          note: '잠시만 기다려 주세요. 파일의 양에 따라 최대 4분까지 소요될 수 있습니다.',
        };
      case 'PRONUNCIATION_COACH':
        return {
          title: '발음 하이라이팅을 적용하고 있어요',
          description: '생성된 대본에서 정확한 발음 가이드를 분석 중입니다.',
          note: '잠시만 기다려 주세요. 파일 크기에 따라 최대 4분까지 소요될 수 있습니다.',
        };
      case 'PRONUNCIATION_EVAL':
        return {
          title: '녹음 파일을 분석하고 있어요',
          description: '사용자님의 음성을 분석하여 발음 피드백을 생성하는 중입니다.',
          note: '잠시만 기다려 주세요. 음성 파일 크기에 따라 최대 4분까지 소요될 수 있습니다.',
        };
    }
  };

  const getSteps = (): StepItem[] => {
    switch (type) {
      case 'SCRIPT_GENERATE':
        return [
          { label: '파일 수령', status: 'done' },
          { label: '텍스트 추출', status: 'done' },
          { label: '대본 작성 중', status: 'loading' },
          { label: '완료', status: 'todo' },
        ];
      case 'PRONUNCIATION_COACH':
        return [
          { label: '대본 로드', status: 'done' },
          { label: '텍스트 분석', status: 'done' },
          { label: '하이라이팅 중', status: 'loading' },
          { label: '완료', status: 'todo' },
        ];
      case 'PRONUNCIATION_EVAL':
        return [
          { label: '오디오 업로드', status: 'done' },
          { label: '음성 인식', status: 'done' },
          { label: '코칭 분석 중', status: 'loading' },
          { label: '완료', status: 'todo' },
        ];
    }
  };

  const content = getContent();
  const steps = getSteps();

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-305px)] bg-white text-center px-4 py-12 animate-in fade-in duration-300">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-8" />
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{content.title}</h1>
      <p className="text-gray-500 text-sm md:text-base">{content.description}</p>
      <p className="text-gray-400 text-sm mt-1 mb-16">{content.note}</p>

      <div className="flex items-center justify-center space-x-2 md:space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center min-w-17.5">
              {step.status === 'done' && (
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">✓</div>
              )}
              {step.status === 'loading' && (
                <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              )}
              {step.status === 'todo' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">{index + 1}</div>
              )}
              <span className={`text-xs mt-2 font-medium ${step.status === 'loading' ? 'text-black font-bold' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 md:w-16 h-0.5 -mt-5 ${steps[index + 1].status !== 'todo' ? 'bg-black' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};