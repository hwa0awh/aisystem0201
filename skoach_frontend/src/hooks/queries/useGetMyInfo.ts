import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "../../constants/key";
import { getMyInfo } from "../../apis/auth";

function useGetMyInfo(accessToken: string | null, userId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY.myInfo, accessToken, userId], // 키에 userId 추가
    queryFn: () => getMyInfo(accessToken, userId), 
    enabled: !!accessToken && !!userId, // 토큰과 ID가 둘 다 있을 때만 실행!
  });
}

export default useGetMyInfo;