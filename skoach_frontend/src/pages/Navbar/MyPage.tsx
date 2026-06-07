// pages/MyPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext'; 
import { LOCAL_STORAGE_KEY } from '../../constants/key';
import { deleteAccount, postLogout, patchEmail, patchPassword, getMyInfo } from '../../apis/auth'; 
import { 
  User, 
  Mail, 
  FileText, 
  Mic, 
  ChevronRight, 
  LogOut, 
  Trash2, 
  AlertTriangle,
  AlertCircle,
  UserCheck,    
  KeyRound,
  X,
  Lock,
  Sparkles
} from 'lucide-react';

const MyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, updateUserName, userName } = useAuth(); 
  
  // 로컬 스토리지 데이터
  const token = window.localStorage.getItem(LOCAL_STORAGE_KEY.accessToken);
  const userId = window.localStorage.getItem("userId");

  // 💡 실시간으로 서버나 로컬에서 이메일을 받아와 관리할 상태 추가
  const [userEmail, setUserEmail] = useState("loading..."); 

  // 모달 상태 관리
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); 

  // 결과 알림 통합 팝업 모달 상태
  const [resultModal, setResultModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // 모달 내 입력 폼 상태 설정
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");

  // 비밀번호 변경전용 폼 상태값들
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");

  // 💡 컴포넌트 마운트 시 내 정보(이메일 포함) 불러오기 로직 추가
  useEffect(() => {
  const fetchUserData = async () => {
    try {
      if (token && userId) {
        // 💡 [image_65d388.png 에러 교정] 데이터 타입을 임시로 as any 단언 처리하여 유연하게 email을 트래킹합니다.
        const data = await getMyInfo(token, userId) as any;
        if (data && data.email) {
          setUserEmail(data.email); 
        }
      }
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
      const savedEmail = window.localStorage.getItem("userEmail");
      if (savedEmail) setUserEmail(savedEmail);
      else setUserEmail("정보 없음");
    }
  };
    fetchUserData();
  }, [token, userId]);

  // 🚪 실제 로그아웃 Mutation 로직
  const { mutate: logoutMutation, isPending: isLogoutPending } = useMutation({
    mutationFn: () => postLogout(token),
    onSuccess: async () => {
      await logout();
      queryClient.clear();
      window.localStorage.removeItem("userName");
      window.localStorage.removeItem("userId");
      window.localStorage.removeItem("userEmail");
      localStorage.removeItem(LOCAL_STORAGE_KEY.accessToken);
      localStorage.removeItem(LOCAL_STORAGE_KEY.refreshToken);
      setIsLogoutModalOpen(false);
      navigate('/', { replace: true });
    },
    onError: (error) => {
      console.error("로그아웃 실패: ", error);
      logout();
      queryClient.clear();
      window.localStorage.removeItem("userName");
      window.localStorage.removeItem("userId");
      localStorage.removeItem(LOCAL_STORAGE_KEY.accessToken);
      localStorage.removeItem(LOCAL_STORAGE_KEY.refreshToken);
      setIsLogoutModalOpen(false);
      window.location.href = "/";
    },
  });

  // 🔥 회원 탈퇴 Mutation 로직
  const { mutate: deleteAccountMutation, isPending: isDeletePending } = useMutation({
    mutationFn: () => deleteAccount(token, userId),
    onSuccess: async () => {
      await logout();
      queryClient.clear();
      window.localStorage.removeItem("userName");
      window.localStorage.removeItem("userId");
      window.localStorage.removeItem("userEmail");
      localStorage.removeItem(LOCAL_STORAGE_KEY.accessToken);
      localStorage.removeItem(LOCAL_STORAGE_KEY.refreshToken);
      setIsDeleteModalOpen(false);
      setIsSuccessModalOpen(true);
    },
    onError: (error) => {
      console.error("회원 탈퇴 실패: ", error);
      alert("회원 탈퇴 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setIsDeleteModalOpen(false);
    },
  });

  // ✉️ 이메일 변경 Mutation 로직
  const { mutate: changeEmailMutation, isPending: isEmailPending } = useMutation({
    mutationFn: (body: { email: string; password: string }) => patchEmail(token, userId, body),
    onSuccess: () => {
      setIsChangeEmailModalOpen(false);
      setResultModal({
        isOpen: true,
        type: "success",
        title: "변경 완료",
        message: "이메일 주소가 성공적으로 변경되었습니다.",
      });
      // 성공 시 화면단 이메일 텍스트 즉시 갱신
      setUserEmail(newEmail);
      window.localStorage.setItem("userEmail", newEmail);
      
      setNewEmail("");
      setCurrentPasswordForEmail("");
    },
    onError: (error: any) => {
      console.error("이메일 변경 실패: ", error);
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message;

      let title = "변경 실패";
      let message = "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

      if (status === 400) {
        message = backendMessage || "이미 사용 중인 이메일이거나 입력값이 올바르지 않습니다.";
      } else if (status === 401) {
        title = "비밀번호 불일치";
        message = "현재 비밀번호가 일치하지 않습니다.\n다시 확인 후 입력해 주세요.";
      } else if (status === 404) {
        message = "사용자 정보를 찾을 수 없습니다.";
      }

      setResultModal({ isOpen: true, type: "error", title, message });
    },
  });

  // 🔒 비밀번호 변경 Mutation 로직
  const { mutate: changePasswordMutation, isPending: isPasswordPending } = useMutation({
    mutationFn: (body: { new_password: string; old_password: string }) => patchPassword(token, userId, body),
    onSuccess: () => {
      setIsChangePasswordModalOpen(false); 
      setResultModal({
        isOpen: true,
        type: "success",
        title: "비밀번호 변경 완료",
        message: "비밀번호가 성공적으로 변경되었습니다.\n다음 로그인 시부터 적용됩니다.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordCheck("");
    },
    onError: (error: any) => {
      console.error("비밀번호 변경 실패: ", error);
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message;

      let title = "변경 실패";
      let message = "비밀번호 변경 중 오류가 발생했습니다.";

      if (status === 401) {
        title = "현재 비밀번호 불일치";
        message = "입력하신 현재 비밀번호가 기존 비밀번호와 일치하지 않습니다.\n다시 확인 후 입력해 주세요.";
      } else if (status === 400) {
        message = backendMessage || "새 비밀번호 규격(8자 이상)을 만족하지 않습니다.";
      } else if (status === 404) {
        message = "사용자를 찾을 수 없습니다.";
      }

      setResultModal({ isOpen: true, type: "error", title, message });
    },
  });

  const handleLogoutConfirm = () => {
    if (isLogoutPending || isDeletePending || isEmailPending || isPasswordPending) return;
    logoutMutation();
  };

  const handleDeleteAccountSubmit = () => {
    if (isDeletePending || isLogoutPending || isEmailPending || isPasswordPending) return;
    if (!token || !userId) {
      alert("인증 정보가 만료되었습니다. 다시 로그인 후 시도해 주세요.");
      return;
    }
    deleteAccountMutation();
  };

  const handleEditProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert("변경할 이름을 입력해 주세요.");
      return;
    }
    updateUserName(newName); 
    setIsEditProfileModalOpen(false); 
    setNewName(""); 
  };

  const handleChangeEmailSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailPending) return;

    if (!newEmail.trim() || !currentPasswordForEmail.trim()) {
      setResultModal({ isOpen: true, type: "error", title: "입력 오류", message: "새 이메일과 현재 비밀번호를 모두 입력해 주세요." });
      return;
    }
    changeEmailMutation({ email: newEmail, password: currentPasswordForEmail });
  };

  const handleChangePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordPending) return;

    if (!currentPassword.trim() || !newPassword.trim() || !newPasswordCheck.trim()) {
      setResultModal({ isOpen: true, type: "error", title: "입력 오류", message: "모든 비밀번호 필드를 입력해 주세요." });
      return;
    }
    if (newPassword.length < 8) {
      setResultModal({ isOpen: true, type: "error", title: "규격 오류", message: "새 비밀번호는 최소 8자 이상이어야 합니다." });
      return;
    }
    if (newPassword !== newPasswordCheck) {
      setResultModal({ isOpen: true, type: "error", title: "비밀번호 불일치", message: "새로 입력하신 비밀번호와 비밀번호 확인 값이\n서로 일치하지 않습니다." });
      return;
    }
    changePasswordMutation({ old_password: currentPassword, new_password: newPassword });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-800 font-sans select-none flex flex-col justify-center items-center p-6 sm:p-10">
      <main className="w-full max-w-6xl space-y-8 animate-in fade-in duration-300 py-12">
        
        {/* 헤더 */}
        <header className="flex justify-between items-center pb-6 shrink-0 border-b border-gray-200/60">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-gray-900">마이페이지</h1>
            <p className="text-sm text-gray-400">계정 정보와 활동 내역을 관리할 수 있습니다.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLogoutPending || isDeletePending || isEmailPending || isPasswordPending}
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              <LogOut size={16} className="mr-2" /> 
              {isLogoutPending ? "로그아웃 중..." : "로그아웃"}
            </button>
            
            <button
              type="button"
              disabled={isDeletePending || isLogoutPending || isEmailPending || isPasswordPending}
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Trash2 size={16} className="mr-2" /> 회원 탈퇴
            </button>
          </div>
        </header>

        {/* 1️⃣ 프로필 (💡 요청하신 이메일 노출 사양 추가 적용 파트) */}
        <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
              <User size={32} />
            </div>
            
            {/* 💡 세로 간격 조절 클래스 space-y-1.5 설계 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-gray-900">{userName}님</span>
                <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded border border-blue-100 font-bold">일반 회원</span>
              </div>
              
              {/* 💡 [신규 탑재] 가독성 높은 메일 아이콘 및 유저 이메일 데이터 배치 */}
              <div className="flex items-center gap-1.5 text-sm text-gray-400 font-medium">
                <Mail size={14} className="text-gray-300" />
                <span>{userEmail}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2️⃣ 개인 워크스페이스 */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 pl-1">개인 워크스페이스</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => navigate('/script-generate')}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">내 대본 생성 기록</h3>
                  <p className="text-xs text-gray-400 mt-0.5">작성했던 대본을 다시 확인합니다.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>

            <div 
              onClick={() => navigate('/pronunciation-coach')}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                  <Mic size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">발표 코칭 내역</h3>
                  <p className="text-xs text-gray-400 mt-0.5">AI 발음 피드백 결과를 확인합니다.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </section>

        {/* 3️⃣ 계정 관리 */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 pl-1">계정 관리</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => setIsEditProfileModalOpen(true)} 
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">이름 수정</h3>
                  <p className="text-xs text-gray-400 mt-0.5">프로필 이름을 변경합니다.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>

            <div 
              onClick={() => setIsChangeEmailModalOpen(true)}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center border border-orange-100">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">이메일 변경</h3>
                  <p className="text-xs text-gray-400 mt-0.5">로그인 이메일을 수정합니다.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>

            <div 
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">비밀번호 변경</h3>
                  <p className="text-xs text-gray-400 mt-0.5">보안 비밀번호를 갱신합니다.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </section>

      </main>

      {/* 모달 렌더링 파트는 기존과 100% 동일하게 유지 */}
      {/* (1. 개인정보 수정 모달) */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsEditProfileModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-8 text-left shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsEditProfileModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black transition cursor-pointer"><X size={20} /></button>
            <h3 className="text-xl font-black text-gray-900 mb-2">개인정보 수정</h3>
            <p className="text-xs text-gray-400 mb-6">서비스에서 사용할 프로필 이름을 설정하세요.</p>
            <form onSubmit={handleEditProfileSave} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase px-1">이름(닉네임)</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" required placeholder={userName} />
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#2D2D2D] hover:bg-black text-white text-sm font-bold rounded-xl transition-all cursor-pointer">변경 사항 저장</button>
            </form>
          </div>
        </div>
      )}

      {/* (2. 이메일 변경 입력 모달) */}
      {isChangeEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsChangeEmailModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-8 text-left shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsChangeEmailModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black transition cursor-pointer"><X size={20} /></button>
            <h3 className="text-xl font-black text-gray-900 mb-2 whitespace-nowrap">이메일 주소 변경</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed break-keep">로그인에 사용할 새로운 이메일 주소와 본인 확인용 현재 비밀번호를 입력해 주세요.</p>
            <form onSubmit={handleChangeEmailSave} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase px-1">새 이메일 주소</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-gray-300" size={18} />
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full p-3.5 pl-12 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" required placeholder="새로운 이메일 주소 입력" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase px-1">현재 비밀번호</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-gray-300" size={18} />
                  <input type="password" value={currentPasswordForEmail} onChange={(e) => setCurrentPasswordForEmail(e.target.value)} className="w-full p-3.5 pl-12 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" required placeholder="현재 비밀번호 입력" />
                </div>
              </div>
              <button type="submit" disabled={isEmailPending} className="w-full py-3.5 bg-[#2D2D2D] hover:bg-black text-white text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50">{isEmailPending ? "변경 중..." : "이메일 주소 변경"}</button>
            </form>
          </div>
        </div>
      )}

      {/* (3. 비밀번호 변경 모달) */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsChangePasswordModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-8 text-left shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsChangePasswordModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black transition cursor-pointer"><X size={20} /></button>
            <h3 className="text-xl font-black text-gray-900 mb-2 whitespace-nowrap">비밀번호 변경</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed break-keep">안전한 계정 이용을 위해 비밀번호를 주기적으로 변경해 주세요.</p>
            <form onSubmit={handleChangePasswordSave} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 px-1">현재 비밀번호</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" required placeholder="기존 비밀번호 입력" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 px-1">새 비밀번호</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" required placeholder="새 비밀번호 입력 (8자 이상)" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 px-1">새 비밀번호 확인</label>
                <input type="password" value={newPasswordCheck} onChange={(e) => setNewPasswordCheck(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" required placeholder="새 비밀번호 재입력" />
              </div>
              <button type="submit" disabled={isPasswordPending} className="w-full py-3.5 bg-[#2D2D2D] hover:bg-black text-white text-sm font-bold rounded-xl transition-all cursor-pointer mt-2 disabled:opacity-50">{isPasswordPending ? "변경 중..." : "비밀번호 변경하기"}</button>
            </form>
          </div>
        </div>
      )}

      {/* 로그아웃 모달 */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsLogoutModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl transform transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4"><AlertCircle className="h-6 w-6 text-red-600" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">로그아웃 하시겠습니까?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">로그아웃하시면 서비스 이용을 위해 <br />다시 로그인해야 합니다.</p>
            <div className="flex gap-3">
              <button type="button" disabled={isLogoutPending} onClick={() => setIsLogoutModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50">취소</button>
              <button type="button" disabled={isLogoutPending} onClick={handleLogoutConfirm} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-600/10 active:scale-95 cursor-pointer flex items-center justify-center disabled:bg-red-400">{isLogoutPending ? "처리 중..." : "로그아웃"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 모달 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative bg-white rounded-4xl max-w-sm w-full p-8 text-center shadow-2xl transform transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-red-50 mb-5 text-red-600 animate-pulse"><AlertTriangle size={24} strokeWidth={2.5} /></div>
            <h3 className="text-xl font-black text-gray-900 mb-2">정말로 탈퇴하시겠습니까?</h3>
            <p className="text-sm font-medium text-gray-400 mb-6 leading-relaxed break-keep">탈퇴 시 기존의 모든 대본 데이터 및 <br />AI 발표 분석 피드백 내역이 <span className="text-red-500 font-bold">즉시 삭제</span>되며, <br />이 작업은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button type="button" disabled={isDeletePending || isLogoutPending} onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-2xl transition-colors cursor-pointer disabled:opacity-50">취소</button>
              <button type="button" disabled={isDeletePending || isLogoutPending} onClick={handleDeleteAccountSubmit} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-red-600/10 active:scale-95 cursor-pointer flex items-center justify-center disabled:bg-red-400">{isDeletePending ? "탈퇴 중..." : "탈퇴하기"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 탈퇴 완료 모달 */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
          <div className="relative bg-white rounded-4xl max-w-sm w-full p-8 text-center shadow-2xl transform transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-gray-50 border border-gray-100 mb-5 text-gray-400"><AlertTriangle size={24} strokeWidth={2.5} className="text-gray-500" /></div>
            <h3 className="text-xl font-black text-gray-900 mb-2">탈퇴가 완료되었습니다</h3>
            <p className="text-sm font-medium text-gray-400 mb-6 leading-relaxed break-keep">그동안 SKOACH 서비스를 이용해 주셔서 감사합니다.<br />더 나은 서비스로 다시 만날 수 있도록 노력하겠습니다.</p>
            <button type="button" onClick={() => { setIsSuccessModalOpen(false); navigate('/', { replace: true }); }} className="w-full py-3.5 bg-[#2D2D2D] hover:bg-black text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-black/10 active:scale-95 cursor-pointer text-center">확인</button>
          </div>
        </div>
      )}

      {/* 결과 알림 통합 모달 */}
      {resultModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setResultModal(prev => ({ ...prev, isOpen: false }))} />
          <div className="relative bg-white rounded-4xl max-w-sm w-full p-8 text-center shadow-2xl border border-gray-100 transform transition-all animate-in fade-in zoom-in-95 duration-300">
            {resultModal.type === "success" ? (
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 mb-5 text-blue-600 animate-bounce"><Sparkles size={26} /></div>
            ) : (
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-red-50 border border-red-100 mb-5 text-red-500"><AlertCircle size={26} /></div>
            )}
            <h2 className="text-xl font-black text-gray-900 mb-2">{resultModal.title}</h2>
            <p className="text-xs text-gray-400 font-bold leading-relaxed mb-6 whitespace-pre-line">{resultModal.message}</p>
            <button type="button" onClick={() => setResultModal(prev => ({ ...prev, isOpen: false }))} className="w-full py-3.5 bg-[#2D2D2D] hover:bg-black text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-black/10 active:scale-95 cursor-pointer text-center">확인</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyPage;