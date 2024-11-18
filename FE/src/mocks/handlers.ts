import { http, HttpResponse } from 'msw';
import { QuizSetList } from './data';

export const handlers = [
  http.get('/api/quizset', ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset'));
    const size = Number(url.searchParams.get('size'));
    const search = url.searchParams.get('search');

    console.log(offset, size, search);
    return HttpResponse.json({ quizSetList: QuizSetList.slice(offset, offset + size) });
  })
];
