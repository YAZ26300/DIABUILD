import { useState, useRef } from 'react';
import { Button, TextArea, Text, Flex, Box } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import Notification from './Notification';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isOllamaConnected?: boolean;
}

const PROMPT_TEMPLATES = [
  "A Slack clone",
  "Document database",
  "Todo list"
];

const ChatInput = ({ onSend, isLoading, isOllamaConnected }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sqlContent, setSqlContent] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  const handleTemplateClick = async (template: string) => {
    if (!isOllamaConnected) {
      setNotification({
        message: "Veuillez connecter Ollama pour utiliser les templates",
        type: 'error'
      });
      return;
    }

    try {
      setLoadingTemplate(template);
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
      if (isOllamaConnected) {
        setInput(`Create a ${template} with users, messages, and core features.`);
      }
    } finally {
      setLoadingTemplate(null);
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

    if (!isOllamaConnected && !sqlContent) {
      setNotification({
        message: "Veuillez connecter Ollama pour envoyer des messages",
        type: 'error'
      });
      return;
    }

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

      <Flex gap="2" mb="4" direction="row">
        {PROMPT_TEMPLATES.map((template, index) => (
          <Button
            key={index}
            variant="surface"
            onClick={() => handleTemplateClick(template)}
            disabled={isLoading || loadingTemplate !== null || !isOllamaConnected}
            className={`
              bg-black/20
              text-gray-300
              border
              border-[rgb(34,255,158,0.3)]
              rounded-full
              px-3
              py-1
              h-[28px]
              flex
              items-center
              justify-center
              min-w-[85px]
              text-xs
              whitespace-nowrap
              cursor-pointer
              transition-all
              duration-300
              shadow-[0_0_5px_rgba(34,255,158,0.2)]
              hover:bg-black/30
              hover:border-[rgb(34,255,158,0.5)]
              hover:shadow-[0_0_8px_rgba(34,255,158,0.3),inset_0_0_2px_rgba(34,255,158,0.3)]
              hover:text-gray-200
              disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:hover:bg-black/20
              disabled:hover:border-[rgb(34,255,158,0.3)]
              ${!isOllamaConnected ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center justify-center gap-1.5 w-full">
              <span className="text-center">{template}</span>
              <div className="w-3 h-3 relative flex-shrink-0">
                {loadingTemplate === template ? (
                  <>
                    <div className="absolute inset-0 border-[1px] border-transparent border-t-[rgb(34,255,158)] rounded-full animate-spin" />
                    <div className="absolute inset-0 border-[1px] border-[rgb(34,255,158,0.3)] rounded-full" />
                  </>
                ) : <div className="w-3 h-3" />}
              </div>
            </div>
          </Button>
        ))}
      </Flex>

      <form onSubmit={handleSubmit}>
        <Box position="relative">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              !isOllamaConnected && !selectedFile 
                ? "Connectez Ollama pour commencer..." 
                : selectedFile 
                  ? "" 
                  : "Message AI ou collez du SQL"
            }
            className={`
              min-h-[100px] 
              bg-[#1a1a1a] 
              border 
              border-[rgb(34,255,158,0.2)] 
              rounded-xl 
              p-4 
              ${selectedFile ? 'pt-12' : 'pt-4'}
              text-[var(--gray-11)] 
              text-sm
              transition-all 
              duration-300
              shadow-[0_0_5px_rgba(34,255,158,0.1),inset_0_0_5px_rgba(34,255,158,0.1)]
              focus:outline-none 
              focus:border-[rgb(34,255,158,0.4)]
              focus:shadow-[0_0_10px_rgba(34,255,158,0.2),inset_0_0_10px_rgba(34,255,158,0.1)]
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${!isOllamaConnected && !selectedFile ? 'opacity-50' : ''}
            `}
            disabled={isLoading || (!isOllamaConnected && !selectedFile)}
          />
          
          {selectedFile && (
            <Flex 
              align="center" 
              gap="2"
              className="absolute top-3 left-3 bg-[rgba(255,255,255,0.05)] rounded-md px-2 py-1.5 w-fit"
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
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </Box>
  );
};

export default ChatInput; 