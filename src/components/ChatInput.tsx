import { useState } from 'react';
import { Button, TextArea, Text, Flex, Box } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const PROMPT_TEMPLATES = [
  "A Slack clone",
  "Document database",
  "Todo list"
];

const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <Box p="4">
      <Box mb="4">
        <Text size="6" weight="bold" mb="1" style={{ color: 'white' }}>
          What would you like to create?
        </Text>
        <Text size="2" style={{ color: 'var(--gray-11)' }}>
          Describe what you want to build and add any specific database requirements.
        </Text>
      </Box>

      <Flex wrap="wrap" gap="2" mb="4">
        {PROMPT_TEMPLATES.map((template, index) => (
          <Button
            key={index}
            variant="surface"
            onClick={() => setInput(template)}
            disabled={isLoading}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--gray-11)',
              borderRadius: '9999px'
            }}
          >
            {template}
          </Button>
        ))}
      </Flex>

      <form onSubmit={handleSubmit}>
        <Box position="relative">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message AI or write SQL"
            style={{
              minHeight: '100px',
              backgroundColor: '#1a1a1a',
              border: '1px solid var(--gray-7)',
              borderRadius: '12px',
              padding: '16px',
              color: 'var(--gray-11)',
              fontSize: '14px'
            }}
            disabled={isLoading}
          />
          <Flex 
            position="absolute" 
            bottom="3" 
            right="3" 
            gap="2"
            align="center"
          >
            <Button 
              variant="ghost" 
              size="2"
              style={{ color: 'var(--gray-11)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              variant="ghost"
              size="2"
              style={{ color: 'var(--gray-11)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </Button>
          </Flex>
        </Box>
      </form>
    </Box>
  );
};

export default ChatInput; 