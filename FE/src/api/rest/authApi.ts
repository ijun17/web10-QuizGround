import axios from 'axios';
import axiosInstance from './instance';

type LoginResponse = {
  result: string;
  acess_token: string;
};

export async function login(email: string, password: string): Promise<LoginResponse | null> {
  try {
    const payload = { email, password };

    const response = await axiosInstance.post<LoginResponse>('/api/auth/login', payload);

    console.log('Login Successful:', response.data);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}

type SignupPayload = {
  email: string;
  password: string;
  nickname: string;
};

type SignupResponse = {
  result: string;
};

export async function signUp(data: SignupPayload): Promise<SignupResponse | null> {
  try {
    const response = await axiosInstance.post<SignupResponse>('/api/auth/signup', data);
    console.log('Signup Successful:', response.data);

    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}

const handleAxiosError = (error: unknown): null => {
  if (axios.isAxiosError(error)) {
    console.error('Axios Error:', error.response?.data || error.message);
  } else {
    console.error('Unexpected Error:', error);
  }
  return null;
};
