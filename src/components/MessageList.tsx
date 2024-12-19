import { useEffect } from 'react';
import { Text, Box, Flex } from '@radix-ui/themes';
import * as Accordion from '@radix-ui/react-accordion';
import { Message } from '../types';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';  // Thème sombre
import 'prismjs/components/prism-sql';       // Support SQL

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
    // Highlight all code blocks when content changes
    Prism.highlightAll();
  }, [messages]);

  return (
    <Box className="message-list" p="4">
      {messages.map((message) => (
        <Box 
          key={message.id}
          style={{
            backgroundColor: message.role === 'user' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}
        >
          <Text 
            size="2" 
            style={{ 
              color: 'var(--gray-11)',
              lineHeight: '1.6'
            }}
          >
            {message.content}
          </Text>

          {message.sql && (
            <Box 
              mt="4"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <Accordion.Root type="single" collapsible>
                <Accordion.Item value="sql">
                  <Accordion.Trigger 
                    style={{
                      all: 'unset',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--gray-11)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                  >
                    <Flex align="center" gap="2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                      </svg>
                      Executed SQL
                      <ChevronIcon />
                    </Flex>
                  </Accordion.Trigger>
                  <Accordion.Content>
                    <Box 
                      className="custom-scrollbar"
                      style={{ 
                        backgroundColor: '#1a1a1a',
                        padding: '16px',
                        borderRadius: '8px',
                      }}
                    >
                      <pre className="language-sql">
                        <code>
                          {message.sql}
                        </code>
                      </pre>
                    </Box>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            </Box>
          )}

          {message.tables && (
            <Box mt="4">
              {message.tables.map((table, index) => (
                <Flex key={table.name} gap="3" mb="3">
                  <Text 
                    size="2" 
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gray-11)',
                      flexShrink: 0
                    }}
                  >
                    {index + 1}
                  </Text>
                  <Box>
                    <Text size="2" weight="bold" style={{ color: 'white', marginBottom: '4px' }}>
                      {table.name}
                    </Text>
                    <Text size="2" style={{ color: 'var(--gray-11)', lineHeight: '1.5' }}>
                      {table.description}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Box>
          )}
        </Box>
      ))}

      {isLoading && (
        <Text 
          size="2" 
          style={{ 
            color: 'var(--gray-11)',
            fontStyle: 'italic'
          }}
        >
          Working on it...
        </Text>
      )}
    </Box>
  );
};

export default MessageList; 