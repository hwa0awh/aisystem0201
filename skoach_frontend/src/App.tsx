import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/Home_Page';
import Main_Function_Page from './pages/Footer_Product/Main_Function_Page';
import ScrollToTop from './components/ScrollToTop';
import Privacy_Page from './pages/Footer_Support/Privacy_Page';
import File_Upload_Page from './pages/File_Upload_Page';
import Script_Preview_Page from './pages/Script_Preview_Page';
import User_Guide_Page from './pages/Footer_Support/User_Guide_Page';
import Update_News_Page from './pages/Footer_Product/Update_News_Page';
import Script_Generate_Page from './pages/Script_Generate_Page'
import Service_Introduction_Page from './pages/Navbar/Service_Introduction_Page';
import Pricing_Introduction_Page from './pages/Navbar/Pricing_Introduction_Page';
import { SignUp_Page } from './pages/Navbar/SignUp_Page';
import { LogIn_Page } from './pages/Navbar/LogIn_Page';
import Pronunciation_Coach_Page from './pages/Pronunciation_Coach_Page';
import Pronunciation_Eval_Page from './pages/Pronunciation_Eval_Page';
import Pronunciation_Score_Page from './pages/Pronunciation_Score_Page';
import Guide_Only_Page from './pages/Guideline_Only_Page';
import Service_Selection_Page from './pages/Service_Selection_Page';
import Script_Method_Selection_Page from './pages/Script_Method_Selection_Page';
import Coaching_Setup_Page from './pages/Coaching_Setup_Page';
import Guideline_Script_Page from './pages/Guideline_Script_Page';
import Guideline_Coaching_Page from './pages/Guideline_Coaching_Page';
import MyPage from './pages/Navbar/MyPage';
import { Find_Password_Page } from './pages/Navbar/Find_password_page';

const App: React.FC = () => {
  return (
    // 💡 AuthProvider로 전체 시스템을 감싸주어야 Navbar와 각 페이지들이 로그인 상태를 실시간으로 공유함!
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Navbar />

        <main className="grow bg-[#F4F4F4]">
          <Routes>
            {/* 💡 Navbar 관련 페이지 (경로 앞에 /를 붙여서 일관성 유지) */}
            <Route path="/service-introduction" element={<Service_Introduction_Page />} />
            <Route path="/pricing-introduction" element={<Pricing_Introduction_Page />} />
            <Route path="/sign-up" element={<SignUp_Page />} />
            <Route path="/log-in" element={<LogIn_Page />} />
            <Route path="/my-page" element={<MyPage />} />
            <Route path="/find-password" element={<Find_Password_Page />} />

            {/* 메인 홈 및 서비스 플로우 페이지 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/service-select" element={<Service_Selection_Page />} />
            <Route path="/script-method-select" element={<Script_Method_Selection_Page />} />
            <Route path="/file-upload" element={<File_Upload_Page />} />
            <Route path="/guideline-only" element={<Guide_Only_Page />} />
            <Route path="/guideline-script" element={<Guideline_Script_Page />} />
            <Route path="/script-preview" element={<Script_Preview_Page />} />
            <Route path="/script-generate" element={<Script_Generate_Page />} />
            <Route path="/coaching-setup" element={<Coaching_Setup_Page />} />
            <Route path="/guideline-coach" element={<Guideline_Coaching_Page />} />
            <Route path="/pronunciation-coach" element={<Pronunciation_Coach_Page />} />
            <Route path="/pronunciation-evaluate" element={<Pronunciation_Eval_Page />} />
            <Route path="/pronunciation-score" element={<Pronunciation_Score_Page />} />
            
            {/* Footer 관련 페이지 */}
            <Route path="/main-function" element={<Main_Function_Page />} />
            <Route path="/update-news" element={<Update_News_Page />} />
            <Route path="/user-guide" element={<User_Guide_Page />} />
            <Route path="/privacy" element={<Privacy_Page />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;