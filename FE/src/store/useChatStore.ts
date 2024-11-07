import { socketService } from '@/api/socket';
import { create } from 'zustand';

type ChatStore = {
  messages: { playerName: string; message: string }[];
  addMessage: (playerName: string, message: string) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (playerName: string, message: string) => {
    set((state) => ({ messages: [...state.messages, { playerName, message }] }));
  }
}));

socketService.on('chatMessage', (data) => {
  useChatStore.getState().addMessage(data.playerName, data.message);
});
