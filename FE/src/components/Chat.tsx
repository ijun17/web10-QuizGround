import { socketService } from '@/api/socket';
import { useEffect, useState } from 'react';

const sampleChat = Array(100)
  .fill(null)
  .map((_, i) => ({ name: 'user' + i, message: 'messagemessagemessagemessagemessagemessage' }));

const Chat = () => {
  const [messages, setMessages] = useState<Array<{ name: string; message: string }>>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setMessages(sampleChat); //TODO 나중에 고쳐야 함
    // 서버에서 메시지를 받을 때
    // socket.on('chat message', (message) => {
    //   setMessages((prevMessages) => [...prevMessages, message]);
    // });
    // return () => {
    //   socket.off('chat message');
    // };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue.trim()) {
      socketService.chatMessage('1234', inputValue);
      setInputValue('');
    }
  };
  return (
    <div className="component-default h-[100%]">
      <div className="border-b border-default center h-[2.5rem]">메시지</div>
      <div className="p-2 h-[calc(100%-6rem)] overflow-y-scroll">
        {messages.map((e, i) => (
          <div className="break-words leading-5 mt-3" key={i}>
            <span className="font-bold mr-2">{e.name}</span>
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
