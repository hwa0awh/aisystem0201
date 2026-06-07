import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { ChevronLeft, Mail, Lock, Key, AlertCircle, Sparkles, Eye, EyeOff } from "lucide-react"; 

// 💡 회원가입 스펙과 동일하게 비밀번호 + 비밀번호 확인 일치 검증(refine) 탑재
const schema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식이 아닙니다." }),
  code: z.string().trim(),
  newPassword: z.string().trim().min(8, { message: "비밀번호는 8자 이상이어야 합니다." }).max(20),
  newPasswordCheck: z.string().trim(),
}).refine((data) => data.newPassword === data.newPasswordCheck, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ['newPasswordCheck'],
});

type FormFields = z.infer<typeof schema>;

export const Find_Password_Page = () => {
  const navigate = useNavigate();
  
  // 💡 SignUp_Page와 동일하게 완벽한 3단계 상태 관리
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);

  // 🎉 모달 2종 세트 상태 싱크
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { register, handleSubmit, trigger, watch, formState: { errors, isSubmitting } } = useForm<FormFields>({
    defaultValues: { email: "", code: "", newPassword: "", newPasswordCheck: "" },
    resolver: zodResolver(schema),
    mode: "onChange" 
  });

  // SignUp_Page 방식의 배열 구조 왓칭 싱크
  const [emailValue, codeValue, newPasswordValue, newPasswordCheckValue] = watch([
    "email", "code", "newPassword", "newPasswordCheck"
  ]);

  // 각 단계별 버튼 실시간 활성화 조건 싱크
  const isStep1Valid = emailValue && !errors.email;
  const isStep2Valid = codeValue && !errors.code;
  const isStep3Valid = newPasswordValue && newPasswordCheckValue && !errors.newPassword && !errors.newPasswordCheck;

  // 1단계 -> 2단계 이동 핸들러
  const handleNextStep = async () => {
    const isEmailValid = await trigger("email"); 
    if (isEmailValid) {
      try {
        // 💡 백엔드 연동: await axios.post("/api/auth/password-reset/request", { email: emailValue });
        setStep(2);
      } catch (error: any) {
        const backendMessage = error?.response?.data?.message || "";
        setErrorMessage(backendMessage || "SKOACH에 가입되지 않은 이메일입니다.\n이메일 주소를 다시 확인해주세요.");
        setIsErrorModalOpen(true);
      }
    }
  };

  // 2단계 -> 3단계 이동 핸들러 (인증번호 검증 전용)
  const handleNextToStep3 = async () => {
    const isCodeValid = await trigger("code");
    if (isCodeValid) {
      // 💡 만약 백엔드에 인증번호만 따로 먼저 확인하는 API가 없다면 바로 setStep(3) 처리하고,
      // 만약 인증번호 검증 API가 따로 있다면 여기서 try-catch 찔러서 확인하면 베스트입니다.
      setStep(3);
    }
  };

  // 3단계 최종 완료 핸들러
  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      console.log("🔥 최종 재설정 데이터 전송:", data);
      // 💡 백엔드 최종 연동: await axios.post("/api/auth/password-reset/confirm", { email: data.email, code: data.code, newPassword: data.newPassword });
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "비밀번호 변경에 실패했습니다.");
      setIsErrorModalOpen(true);
    }
  };

  const handleSuccessConfirm = () => {
    setIsSuccessModalOpen(false);
    navigate('/log-in', { replace: true });
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[#F4F4F4] text-[#2D2D2D] px-4 font-sans selection:bg-blue-100 relative'>
      
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[40px] shadow-xl shadow-black/5 border border-gray-100 transition-all duration-500">
        
        {/* 상단 헤더 영역 타입 에러 완벽 방어 버전 */}
        <div className="flex items-center mb-8 relative">
          <button 
            type="button" 
            onClick={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
              else navigate(-1);
            }} 
            className="absolute left-0 p-2 text-gray-400 hover:text-[#2D2D2D] hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="w-full text-center">
            <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase border border-blue-100">
              Step {step} of 3
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-3 text-[#2D2D2D]">비밀번호 재설정</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='w-full flex flex-col gap-5'>
          
          {/* --- STEP 1: 이메일 입력 단계 --- */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-gray-300" size={18} />
                  <input 
                    {...register("email")}
                    className={`w-full p-4 pl-12 bg-gray-50/50 border rounded-2xl text-sm focus:outline-none focus:bg-white transition-all ${
                      errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                    type='email' placeholder='가입한 이메일 주소를 입력하세요' 
                  />
                </div>
                {errors.email && <div className='text-red-500 text-xs font-semibold px-1 mt-1'>{errors.email.message}</div>}
              </div>
              
              <button 
                type="button" 
                onClick={handleNextStep} 
                disabled={!isStep1Valid}
                className={`w-full py-4 rounded-2xl text-base font-bold transition-all shadow-lg active:scale-98 ${
                  isStep1Valid 
                    ? "bg-[#2D2D2D] text-white hover:bg-black shadow-black/10 cursor-pointer" 
                    : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                }`}
              >
                인증번호 받기
              </button>
            </div>
          )}

          {/* --- STEP 2: 인증코드 단독 입력 단계 --- */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100/70 p-3 rounded-2xl mb-2">
                <Mail className="text-blue-500" size={16} />
                <span className="text-sm font-bold text-blue-600 truncate">{emailValue}</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">Verification Code</label>
                <div className="relative flex items-center">
                  <Key className="absolute left-4 text-gray-300" size={18} />
                  <input 
                    {...register("code")}
                    className={`w-full p-4 pl-12 bg-gray-50/50 border rounded-2xl text-sm focus:outline-none focus:bg-white transition-all ${
                      errors.code ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                    type='text' placeholder='인증번호를 입력하세요' 
                  />
                </div>
                {errors.code && <div className='text-red-500 text-xs font-semibold px-1 mt-1'>{errors.code.message}</div>}
              </div>

              <button 
                type='button' 
                onClick={handleNextToStep3}
                disabled={!isStep2Valid}
                className={`w-full py-4 rounded-2xl text-base font-bold mt-3 transition-all shadow-lg active:scale-98 ${
                  isStep2Valid 
                    ? "bg-[#2D2D2D] text-white hover:bg-black shadow-black/10 cursor-pointer" 
                    : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                }`}
              >
                인증번호 확인
              </button>
            </div>
          )}

          {/* --- STEP 3: 새로운 비밀번호 생성 및 최종 일치 확인 단계 --- */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              {/* 상단 상징 배지 바 탑재 */}
              <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100/70 p-3 rounded-2xl mb-2">
                <Mail className="text-blue-500" size={16} />
                <span className="text-sm font-bold text-blue-600 truncate">{emailValue}</span>
              </div>

              {/* 비밀번호 입력 필드 */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-gray-300" size={18} />
                  <input 
                    {...register("newPassword")} 
                    type={showPassword ? "text" : "password"}
                    className={`w-full p-4 pl-12 bg-gray-50/50 border rounded-2xl text-sm focus:outline-none focus:bg-white transition-all ${
                      errors.newPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                    placeholder='새로운 비밀번호를 생성하세요 (8자 이상)' 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-[#2D2D2D] transition-colors cursor-pointer">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword && <div className='text-red-500 text-xs font-semibold px-1 mt-1'>{errors.newPassword.message}</div>}
              </div>

              {/* 비밀번호 확인 필드 (SignUp_Page 미러링) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">Confirm New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-gray-300" size={18} />
                  <input 
                    {...register("newPasswordCheck")} 
                    type={showPassword ? "text" : "password"}
                    className={`w-full p-4 pl-12 bg-gray-50/50 border rounded-2xl text-sm focus:outline-none focus:bg-white transition-all ${
                      errors.newPasswordCheck ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                    placeholder='비밀번호를 한번 더 입력하세요' 
                  />
                </div>
                {errors.newPasswordCheck && <div className='text-red-500 text-xs font-semibold px-1 mt-1'>{errors.newPasswordCheck.message}</div>}
              </div>

              <button 
                disabled={!isStep3Valid || isSubmitting}
                type='submit' 
                className={`w-full py-4 rounded-2xl text-base font-bold mt-3 transition-all shadow-xl active:scale-98 ${
                  isStep3Valid && !isSubmitting 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 cursor-pointer" 
                    : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "변경 처리 중..." : "비밀번호 재설정 "}
              </button>
            </div>
          )}
        </form>

        {/* 하단 로그인 가이드 링크 */}
        {step === 1 && (
          <div className="mt-8 flex flex-col items-center gap-3 text-sm font-medium text-gray-400">
            <div>
              비밀번호가 생각나셨나요?{" "}
              <Link to="/log-in" className="text-blue-600 font-bold hover:underline ml-1">
                로그인하기
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 🎉 성공 모달 */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
          <div className="relative bg-white rounded-4xl max-w-sm w-full p-8 text-center shadow-2xl border border-gray-100 transform transition-all animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 mb-5 text-blue-600 animate-bounce">
              <Sparkles size={26} />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">변경이 완료되었습니다!</h2>
            <p className="text-sm font-bold text-blue-600 mb-3">비밀번호 재설정 완료</p>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              새로운 비밀번호가 안전하게 업데이트되었습니다.<br />
              이제 새 비밀번호로 SKOACH에 로그인해 보세요.
            </p>
            <button
              type="button"
              onClick={handleSuccessConfirm}
              className="w-full py-3.5 bg-[#2D2D2D] hover:bg-black text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-black/10 active:scale-95 cursor-pointer"
            >
              로그인하러 가기
            </button>
          </div>
        </div>
      )}

      {/* 🔴 에러 모달 */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
          <div className="relative bg-white rounded-4xl max-w-sm w-full p-8 text-center shadow-2xl border border-gray-100 transform transition-all animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-red-50 border border-red-100 mb-5 text-red-500">
              <AlertCircle size={26} />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">요청 실패</h2>
            <p className="text-xs font-medium text-gray-500 leading-relaxed mb-6 whitespace-pre-line">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setIsErrorModalOpen(false)}
              className="w-full py-3.5 bg-[#2D2D2D] hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-black/10 active:scale-95 cursor-pointer"
            >
              다시 시도하기
            </button>
          </div>
        </div>
      )}

    </div>
  );
};