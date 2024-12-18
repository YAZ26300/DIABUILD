import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const PROMPT_TEMPLATES = [
  "Créer un diagramme de séquence pour un processus d'authentification",
  "Générer un diagramme de flux pour un processus de paiement",
  "Créer un diagramme de classe pour une bibliothèque",
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
    <div className="chat-input-container">
      <div className="prompt-templates">
        {PROMPT_TEMPLATES.map((template, index) => (
          <button
            key={index}
            onClick={() => setInput(template)}
            className="template-button"
            disabled={isLoading}
          >
            {template}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Décrivez le diagramme que vous souhaitez..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Génération...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
};

export default ChatInput; 