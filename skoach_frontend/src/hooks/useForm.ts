import { useState, useMemo, type ChangeEvent, type FormEvent } from "react";

interface UseFormProps<T> {
  initialValue: T; 
  validate: (values: T) => Partial<Record<keyof T, string>>;
} 

function useForm<T extends Record<string, any>>({ initialValue, validate }: UseFormProps<T>) {
  const [values, setValues] = useState<T>(initialValue);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // 💡 제출 중 상태 추가

  // 💡 useEffect와 State 대신, values가 변할 때만 실시간으로 에러를 계산하도록 최적화 (무한 루프 원천 차단)
  const errors = useMemo(() => validate(values), [values, validate]);

  // 💡 에러 객체의 Key 개수가 0개이면 전체 유효성 통과(isValid)로 판단
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  // 사용자가 입력값을 바꿀 때 실행되는 함수
  const handleChange = (name: keyof T, text: string) => {
    setValues((prev) => ({
      ...prev, 
      [name]: text,
    }));
  };

  // 인풋이 포커스를 잃었을 때
  const handleBlur = (name: keyof T) => {
    setTouched((prev) => ({
      ...prev, 
      [name]: true,
    }));
  };

  // 인풋 속성들을 한 번에 가져오는 헬퍼 함수
  const getInputProps = (name: keyof T) => {
    const value = values[name];
    
    const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      handleChange(name, e.target.value);

    const onBlur = () => handleBlur(name);

    return { value, onChange, onBlur };
  };

  // 💡 [추가] 실제 로그인 컴포넌트에서 form의 onSubmit에 바인딩할 핸들러 함수
  const handleSubmit = (onSubmitHandler: (values: T) => Promise<void> | void) => {
    return async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      // 모든 필드를 방문한 것으로 처리 (제출 버튼 눌렀을 때 에러 메시지들을 한 번에 보여주기 위함)
      const allTouched: Partial<Record<keyof T, boolean>> = {};
      Object.keys(values).forEach((key) => {
        allTouched[key as keyof T] = true;
      });
      setTouched(allTouched);

      // 에러가 없고 유효할 때만 비즈니스 로직 실행
      if (isValid) {
        setIsSubmitting(true);
        try {
          await onSubmitHandler(values);
        } catch (error) {
          console.error("Form submission error:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    };
  };

  return { 
    values, 
    errors, 
    touched, 
    isValid,          // 💡 추가
    isSubmitting,     // 💡 추가
    getInputProps, 
    handleSubmit      // 💡 추가
  };
}

export default useForm;