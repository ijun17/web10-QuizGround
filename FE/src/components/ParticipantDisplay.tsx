const samplePalyer = Array(100)
  .fill(null)
  .map((_, i) => ({ id: i, name: 'user' + i }));

const ParticipantDisplay = () => {
  return (
    <div className="component-default h-[100%]">
      <div className="border-b border-default center h-[2.5rem]">참가자</div>
      <div className="p-3 h-[calc(100%-2.5rem)] overflow-y-scroll">
        {samplePalyer.map((e, i) => (
          <div className="flex justify-between mt-2 pb-2 border-b border-default" key={e.id}>
            <div className="font-bold">{i + 1 + '. ' + e.name}</div>
            <button className="bg-main rounded-lg text-white w-8 h-6 text-r">강퇴</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantDisplay;
