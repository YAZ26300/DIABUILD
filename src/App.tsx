import { useState, useEffect } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import { Message } from './types';
import { generateDiagram, generateSQL } from './services/ollama';
import 'reactflow/dist/style.css';
import './App.css';
import TabPanel from './components/TabPanel';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-sql';
import MainLayout from './layouts/MainLayout';
import { useGraph } from './hooks/useGraph';
import { NODE_TYPES, DEFAULT_EDGE_OPTIONS, FLOW_CONFIG } from './constants/flowConfig';

function App() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, updateGraph } = useGraph();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diagram');
  const [sqlScript, setSqlScript] = useState('');

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
    };

    setMessages(prev => [...prev, userMessage]);

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

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating diagram:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: "Erreur lors de la génération du diagramme. Veuillez réessayer.",
        role: 'assistant'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sqlScript) {
      requestAnimationFrame(() => {
        Prism.highlightAll();
      });
    }
  }, [sqlScript, activeTab]);

  return (
    <MainLayout>
      <div className="chat-section">
        <h1>IA Diagram Chat</h1>
        <MessageList messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
      <div className="content-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'diagram' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagram')}
          >
            Diagram
          </button>
          <button
            className={`tab ${activeTab === 'migrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('migrations')}
          >
            Migrations
          </button>
        </div>

        <TabPanel value="diagram" activeTab={activeTab}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={NODE_TYPES}
            fitView
            {...FLOW_CONFIG}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </TabPanel>

        <TabPanel value="migrations" activeTab={activeTab}>
          <div className="sql-panel">
            <div className="sql-header">
              <h3>SQL Migration Script</h3>
              <button onClick={() => navigator.clipboard.writeText(sqlScript)}>
                Copy to Clipboard
              </button>
            </div>
            <pre className="language-sql">
              <code>{sqlScript}</code>
            </pre>
          </div>
        </TabPanel>
      </div>
    </MainLayout>
  );
}

export default App; 