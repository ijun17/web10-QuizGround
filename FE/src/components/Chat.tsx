import { socketService } from '@/api/socket';
import { useChatStore } from '@/store/useChatStore';
import { useRoomStore } from '@/store/useRoomStore';
import { useState } from 'react';

const Chat = () => {
  const gameId = useRoomStore((state) => state.gameId);
  const messages = useChatStore((state) => state.messages);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue.trim() && gameId) {
      socketService.chatMessage(gameId, inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="component-default h-[100%]">
      <div className="border-b border-default center h-[2.5rem]">메시지</div>
      <div className="p-2 h-[calc(100%-6rem)] overflow-y-scroll">
        {messages.map((e, i) => (
          <div className="break-words leading-5 mt-3" key={i}>
            <span className="font-bold mr-2">{e.playerName}</span>
            <span>{e.message}</span>
          </div>
        ))}
      </div>
      <div className="center border-t border-default h-[3.5rem] p-2">
        <form onSubmit={handleSubmit} className="w-full h-full">
          <input
            className="bg-[#0001] w-[100%] h-[100%] rounded-m p-2"
            type="text"
            placeholder="메시지"
            value={inputValue}
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
};

export default Chat;
