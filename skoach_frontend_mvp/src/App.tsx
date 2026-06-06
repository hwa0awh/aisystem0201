import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import MainPage from './pages/MainPage';
import PPT_Upload from './pages/PPT_Upload_Page';
import Script_Generate from './pages/Script_Generate_Page';
import Final_Script from './pages/Final_Script_Page';
import Download_Presentation from './pages/Download_Presentation_Page';
import Script_Upload from './pages/Script_Upload_Page';
import Highlight_Script from './pages/Highlight_Script_Page';
import Recording_Upload from './pages/Recording_Upload_Page';
import Feedback_Presentation from './pages/Feedback_Presentation_Page';
import Guideline_Only from './pages/Guideline_Only_Page';

function App() {
  return (
    <Router>
      <div className="h-screen w-full flex flex-col overflow-hidden bg-[#F9FAFB]">
        <Header /> 
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/ppt-upload" element={<PPT_Upload />} />
            <Route path="/script-generate" element={<Script_Generate/>} />
            <Route path="/final-script" element={<Final_Script/>} />
            <Route path="/download-presentation" element={<Download_Presentation />} />
            <Route path="/script-upload" element={<Script_Upload />} />
            <Route path="/highlight-script" element={<Highlight_Script />} />
            <Route path="/record-upload" element={<Recording_Upload />} />
            <Route path="/feedback-presentation" element={<Feedback_Presentation />} />
            <Route path="/guideline-only" element={<Guideline_Only />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;