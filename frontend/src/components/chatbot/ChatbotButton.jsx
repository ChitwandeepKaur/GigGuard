import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && <ChatWindow />}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-brand text-white rounded-full shadow-2xl hover:bg-brand-light transition-all transform hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        <span className="sr-only">Toggle Chatbot</span>
      </button>
    </div>
  );
}
