import { Button } from '@mui/material';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

type CardProps = {
  title: string;
  description: string;
  path?: string;
  action?: () => void;
};

export const InfoCard: FC<CardProps> = ({ title, description, path, action }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-4 border-blue-200 flex flex-col justify-between">
      <h3 className="text-xl font-semibold text-blue-600">{title}</h3>
      <p className="mt-4 text-gray-600">{description}</p>
      <Button
        variant="outlined"
        className="mt-4 w-full"
        onClick={() => {
          if (action) action();
          if (path) navigate(path);
        }}
      >
        {title}
      </Button>
    </div>
  );
};
