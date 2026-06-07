// context/AuthContext.tsx
import { createContext, useContext, useState, useMemo, type PropsWithChildren } from "react";
import type { RequestSigninDto } from "../types/auth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LOCAL_STORAGE_KEY } from "../constants/key";
import { postLogout, postSignin } from "../apis/auth";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  userName: string; // 💡 전역 유저 이름 상태
  isLoggedIn: boolean; 
  login: (signInData: RequestSigninDto) => Promise<void>;
  logout: () => Promise<void>;
  updateUserName: (name: string) => void; // 💡 이름을 실시간으로 변경할 전역 함수
}

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  userName: "홍길동",
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
  updateUserName: () => {},
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const {
    getItem: getAccessToken,
    setItem: setAccessToken,
    removeItem: removeAccessToken,
  } = useLocalStorage(LOCAL_STORAGE_KEY.accessToken);
  
  const {
    getItem: getRefreshToken,
    setItem: setRefreshToken,
    removeItem: removeRefreshToken,
  } = useLocalStorage(LOCAL_STORAGE_KEY.refreshToken);

  // 💡 초기 앱 진입 시 스토리지에 이름이 있다면 가져오고, 없으면 기본값 세팅
  const [userNameState, setUserNameState] = useState<string>(
    window.localStorage.getItem("userName") || "홍길동"
  );
  
  const [accessTokenState, setAccessTokenState] = useState<string | null>(getAccessToken());
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(getRefreshToken());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!getAccessToken());

  const login = async (signinData: RequestSigninDto) => {
    console.log("🔥 [0단계] 로그인 함수 작동함! 입력 데이터:", signinData);

    try {
      const response = await postSignin(signinData);

      console.log("-----------------------------------------");
      console.log("✅ 백엔드 응답 전체:", response);
      console.log("-----------------------------------------");

      const authData = response?.data; 

      if (authData) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = authData;
        const currentUserId = authData.id;
        
        // 💡 로그인 시 백엔드가 유저 이름을 같이 던져준다면 낚아챕니다. (없으면 스토리지 기본값 방어)
        const currentUserName = authData.name || "홍길동";

        console.log("🔍 추출된 데이터 확인:", { newAccessToken, newRefreshToken, currentUserId, currentUserName });

        if (!newAccessToken) {
          throw new Error("서버로부터 토큰을 받아오지 못했습니다.");
        }

        if (currentUserId) {
          window.localStorage.setItem("userId", String(currentUserId));
        }
        
        // 💡 로그인 성공 시 이름을 스토리지와 전역 State에 동시 주입
        window.localStorage.setItem("userName", currentUserName);
        setUserNameState(currentUserName);

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        setAccessTokenState(newAccessToken);
        setRefreshTokenState(newRefreshToken);
        setIsLoggedIn(true); 
        
        console.log("✅ [성공] 모든 전역 로그인 상태 업데이트 완료!");
      } else {
        throw new Error(response?.message || "로그인 응답 데이터 구조가 올바르지 않습니다.");
      }
    } catch (error: any) {
      console.log("-----------------------------------------");
      console.log("❌ 에러 블록(Catch)으로 안전하게 진입함!");
      const errorMessage = error?.response?.data?.message || error?.message || "로그인에 실패했습니다.";
      console.log("❌ 에러 메시지:", errorMessage);
      console.log("-----------------------------------------");
      
      // ✂️ 기존에 있던 alert(errorMessage); 코드를 제거했습니다.
      // 페이지 컴포넌트(LogIn_Page)에서 catch하여 이쁜 커스텀 모달을 띄우도록 에러만 위로 던집니다.
      throw error;
    }
  };

  const logout = async () => {
    try {
      await postLogout(accessTokenState); 
    } catch (error) {
      console.error("Logout error (server)", error);
    } finally {
      // 🛠️ 로그아웃 시 관련 로컬 스토리지 청소 완료
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.localStorage.removeItem("userId"); 
      window.localStorage.removeItem("userName"); 

      removeAccessToken();
      removeRefreshToken();

      // 전역 상태 포맷팅
      setUserNameState("홍길동");
      setAccessTokenState(null); 
      setRefreshTokenState(null); 
      setIsLoggedIn(false); 

      window.location.href = "/";
    }
  };

  // 💡 MyPage에서 정보 수정 시 호출할 상태 업데이트 헬퍼 함수
  const updateUserName = (name: string) => {
    window.localStorage.setItem("userName", name);
    setUserNameState(name); 
  };

  const authValue = useMemo(() => ({
    accessToken: accessTokenState,
    refreshToken: refreshTokenState,
    userName: userNameState, 
    isLoggedIn,
    login,
    logout,
    updateUserName 
  }), [accessTokenState, refreshTokenState, userNameState, isLoggedIn]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};