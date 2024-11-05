const sampleQuizImage =
  'https://i.namu.wiki/i/fcBRfQZOo2eCcLsPe63ZCKbzOBizhxvSKUrzEBqaMfTMSOe8I81p9s2SY_YxDxCEArNkSh_mwUTrnqX6ITkfUp3ey-p2xz1I6hk1oIxKEH-n3RFlgczUZFTxiu5xnvQUKPEo8BIOiKclL0-kJgi79w.webp';

type Props = {
  title: string;
  description: string;
};

export const QuizPreview = ({ title, description }: Props) => {
  return (
    <div className="component-default h-[100px] flex overflow-hidden mb-4">
      <div className="w-[100px] overflow-hidden">
        <img src={sampleQuizImage} />
      </div>
      <div className="flex flex-col pl-4 justify-center">
        <div className="font-bold text-xl">{title}</div>
        <div>{description}</div>
      </div>
    </div>
  );
};
