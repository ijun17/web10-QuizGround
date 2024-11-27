import { useState } from 'react';
import { login, signUp } from '@/api/rest/authApi';
import { TextInput } from '@/components/TextInput';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const LoginModal = ({ isOpen, onClose }: Props) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    const response = await login(email, password);
    if (response) {
      console.log(response);
      console.log(response.access_token);
      localStorage.setItem('accessToken', response.access_token);
    } else {
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="component-popup max-w-md bg-white w-[90%] animate-popup border-4 border-blue-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-lg font-bold w-full h-16 flex">
            <button
              className={`w-[50%] h-full px-4 transition ${!isSignUp ? 'text-blue-500' : 'text-gray-200'} cursor-pointer`}
              onClick={() => setIsSignUp(false)}
            >
              로그인
            </button>
            <button
              className={`w-[50%] h-full px-4 transition ${isSignUp ? 'text-blue-500' : 'text-gray-200'} cursor-pointer`}
              onClick={() => setIsSignUp(true)}
            >
              회원가입
            </button>
          </div>
          <div className="relative w-full h-[2px] mx-auto bg-gray-200 rounded-full cursor-pointer">
            <div
              className={`absolute w-[50%] h-[2px] bg-blue-500 rounded-full transition-transform duration-400 ${
                isSignUp ? 'translate-x-[100%]' : ''
              }`}
            ></div>
          </div>
        </div>

        <div className="h-full transition-all duration-500 p-4">
          {isSignUp ? (
            <SignUpForm setIsSignUp={setIsSignUp} />
          ) : (
            <LoginForm handleLogin={handleLogin} />
          )}
          <button
            className="mt-2 mb-4 w-full bg-gray-200 h-11 rounded-md hover:bg-gray-300"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

type LoginFormProps = {
  handleLogin: (email: string, password: string) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const onSubmit = () => {
    if (!email) {
      setEmailError('이메일을 입력해주세요');
      return;
    }
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요');
      return;
    }
    handleLogin(email, password);
  };

  return (
    <div className="flex flex-col justify-between h-[240px]">
      <div>
        <TextInput
          label="이메일"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          error={emailError}
          className="mb-2"
        />
        <TextInput
          label="비밀번호"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError('');
          }}
          error={passwordError}
        />
      </div>

      <button
        className="w-full px-4 py-3 mt-4 text-sm font-semibold text-blue-900 bg-yellow-400 rounded-md hover:bg-yellow-500"
        onClick={onSubmit}
      >
        로그인
      </button>
    </div>
  );
};

type SignUpFormProps = {
  setIsSignUp: (value: boolean) => void; // props 타입 정의
};

const SignUpForm: React.FC<SignUpFormProps> = ({ setIsSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  const handleSignUp = async () => {
    if (!nickname) {
      setNicknameError('이메일을 입력해주세요');
      return;
    }
    if (!email) {
      setEmailError('이메일을 입력해주세요');
      return;
    }
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요');
      return;
    }

    const result = await signUp({ email, password, nickname });

    if (result) {
      alert('회원가입에 성공했습니다!');
      setIsSignUp(false);
    } else {
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col justify-between h-[240px]">
      <div>
        <TextInput
          label="닉네임"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setNicknameError('');
          }}
          error={nicknameError}
          className="mb-2"
        />
        <TextInput
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          error={emailError}
          className="mb-2"
        />
        <TextInput
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError('');
          }}
          error={passwordError}
        />
      </div>

      <button
        onClick={handleSignUp}
        className="w-full px-4 py-3 mt-4 text-sm font-semibold text-blue-900 bg-yellow-400 rounded-md hover:bg-yellow-500"
      >
        회원가입
      </button>
    </div>
  );
};
