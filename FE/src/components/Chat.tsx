import { socketService } from '@/api/socket';
import { useChatStore } from '@/store/useChatStore';
import { useRoomStore } from '@/store/useRoomStore';
import { Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const Chat = () => {
  const gameId = useRoomStore((state) => state.gameId);
  const messages = useChatStore((state) => state.messages);
  const [inputValue, setInputValue] = useState('');

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessage, setNewMessage] = useState(false);
  const [prevMessageCount, setPrevMessageCount] = useState(messages.length);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
      setIsAtBottom(isBottom); // 맨 아래에 있으면 true, 아니면 false
      if (isBottom) {
        setNewMessage(false);
      }
    }
  };

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
  const scrollToBottom = () => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
      setNewMessage(false);
    }
  };

  useEffect(() => {
    if (messages.length > prevMessageCount) {
      setNewMessage(true); // 새로운 메시지가 도착한 것으로 판단
      setPrevMessageCount(messages.length);
    }

    if (isAtBottom && chatBottomRef.current) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, prevMessageCount]);

  return (
    <div className="component-default h-[100%]">
      <div className="border-b border-default center h-[2.5rem]">메시지</div>
      <div
        ref={chatContainerRef}
        className="p-2 h-[calc(100%-6rem)] overflow-y-scroll"
        onScroll={handleScroll}
      >
        {messages.map((e, i) => (
          <div className="break-words leading-5 mt-3" key={i}>
            <span className="font-bold mr-2">{e.playerName}</span>
            <span>{e.message}</span>
          </div>
        ))}
        <div ref={chatBottomRef} />
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
      {newMessage && (
        <Button
          variant="contained"
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-2 rounded"
          onClick={scrollToBottom}
          style={{ zIndex: 1000 }}
        >
          {`${messages[messages.length - 1].playerName}: ${
            messages[messages.length - 1].message.length > 15
              ? messages[messages.length - 1].message.slice(0, 15) + '...'
              : messages[messages.length - 1].message
          }`}
        </Button>
      )}
    </div>
  );
};

export default Chat;
