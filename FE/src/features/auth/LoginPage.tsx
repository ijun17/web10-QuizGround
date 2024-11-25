import { HeaderBar } from '@/components/HeaderBar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signUp } from '@/api/rest/authApi';

export const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    const response = await login(email, password);
    if (response) {
      console.log(response);
      console.log(response.access_token);
      localStorage.setItem('accessToken', response.access_token);
      // 로그인 성공 시 메인 페이지로 이동
      navigate('/');
    } else {
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      <HeaderBar />

      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h6 className="text-lg font-bold">
              <span
                className={`px-4 ${!isSignUp ? 'text-yellow-400' : 'text-gray-400'} cursor-pointer`}
                onClick={() => setIsSignUp(false)}
              >
                로그인
              </span>
              <span
                className={`px-4 ${isSignUp ? 'text-yellow-400' : 'text-gray-400'} cursor-pointer`}
                onClick={() => setIsSignUp(true)}
              >
                회원가입
              </span>
            </h6>
            <div
              className="relative w-16 h-4 mx-auto bg-yellow-400 rounded-full cursor-pointer"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              <div
                className={`absolute w-9 h-9 bg-blue-800 rounded-full transition-transform duration-500 ${
                  isSignUp ? 'translate-x-8' : ''
                }`}
              ></div>
            </div>
          </div>

          <div
            className="bg-gray-800 rounded-md p-8 transition-all duration-500"
            style={{ minHeight: '400px' }}
          >
            {isSignUp ? (
              <SignUpForm setIsSignUp={setIsSignUp} />
            ) : (
              <LoginForm handleLogin={handleLogin} />
            )}
          </div>
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

  const onSubmit = () => {
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    handleLogin(email, password);
  };

  return (
    <div>
      <h4 className="mb-4 text-xl font-bold text-gray-100">로그인</h4>
      <div className="mb-4">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 text-sm text-gray-300 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
        />
      </div>
      <div className="mb-4">
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 text-sm text-gray-300 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
        />
      </div>
      <button
        className="w-full px-4 py-3 mt-4 text-sm font-semibold text-blue-900 bg-yellow-400 rounded-md hover:bg-yellow-500"
        onClick={onSubmit}
      >
        로그인
      </button>
      <p className="mt-4 text-sm">
        <a href="#" className="text-yellow-400 hover:underline">
          비밀번호를 잊으셨나요?
        </a>
      </p>
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

  const handleSignUp = async () => {
    if (!email || !password || !nickname) {
      alert('모든 필드를 입력해주세요.');
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
    <div>
      <h4 className="mb-4 text-xl font-bold text-gray-100">회원가입</h4>
      <div className="mb-4">
        <input
          type="text"
          placeholder="닉네임"
          className="w-full px-4 py-3 text-sm text-gray-300 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <input
          type="email"
          placeholder="이메일"
          className="w-full px-4 py-3 text-sm text-gray-300 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full px-4 py-3 text-sm text-gray-300 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          onChange={(e) => setPassword(e.target.value)}
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
