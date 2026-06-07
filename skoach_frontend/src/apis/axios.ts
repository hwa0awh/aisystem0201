import axios from "axios";  
import { LOCAL_STORAGE_KEY } from "../constants/key";

export const axiosInstance = axios.create({
  // ⭕ 실제 주소를 지우고 빈 문자열로 두어야 Vite 프록시 물길을 타게 됩니다!
  baseURL: '', 
});

// 요청 인터셉터: 모든 요청 전에 accessToken을 Authorization 헤더에 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const storedToken = localStorage.getItem(LOCAL_STORAGE_KEY.accessToken);
    const accessToken = storedToken ? JSON.parse(storedToken) : null;

    if (accessToken && !config.headers.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  }, 
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 에러 핸들링
axiosInstance.interceptors.response.use(
  (response) => response, 
  async (error) => {
    console.log("인터셉터에서 에러 감지함!", error.response?.status);
    return Promise.reject(error); 
  },
);