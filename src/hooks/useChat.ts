import { useState } from 'react';
import { Message } from '../types';
import { generateDiagram } from '../services/ollama';
import { generateSQL } from '../utils/sqlGenerator';

export const useChat = (updateGraph: (nodes: any[], edges: any[]) => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sqlScript, setSqlScript] = useState('');

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
    };

    setMessages(prev => [...prev, userMessage]);

    const loadingMessage: Message = {
      id: 'loading',
      content: 'Working on it',
      role: 'assistant',
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const diagramData = await generateDiagram(content);

      if (!diagramData.nodes || diagramData.nodes.length === 0) {
        throw new Error('No nodes in diagram data');
      }

      updateGraph(diagramData.nodes, diagramData.edges);

      const sql = generateSQL(diagramData.nodes);
      setSqlScript(sql);

      const tableDescriptions = diagramData.nodes.map(node => ({
        name: node.data.label,
        description: `${node.data.purpose || 'Stores and manages'} ${node.data.label.toLowerCase()} data.\n\n` +
          `Purpose: ${node.data.purpose || 'Manages core data for ' + node.data.label}\n` +
          `Columns: ${node.data.fields.map(f =>
            `${f.name}${f.isPrimary ? ' (Primary Key)' : ''}${f.isForeign ? ' (Foreign Key)' : ''}`
            + (f.description ? ` - ${f.description}` : '')
          ).join(', ')}`
      }));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: diagramData.description ||
          `The ${content.toLowerCase()} schema has been created with the following structure:`,
        role: 'assistant',
        sql: sql,
        tables: tableDescriptions
      };

      setMessages(prev => {
        const filteredMessages = prev.filter(m => m.id !== 'loading');
        return [...filteredMessages, assistantMessage];
      });
    } catch (error) {
      console.error('Error generating diagram:', error);
      setMessages(prev => {
        const filteredMessages = prev.filter(m => m.id !== 'loading');
        return [...filteredMessages, {
          id: (Date.now() + 1).toString(),
          content: "Erreur lors de la génération du diagramme. Veuillez réessayer.",
          role: 'assistant'
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sqlScript,
    setSqlScript,
    handleSendMessage
  };
}; 