import { HeaderBar } from '@/components/HeaderBar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/mypage');
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
            {isSignUp ? <SignUpForm /> : <LoginForm handleLogin={handleLogin} />}
          </div>
        </div>
      </div>
    </div>
  );
};

type LoginFormProps = {
  handleLogin: () => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ handleLogin }) => (
  <div>
    <h4 className="mb-4 text-xl font-bold text-gray-100">로그인</h4>
    <div className="mb-4">
      <input
        type="email"
        placeholder="이메일"
        className="w-full px-4 py-3 text-sm text-gray-300 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
      />
    </div>
    <div className="mb-4">
      <input
        type="password"
        placeholder="비밀번호"
        className="w-full px-4 py-3 text-sm text-gray-300 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
      />
    </div>
    <button
      className="w-full px-4 py-3 mt-4 text-sm font-semibold text-blue-900 bg-yellow-400 rounded-md hover:bg-yellow-500"
      onClick={handleLogin}
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

const SignUpForm = () => (
  <div>
    <h4 className="mb-4 text-xl font-bold text-gray-100">회원가입</h4>
    <div className="mb-4">
      <input
        type="text"
        placeholder="닉네임"
        className="w-full px-4 py-3 text-sm text-gray-300 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
      />
    </div>
    <div className="mb-4">
      <input
        type="email"
        placeholder="이메일"
        className="w-full px-4 py-3 text-sm text-gray-300 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
      />
    </div>
    <div className="mb-4">
      <input
        type="password"
        placeholder="비밀번호"
        className="w-full px-4 py-3 text-sm text-gray-300 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
      />
    </div>
    <button className="w-full px-4 py-3 mt-4 text-sm font-semibold text-blue-900 bg-yellow-400 rounded-md hover:bg-yellow-500">
      회원가입
    </button>
  </div>
);
