export type UserSigninInformation = {
  email: string;
  password: string;
};

function validateUser(values: UserSigninInformation) {
  // 💡 빈 문자열을 미리 채우지 않고, 에러가 발생한 필드만 동적으로 추가할 빈 객체로 시작합니다.
  const errors: Partial<Record<keyof UserSigninInformation, string>> = {};

  // 이메일 형식 정규식 검사 (뒤에 붙어있던 불필요한 쉼표 ',' 제거)
  if (!/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i.test(values.email)) {
    errors.email = "Invalid email format.";
  }

  // 비밀번호 8자 ~ 20자 사이 검사
  if (!(values.password.length >= 8 && values.password.length <= 20)) {
    errors.password = "Please enter a password between 8 and 20 characters.";
  }

  // 💡 에러가 전혀 없다면 완전히 빈 객체 {} 가 반환되므로, useForm에서 isValid가 정상적으로 true가 됩니다!
  return errors;
}

// 로그인 유효성 검사
function validateSignin(values: UserSigninInformation) {
  return validateUser(values);
}

export { validateSignin };