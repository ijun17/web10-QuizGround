const sampleChat = Array(100)
  .fill(null)
  .map((_, i) => ({ name: 'user' + i, message: 'messagemessagemessagemessagemessagemessage' }));

// type ChatProps = {
//   cket: Socket;

/*
const [messages, setMessages] = useState<Array<{ name: string; message: string }>>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // 서버에서 메시지를 받을 때
    socket.on('chat message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('chat message');
    };
  }, [socket]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지

    if (inputValue.trim()) {
      const newMessage = { name: 'currentUser', message: inputValue }; // 현재 사용자 이름 설정
      socket.emit('chat message', newMessage); // 메시지를 서버로 전송
      setInputValue(''); // 입력값 초기화
    }
  };
*/

const Chat = () => {
  return (
    <div className="component-default h-[100%]">
      <div className="border-b border-default center h-[2.5rem]">메시지</div>
      <div className="p-2 h-[calc(100%-6rem)] overflow-y-scroll">
        {sampleChat.map((e, i) => (
          <div className="break-words leading-5 mt-3" key={i}>
            <span className="font-bold mr-2">{e.name}</span>
            <span>{e.message}</span>
          </div>
        ))}
      </div>
      <div className="center border-t border-default h-[3.5rem] p-2">
        <input
          className="bg-[#0001] w-[100%] h-[100%] rounded-m p-2"
          type="text"
          placeholder="메시지"
        />
      </div>
    </div>
  );
};

export default Chat;
