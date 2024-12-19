import { useState, useEffect, useRef } from 'react';
import { Button, TextArea, Text, Flex, Box } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import * as pdfjsLib from 'pdfjs-dist';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sqlContent, setSqlContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTemplateClick = async (template: string) => {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `In one short sentence, list only the main tables needed for a ${template} database.`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInput(data.response);
    } catch (error) {
      console.error('Error generating prompt:', error);
      setInput(`Create a ${template} with users, messages, and core features.`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes('sql') && !file.name.endsWith('.sql')) return;

    try {
      const text = await file.text();
      setSelectedFile(file);
      setSqlContent(text);
    } catch (error) {
      console.error('Error processing SQL file:', error);
      setSelectedFile(null);
      setSqlContent('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (sqlContent) {
      onSend(sqlContent);
      setSelectedFile(null);
      setSqlContent('');
    } else if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleAttachmentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
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
            onClick={() => handleTemplateClick(template)}
            disabled={isLoading}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--gray-11)',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            {template}
          </Button>
        ))}
      </Flex>

      <form onSubmit={handleSubmit}>
        <Box position="relative">
          {selectedFile && (
            <Flex 
              align="center" 
              gap="2"
              className="absolute top-3 left-3 w-[150px] z-10 bg-[rgba(255,255,255,0.05)] rounded-md px-2 py-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <Text size="1" className="truncate flex-1">
                {selectedFile.name}
              </Text>
              <Button 
                variant="ghost" 
                size="1"
                onClick={() => setSelectedFile(null)}
                className="p-0 h-4 w-4"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </Button>
            </Flex>
          )}
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedFile ? "" : "Message AI or paste SQL"}
            style={{
              minHeight: '100px',
              backgroundColor: '#1a1a1a',
              border: '1px solid var(--gray-7)',
              borderRadius: '12px',
              padding: '16px',
              paddingLeft: selectedFile ? '170px' : '16px',
              color: 'var(--gray-11)',
              fontSize: '14px'
            }}
            disabled={isLoading}
          />
          <Flex 
            position="absolute" 
            bottom="3" 
            right="3" 
            gap="4"
            align="center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".sql"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Button 
              variant="ghost" 
              size="2"
              style={{ 
                color: 'var(--gray-11)',
                padding: '8px'
              }}
              onClick={handleAttachmentClick}
              type="button"
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
              style={{ 
                color: 'var(--gray-11)',
                padding: '8px'
              }}
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