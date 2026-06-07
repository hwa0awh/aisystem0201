// apis/auth.ts
import type { RequestSigninDto, RequestSignupDto, ResponseMyInfoDto, ResponseSigninDto, ResponseSignupDto } from "../types/auth.ts";
import { axiosInstance } from "./axios.ts";

// 💡 회원가입
export const postSignup = async (body: RequestSignupDto): Promise<ResponseSignupDto> => {
  const { data } = await axiosInstance.post("/api/users", body);
  return data;
};

// 💡 로그인 (최종 확인 완료된 주소)
export const postSignin = async (body: RequestSigninDto): Promise<ResponseSigninDto> => {
  const { data } = await axiosInstance.post("/api/auth/login", body);
  return data;
};

// 💡 내 정보 조회
export const getMyInfo = async (token: string | null, userId: string | null): Promise<ResponseMyInfoDto> => {
  if (!token || !userId) throw new Error("인증 토큰 또는 유저 ID가 없습니다.");

  const { data } = await axiosInstance.get(`/api/users/${userId}`, { 
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// 💡 로그아웃
export const postLogout = async (token: string | null): Promise<any> => {
  if (!token) throw new Error("인증 토큰이 없습니다.");

  const { data } = await axiosInstance.post("/api/auth/logout", null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// 💡 회원 탈퇴 (DELETE /api/users/{user_id})
export const deleteAccount = async (token: string | null, userId: string | null): Promise<void> => {
  if (!token || !userId) throw new Error("인증 토큰 또는 유저 ID가 없습니다.");

  await axiosInstance.delete(`/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 💡 [신규 추가 - image_66c026.png 반영] 이메일 변경 (PATCH /api/users/{user_id}/email)
export const patchEmail = async (
  token: string | null, 
  userId: string | null, 
  body: { email: string; password: string }
): Promise<any> => {
  if (!token || !userId) throw new Error("인증 토큰 또는 유저 ID가 없습니다.");

  // axios.patch(url, data, config) 순서이므로 두 번째 인자에 body를 전송합니다.
  const { data } = await axiosInstance.patch(`/api/users/${userId}/email`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const patchPassword = async (
  token: string | null, 
  userId: string | null, 
  body: { new_password: string; old_password: string }
): Promise<any> => {
  if (!token || !userId) throw new Error("인증 토큰 또는 유저 ID가 없습니다.");

  const { data } = await axiosInstance.patch(`/api/users/${userId}/password`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};