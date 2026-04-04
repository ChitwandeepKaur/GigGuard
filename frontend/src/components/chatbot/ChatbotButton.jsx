import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function ChatbotButton() {
  return (
    <button className="fixed bottom-8 right-8 p-4 bg-brand text-white rounded-full shadow-2xl hover:bg-brand-light transition-all transform hover:scale-110 z-50">
      <MessageCircle size={24} />
      <span className="sr-only">Open Chatbot</span>
    </button>
  );
}
