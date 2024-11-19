import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { QuizPreview } from './QuizPreview';

// type Quiz = {
//   id: string;
//   quiz: string;
//   limitTime: number;
//   choiceList: {
//     content: string;
//     order: number;
//   }[];
// };

type QuizSet = {
  id: string;
  title: string;
  category: string;
  quizCount: number;
};

type Params = {
  search: string;
  onClick: (quizSet: QuizSet) => void;
};

const SEARCH_COUNT = 10;

const QuizSetSearchList = ({ onClick, search }: Params) => {
  const fetchPosts = async ({ pageParam = 1 }) => {
    const res = await fetch(
      '/api/quizset?' +
        new URLSearchParams([
          ['search', search],
          ['offset', String(pageParam * SEARCH_COUNT)],
          ['size', String(SEARCH_COUNT)]
        ])
    );
    const data: { quizSetList: QuizSet[] } = await res.json();
    return {
      data: data.quizSetList,
      nextPage: pageParam + 1,
      hasMore: data.quizSetList.length > 0
    };
  };

  const [selectedQuizSet, setSelectedQuizSet] = useState<null | QuizSet>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: [search],
      queryFn: fetchPosts,
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined)
    });

  const observerRef = useRef<null | HTMLDivElement>(null);

  const onIntersect = useCallback<IntersectionObserverCallback>(
    (entries) => {
      const [entry] = entries;

      if (entry.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [onIntersect]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching data.</p>;

  return (
    <>
      {data?.pages.map((page) =>
        page?.data.map((e) => (
          <div
            className="mb-2 rounded-m"
            onClick={() => {
              setSelectedQuizSet(e);
              onClick(e);
            }}
            key={e.id}
            style={{
              border: 'solid 2px ' + (selectedQuizSet?.id === e.id ? 'lightgreen' : 'white')
            }}
          >
            <QuizPreview title={e.title} description={e.category} />
          </div>
        ))
      )}
      <div ref={observerRef} className="flex justify-center">
        {(isFetchingNextPage || hasNextPage) && (
          <div className="inline-block m-2">
            <div className="w-4 h-4 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuizSetSearchList;
