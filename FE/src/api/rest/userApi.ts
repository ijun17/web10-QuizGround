import axios from 'axios';
import axiosInstance from './instance';

type UserProfile = {
  nickname: string;
  character: string;
  point: number;
};

// 사용자 프로필 조회
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const response = await axiosInstance.get<UserProfile>('/api/auth/profile');
    console.log('User Profile:', response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching profile:', error.response?.data || error.message);
    } else {
      console.error('Unexpected Error:', error);
    }

    // 실패 시 null 반환
    return null;
  }
}

type UpdateUserPayload = {
  nickname?: string;
  character?: string;
  point?: number;
};

type UpdateUserResponse = {
  success: boolean;
};

// 사용자 정보 수정
export async function updateUser(data: UpdateUserPayload): Promise<UpdateUserResponse | null> {
  try {
    const response = await axiosInstance.patch<UpdateUserResponse>('/api/users', data);
    console.log('Update User Response:', response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating user:', error.response?.data || error.message);
    } else {
      console.error('Unexpected Error:', error);
    }

    return null;
  }
}
