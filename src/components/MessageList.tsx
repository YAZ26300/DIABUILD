import { useEffect, useRef } from 'react';
import Mermaid from './Mermaid';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
        >
          <div className="message-content">{message.content}</div>
          {message.diagram && (
            <div className="diagram-container">
              <Mermaid chart={message.diagram} />
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList; 