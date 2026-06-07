import type { CommonResponse } from "./common";

// 💡 회원가입 요청
export type RequestSignupDto = {
  email: string;
  name: string;
  password: string;
};

// 💡 회원가입 응답
export type ResponseSignupDto = CommonResponse<null>; 

// 💡 로그인 요청
export type RequestSigninDto = {
  email: string;
  password: string;
};

// 💡 로그인 응답 (Swagger 명세서의 "id": "20" 반영해서 string으로 수정)
export type ResponseSigninDto = CommonResponse<{
  id: string; // 🛠️ number -> string으로 변경!
  name: string;
  accessToken: string;
  refreshToken: string;
}>;

// 💡 내 정보 조회 (날짜 및 id 스펙 안전하게 보정)
export type ResponseMyInfoDto = CommonResponse<{
  id: string; // 🛠️ 로그인 API와 통일성을 위해 string 권장
  name: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string; // 🛠️ Date -> string으로 변경 (백엔드 JSON 포맷 대응)
  updatedAt: string; // 🛠️ Date -> string으로 변경
}>;