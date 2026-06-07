import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
// 💡 1. TanStack Query에 필요한 모듈들을 임포트합니다.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import './index.css'
import App from './App.tsx'

// 💡 2. 전역에서 데이터 캐싱을 관리할 QueryClient 인스턴스를 생성합니다.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // API 요청 실패 시 자동으로 3번씩 다시 재시도하는 기능을 끕니다.
      refetchOnWindowFocus: false, // 다른 인터넷 창을 보다가 우리 앱으로 돌아왔을 때 자동으로 재요청하는 기능을 끕니다.
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 💡 3. QueryClientProvider로 최상단을 감싸고 위에 만든 client를 주입합니다. */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)