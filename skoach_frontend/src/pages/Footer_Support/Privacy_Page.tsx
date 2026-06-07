import React from 'react';
import { ShieldCheck, Mail, Lock, FileText, UserCheck } from 'lucide-react';

const Privacy_Page: React.FC = () => {
  const effectiveDate = "2026년 05월 17일";

  return (
    <div className="bg-[#FBFBFB] min-h-screen font-sans">
      {/* 1. 상단 헤더 영역 */}
      <section className="pt-32 pb-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <ShieldCheck size={20} />
            <span className="text-sm font-black tracking-widest uppercase">Privacy Policy</span>
          </div>
          <h1 className="text-4xl font-black text-[#2D2D2D] mb-6">개인정보처리방침</h1>
          <p className="text-gray-500 font-medium">
            SKOACH는 사용자의 개인정보를 소중하게 생각하며, 관련 법령을 준수하여 안전하게 관리하고 있습니다.
            본 방침은 SKOACH 서비스 이용 시 수집되는 정보와 그 활용 방식에 대해 설명합니다.
          </p>
          <div className="mt-8 p-4 bg-gray-50 rounded-xl inline-flex items-center gap-4 text-sm text-gray-500 border border-gray-100">
            <span className="font-bold text-[#2D2D2D]">시행 일자</span>
            <span className="w-px h-4 bg-gray-200"></span>
            <span>{effectiveDate}</span>
          </div>
        </div>
      </section>

      {/* 2. 본문 내용 영역 */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          {/* 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: <Lock size={20} />, title: "철저한 보안", desc: "모든 데이터는 암호화되어 안전하게 전송 및 저장됩니다." },
              { icon: <FileText size={20} />, title: "목적외 사용 금지", desc: "수집된 정보는 서비스 제공 및 고도화 목적으로만 사용됩니다." },
              { icon: <UserCheck size={20} />, title: "사용자 권리 존중", desc: "언제든 본인의 정보를 열람, 수정, 삭제 요청할 수 있습니다." }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-blue-600 mb-4">{item.icon}</div>
                <h4 className="font-bold text-[#2D2D2D] mb-2">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* 상세 조항들 */}
          <div className="space-y-16 text-[#2D2D2D]">
            
            {/* 제1조 */}
            <article>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <span className="text-blue-600">01.</span> 개인정보의 처리 목적
              </h3>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
                <p>회사는 다음의 목적을 위하여 최소한의 개인정보를 처리합니다.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>서비스 제공:</strong> AI 대본 생성, 발표 슬라이드 분석, 음성 발음 코칭 및 평가 결과 리포트 제공</li>
                  <li><strong>회원 관리:</strong> 회원 가입 의사 확인, 본인 식별 및 인증, 회원자격 유지 및 관리, 서비스 부정이용 방지</li>
                  <li><strong>AI 모델 고도화:</strong> 사용자의 피드백 및 발화 데이터를 통한 음성 인식 및 분석 알고리즘 학습(동의 시에 한함)</li>
                </ul>
              </div>
            </article>

            {/* 제2조 */}
            <article>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <span className="text-blue-600">02.</span> 수집하는 개인정보 항목
              </h3>
              <div className="overflow-hidden border border-gray-100 rounded-2xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-bold">구분</th>
                      <th className="px-6 py-4 font-bold">항목</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    <tr>
                      <td className="px-6 py-4 font-medium">필수 수집</td>
                      <td className="px-6 py-4 text-gray-500 italic">이메일, 비밀번호, 이름, 서비스 이용 기록</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">서비스 이용</td>
                      <td className="px-6 py-4 text-gray-500 italic">업로드된 슬라이드(PPT/PDF) 내용, 입력 텍스트, 음성 녹음 데이터</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* 제3조 */}
            <article>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <span className="text-blue-600">03.</span> 개인정보의 보유 및 이용기간
              </h3>
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm leading-relaxed text-gray-700">
                <p className="mb-2">사용자의 개인정보는 <strong>회원 탈퇴 시 즉시 파기</strong>하는 것을 원칙으로 합니다.</p>
                <p>단, 관계 법령에 의해 보존할 필요가 있는 경우(예: 전자상거래법에 따른 결제 기록) 해당 기간까지 안전하게 보관합니다.</p>
              </div>
            </article>

            {/* 제4조 */}
            <article>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <span className="text-blue-600">04.</span> 개인정보 보호책임자
              </h3>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">문의 및 상담</p>
                    <p className="font-bold text-sm">DongA University AI Department</p>
                    <p className="font-bold text-sm">ㅎㅎㅎㅎ Team</p>
                  </div>
                </div>
                <div className="flex-1 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">보호 책임자</p>
                    <p className="font-bold text-sm">동아대학교 AI학과 ㅎㅎㅎㅎ팀</p>
                  </div>
                </div>
              </div>
            </article>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy_Page;