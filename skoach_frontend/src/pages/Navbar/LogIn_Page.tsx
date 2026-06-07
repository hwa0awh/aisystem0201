import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useAuth } from "../../context/AuthContext"; // 💡 우리가 수정한 AuthContext 가져오기
import { ChevronLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

// 💡 로그인용 Zod 스키마 정의
const schema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식이 아닙니다." }),
  password: z.string().trim().min(1, { message: "비밀번호를 입력해주세요." }),
});

type FormFields = z.infer<typeof schema>;

export const LogIn_Page = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 💡 AuthContext에서 login 함수 추출
  const [showPassword, setShowPassword] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<FormFields>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(schema),
    mode: "onChange"
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      await login(data);
      navigate('/');
      console.log("로그인 성공");
    } catch (error: any) {
      console.error(error);

      // 💡 브라우저 기본 alert는 완벽히 제외하고, 커스텀 모달만 트리거합니다.
      setModalMessage("이메일 또는 비밀번호가 일치하지 않습니다.\n다시 확인해주세요.");
      setShowErrorModal(true);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[#F4F4F4] text-[#2D2D2D] px-4 font-sans selection:bg-blue-100'>

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[40px] shadow-xl shadow-black/5 border border-gray-100 transition-all duration-500">

        <div className="flex items-center mb-8 relative">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-0 p-2 text-gray-400 hover:text-[#2D2D2D] hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="w-full text-center">
            <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase border border-blue-100">
              Welcome SKOACH
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-3 text-[#2D2D2D]">로그인</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='w-full flex flex-col gap-5'>

          {/* 이메일 입력 필드 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-gray-300" size={18} />
              <input
                {...register("email")}
                className={`w-full p-4 pl-12 bg-gray-50/50 border rounded-2xl text-sm focus:outline-none focus:bg-white transition-all ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                type='email' placeholder='이메일 주소를 입력하세요'
              />
            </div>
            {errors.email && <div className='text-red-500 text-xs font-semibold px-1 mt-1'>{errors.email.message}</div>}
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-gray-300" size={18} />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full p-4 pl-12 bg-gray-50/50 border rounded-2xl text-sm focus:outline-none focus:bg-white transition-all ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                placeholder='비밀번호를 입력하세요'
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-[#2D2D2D] transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <div className='text-red-500 text-xs font-semibold px-1 mt-1'>{errors.password.message}</div>}
          </div>

          {/* 로그인 제출 버튼 (메인 포인트 컬러인 블루 적용) */}
          <button
            disabled={!isValid || isSubmitting}
            type='submit'
            className={`w-full py-4 rounded-2xl text-base font-bold mt-4 transition-all shadow-xl active:scale-98 ${isValid && !isSubmitting
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 cursor-pointer"
                : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
              }`}
          >
            {isSubmitting ? "로그인 중..." : "SKOACH 로그인"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-3 text-sm font-medium text-gray-400">
          <div>
            아직 계정이 없으신가요?{" "}
            <Link to="/sign-up" className="text-blue-600 font-bold hover:underline ml-1">
              회원가입하기
            </Link>
          </div>
        </div>

        <div className="mt-2 flex flex-col items-center gap-3 text-sm font-medium text-gray-400">
          <div>
            비밀번호를 잊으셨나요?{" "}
            <Link to="/find-password" className="text-blue-600 font-bold hover:underline ml-1">
              비밀번호 재설정
            </Link>
          </div>
        </div>

      </div>

      {/* 커스텀 경고 모달 */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-4xl p-6 shadow-2xl border border-gray-50 flex flex-col items-center text-center animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-black text-[#2D2D2D] mb-2">로그인 실패</h3>
            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6 whitespace-pre-line">
              {modalMessage}
            </p>
            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3.5 bg-[#2D2D2D] text-white text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-black/10 cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};