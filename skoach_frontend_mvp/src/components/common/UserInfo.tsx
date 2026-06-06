import React from 'react';

interface UserInfoProps {
  /*사용자 이름*/
  name?: string;
}

/* 사용자 프로필 레이아웃 컴포넌트*/
export const UserInfo: React.FC<UserInfoProps> = ({ name = "UserName" }) => {
  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded-full border border-gray-100 shadow-sm">
      {/* 사용자 프로필 */}
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-md">
        <span className="text-2xl text-white select-none">👤</span>
      </div>

      {/* 사용자 이름 */}
      <span className="text-sm font-semibold text-gray-900 pr-2 Noto Sans KR">
        {name}
      </span>
    </div>
  );
};