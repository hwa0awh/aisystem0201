import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { postSignup } from "../../apis/auth";
import { ChevronLeft, Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react"; 

const schema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식이 아닙니다." }),
  password: z.string().trim().min(8, { message: "비밀번호는 8자 이상이어야 합니다." }).max(20),
  passwordCheck: z.string().trim(),
  name: z.string().min(1, { message: "이름을 입력해주세요." }),
}).refine((data) => data.password === data.passwordCheck, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ['passwordCheck'],
});

type FormFields = z.infer<typeof schema>;

export const SignUp_Page = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  // 🎉 가입 성공 환영 모달 상태 추가
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  const { register, handleSubmit, trigger, watch, formState: { errors, isSubmitting } } = useForm<FormFields>({
    defaultValues: { name: "", email: "", password: "", passwordCheck: "" },
    resolver: zodResolver(schema),
    mode: "onChange" 
  });

  const [emailValue, passwordValue, passwordCheckValue, nameValue] = watch(["email", "password", "passwordCheck", "name"]);

  const isStep1Valid = emailValue && !errors.email;
  const isStep2Valid = passwordValue && passwordCheckValue && !errors.password && !errors.passwordCheck;
  const isStep3Valid = nameValue && !errors.name;

  const handleNextStep = async () => {
    const isEmailValid = await trigger("email"); 
    if (isEmailValid) setStep(2);
  };

  const handleNextToStep3 = async () => {
    const isPasswordValid = await trigger(["password", "passwordCheck"]);
    if (isPasswordValid) setStep(3);
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const { passwordCheck, ...rest } = data;
      await postSignup(rest);
      
      // 💡 가입 성공 시 기본 alert 창 대신 커스텀 모달 오픈
      setIsWelcomeModalOpen(true);
    } catch (error: any) {
      alert(error?.response?.data?.message || "회원가입에 실패했습니다.");
    }
  };

  // 환영 모달을 닫고 메인으로 이동하는 함수
  const handleWelcomeConfirm = () => {
    setIsWelcomeModalOpen(false);
    navigate('/log-in', { replace: true });
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[#F4F4F4] text-[#2D2D2D] px-4 font-sans selection:bg-blue-100 relative'>
      
      {/* 회원가입 카드 박스 */}
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[40px] shadow-xl shadow-black/5 border border-gray-100 transition-all duration-500">
        
        {/* 상단 헤더 영역 */}
        <div className="flex items-center mb-8 relative">
          <button 
            type="button" 
            onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))} 
            className="absolute left-0 p-2 text-gray-400 hover:text-[#2D2D2D] hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="w-full text-center">
            <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase border border-blue-100">
              Step {step} of 3
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-3 text-[#2D2D2D]">회원가입</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='w-full flex flex-col gap-5'>
          
          {/* --- STEP 1: 이메일 단계 --- */}
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
                    type='email' placeholder='이메일 주소를 입력하세요' 
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
                다음 단계로
              </button>
            </div>
          )}

          {/* --- STEP 2: 비밀번호 단계 --- */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100/70 p-3 rounded-2xl mb-2">
                <Mail className="text-blue-500" size={16} />
                <span className="text-sm font-bold text-blue-600 truncate">{emailValue}</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-gray-300" size={18} />
                  <input 
                    {...register("password")} 
                    type={showPassword ? "text" : "password"}
                    className={`w-full p-4 pl-12 bg-gray-50/50 border rounded-2xl text-sm focus:outline-none focus:bg-white transition-all ${
                      errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                    placeholder='비밀번호를 생성하세요 (8자 이상)' 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-[#2D2D2D] transition-colors cursor-pointer">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <div className='text-red-500 text-xs font-semibold px-1 mt-1'>{errors.password.message}</div>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-gray-300" size={18} />
                  <input 
                    {...register("passwordCheck")} 
                    type={showPassword ? "text" : "password"}
                    className={`w-full p-4 pl-12 bg-gray-50/50 border rounded-2xl text-sm focus:outline-none focus:bg-white transition-all ${
                      errors.passwordCheck ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                    placeholder='비밀번호를 한번 더 입력하세요' 
                  />
                </div>
                {errors.passwordCheck && <div className='text-red-500 text-xs font-semibold px-1 mt-1'>{errors.passwordCheck.message}</div>}
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
                다음 단계로
              </button>
            </div>
          )}

          {/* --- STEP 3: 이름 단계 --- */}
          {step === 3 && (
            <div className="flex flex-col gap-6 items-center">
              <div className="w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-2 shadow-inner relative">
                <User className="w-10 h-10 text-blue-500" />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center" />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">Your Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 text-gray-300" size={18} />
                  <input 
                    {...register("name")}
                    className={`w-full p-4 pl-12 bg-gray-50/50 border rounded-2xl text-sm focus:outline-none focus:bg-white transition-all ${
                      errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                    type='text' placeholder='이름을 입력해주세요' 
                  />
                </div>
                {errors.name && <div className='text-red-500 text-xs font-semibold px-1 mt-1'>{errors.name.message}</div>}
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
                {isSubmitting ? "가입 처리 중..." : "SKOACH 시작하기"}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 🔴 [신규 추가] 커스텀 회원가입 완료 축하 모달 */}
      {isWelcomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 반투명 배경 레이어 (블러 추가로 완벽한 먹통 현상 차단) */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
          
          {/* 애니메이션 웰컴 카드 팝업 */}
          <div className="relative bg-white rounded-4xl max-w-sm w-full p-8 text-center shadow-2xl border border-gray-100 transform transition-all animate-in fade-in zoom-in-95 duration-300">
            {/* 반짝이는 이펙트 아이콘 실루엣 */}
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 mb-5 text-blue-600 animate-bounce">
              <Sparkles size={26} />
            </div>
            
            <h2 className="text-xl font-black text-gray-900 mb-2">
              가입을 진심으로 축하합니다!
            </h2>
            <p className="text-sm font-bold text-blue-600 mb-3">
              {nameValue || "사용자"}님 환영합니다.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              이제 SKOACH와 함께 최고의 프레젠테이션 대본과 <br />
              정교한 AI 발음 코칭을 직접 경험해 보세요.
            </p>
            
            <button
              type="button"
              onClick={handleWelcomeConfirm}
              className="w-full py-3.5 bg-[#2D2D2D] hover:bg-black text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-black/10 active:scale-95 cursor-pointer"
            >
              SKOACH 시작하기
            </button>
          </div>
        </div>
      )}

    </div>
  );
};