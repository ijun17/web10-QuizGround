const sampleQuizImage =
  'https://yt3.ggpht.com/f9olK5dD-VIZu35PnoEqHJqguck1OtcCQvRCJ4Ub4lbEzHdiZbuiIfN5nPlHeoY2EgBzu06kExzprg=s662-nd-v1';

type Props = {
  title: string;
  description: string;
};

const mock = {
  title: '내가만든퀴즈',
  description: '아무거나 찍어주세요 행운을 테스트합니다.'
};

export const QuizPreview = ({ title, description }: Props) => {
  return (
    <div className="component-default h-[100px] flex overflow-hidden">
      <div className="w-[100px] overflow-hidden">
        <img src={sampleQuizImage} className="object-cover w-[100%] h-[100%]" />
      </div>
      <div className="flex flex-col pl-4 justify-center">
        <div className="font-bold text-xl">{mock.title}</div>
        <div>{mock.description}</div>
      </div>
    </div>
  );
};
