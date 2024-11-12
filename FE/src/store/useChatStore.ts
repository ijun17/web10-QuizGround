import { socketService } from '@/api/socket';
import { create } from 'zustand';

type Message = {
  playerName: string;
  message: string;
  playerId: string;
  timestamp: Date;
};

type ChatStore = {
  messages: Message[];
  addMessage: (message: Message) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  }
}));

socketService.on('chatMessage', (data) => {
  useChatStore.getState().addMessage(data);
});
