import { useEffect } from 'react';
import { Text, Box, Flex } from '@radix-ui/themes';
import * as Accordion from '@radix-ui/react-accordion';
import { Message } from '../types';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-sql';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

const ChevronIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    style={{
      transition: 'transform 0.2s'
    }}
  >
    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  const formatSQLContent = (content: string) => {
    if (content.toLowerCase().includes('create table')) {
      return (
        <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
          <pre className="p-4 m-0 font-mono text-sm leading-relaxed">
            <code className="language-sql text-[#D4D4D4]">
              {content}
            </code>
          </pre>
        </div>
      );
    }

    const isPrompt = content.includes('The main tables needed for');
    if (isPrompt) {
      const tables = content.split(/[0-9]+\.\s+/).filter(Boolean);
      return (
        <div className="space-y-2">
          <Text size="2" className="text-[#D4D4D4] leading-6 mb-2">
            {tables[0]}
          </Text>
          <ul className="list-none space-y-1">
            {tables.slice(1).map((table, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <Text size="2" className="text-[#D4D4D4]">
                  {table.trim()}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <Text 
        size="2" 
        className="text-[#D4D4D4] leading-6"
      >
        {content}
      </Text>
    );
  };

  return (
    <Box className="message-list p-4">
      {messages.map((message) => (
        <Box 
          key={message.id}
          className={`
            rounded-xl p-4 mb-4
            ${message.role === 'user' ? 'bg-white/10' : 'bg-transparent'}
          `}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-1">
              <span>Working on it</span>
              <span className="flex">
                <span className="animate-[blink_1.4s_infinite] delay-[0ms]">.</span>
                <span className="animate-[blink_1.4s_infinite] delay-[200ms]">.</span>
                <span className="animate-[blink_1.4s_infinite] delay-[400ms]">.</span>
              </span>
            </div>
          ) : (
            formatSQLContent(message.content)
          )}
        </Box>
      ))}
    </Box>
  );
};

export default MessageList; 