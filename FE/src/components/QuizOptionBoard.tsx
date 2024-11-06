type Params = {
  options: string[];
};

const optionColors = [
  '#FF9AA2', // pastel red
  '#FFB3BA', // pastel pink
  '#FFDAC1', // pastel peach
  '#FFE156', // pastel yellow
  '#E2F0CB', // pastel green
  '#B5EAD7', // pastel mint
  '#C7CEEA', // pastel blue
  '#A0C4FF', // pastel light blue
  '#B9D8FF', // pastel lavender
  '#C3B3E0' // pastel purple
];

export const QuizOptionBoard = ({ options }: Params) => {
  return (
    <div className="component-default grid grid-cols-2 h-[100%] gap-4 p-4">
      {options.map((option, i) => (
        <div
          className="rounded-s flex justify-center items-center"
          key={i}
          style={{ background: optionColors[i] }}
        >
          {i + 1 + '. ' + option}
        </div>
      ))}
    </div>
  );
};
