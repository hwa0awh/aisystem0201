import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom'; // 1. Link 컴포넌트 임포트

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-xl font-black tracking-tighter bg-[#2D2D2D] text-white px-3 py-1 rounded-lg inline-block mb-6">
              SKOACH
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              AI 기술을 통해 당신의 발표를 완성합니다.<br />
              PPT 분석부터 발음 코칭까지,<br />
              무대 위의 자신감을 디자인하세요.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-sm mb-6 text-[#2D2D2D]">Product</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              {/* href="Main_Function" 대신 to="/main-function"으로 변경 */}
              <li><Link to="/main-function" className="hover:text-blue-600 transition-colors">주요 기능</Link></li>
              <li><Link to="/pricing-introduction" className="hover:text-blue-600 transition-colors">요금 안내</Link></li>
              <li><Link to="/update-news" className="hover:text-blue-600 transition-colors">업데이트 소식</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 text-[#2D2D2D]">Support</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/user-guide" className="hover:text-blue-600 transition-colors">사용 가이드</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">개인정보처리방침</Link></li>
            </ul>
          </div>

          {/* Newsletter/Social */}
          <div>
            <h4 className="font-bold text-sm mb-6 text-[#2D2D2D]">Connect</h4>
            <div className="flex gap-4 mb-6">
              <a href="mailto:hello@skoach.ai" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Mail size={18} />
              </a>
            </div>
            <p className="text-xs text-gray-400 font-mono tracking-wider">DongA University AI Department</p>
            <p className="text-xs text-gray-400 font-mono tracking-wider">ㅎㅎㅎㅎ Team</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-gray-400 text-xs">
            © 2026 SKOACH AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;