import { Button } from '@mui/material';

type ClipboardCopyProps = {
  valueToCopy: string;
  message: string;
  className?: string;
};

export const ClipboardCopy: React.FC<ClipboardCopyProps> = ({ valueToCopy, message }) => {
  const handleCopyToClipboard = (): void => {
    navigator.clipboard
      .writeText(valueToCopy)
      .then(() => {
        alert('클립보드에 복사되었습니다: ');
      })
      .catch((err) => {
        console.error('복사 실패:', err);
      });
  };

  return (
    <div>
      <Button onClick={handleCopyToClipboard}>{message}</Button>
    </div>
  );
};
