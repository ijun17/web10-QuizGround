import axiosInstance from './instance';
import {
  CreateQuizSetPayload,
  CreateQuizSetResponse,
  QuizSet,
  QuizSetDetailResponse,
  QuizSetListResponse
} from './quizTypes';

// 퀴즈셋 목록 조회 (검색, 페이징 고려)
export async function getQuizSetList(
  category: string,
  cursor: string,
  take: number,
  search: string
): Promise<QuizSetListResponse | null> {
  try {
    const params = { category, cursor, take, search };
    const response = await axiosInstance.get<QuizSetListResponse>('/api/quizset', { params });

    return response.data;
  } catch (error) {
    console.error('Error fetching quiz set list:', error);
    return null;
  }
}

// 퀴즈셋 하나 조회
export async function getQuizSetDetail(id: string): Promise<QuizSetDetailResponse | null> {
  try {
    const response = await axiosInstance.get<QuizSetDetailResponse>(`/api/quizset/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz set detail:', error);
    return null;
  }
}
// 제작한 퀴즈셋 목록 조회  (로그인 된 사용자)
export async function getMyQuizSets(): Promise<QuizSet[] | null> {
  try {
    const response = await axiosInstance.get<QuizSet[]>('/api/quizset/private');
    return response.data;
  } catch (error) {
    console.error('Error fetching private quiz sets:', error);
    return null;
  }
}

// 퀴즈셋 생성
export async function createQuizSet(
  data: CreateQuizSetPayload
): Promise<CreateQuizSetResponse | null> {
  try {
    const response = await axiosInstance.post<CreateQuizSetResponse>('/api/quizset', data);
    return response.data;
  } catch (error) {
    console.error('Error creating quiz set:', error);
    return null;
  }
}
// 퀴즈셋 수정
export async function updateQuizSet(
  id: string,
  data: CreateQuizSetPayload
): Promise<CreateQuizSetResponse | null> {
  try {
    const response = await axiosInstance.patch<CreateQuizSetResponse>(`/api/quizset/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating quiz set:', error);
    return null;
  }
}
// 퀴즈셋 삭제
export async function deleteQuizSet(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/api/quizset/${id}`);
    console.log(`Quiz set ${id} deleted successfully`);
  } catch (error) {
    console.error('Error deleting quiz set:', error);
  }
}
