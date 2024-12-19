import { useState, useEffect } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import MainLayout from './layouts/MainLayout';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import TabPanel from './components/TabPanel';
import { useGraph } from './hooks/useGraph';
import { generateDiagram } from './services/ollama';
import { generateSQL } from './utils/sqlGenerator';
import { downloadSQL } from './services/fileService';
import { Message } from './types';
import { NODE_TYPES, DEFAULT_EDGE_OPTIONS, FLOW_CONFIG } from './constants/flowConfig';
import 'reactflow/dist/style.css';
import './App.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-sql';
import { DropdownMenu, Button, Flex } from '@radix-ui/themes';
import { resetApplication } from './services/resetService';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import { initSupabase, deployToSupabase } from './services/supabaseService';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Notification from './components/Notification';
import LoadingModal from './components/LoadingModal';

function App() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, updateGraph } = useGraph();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diagram');
  const [sqlScript, setSqlScript] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(1);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables:', {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey
      });
      return;
    }

    try {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(supabaseClient);
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
    }
  }, []);

  const handleReset = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmReset = () => {
    resetApplication();
  };

  const handleDownloadSQL = () => {
    if (!sqlScript) return;
    
    const blob = new Blob([sqlScript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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

  const handleSupabaseDeployment = async () => {
    if (!supabase) {
      setNotification({
        message: "Error: Supabase client not initialized",
        type: 'error'
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentStep(1);

    try {
      const result = await deployToSupabase(
        sqlScript, 
        supabase,
        (step) => setDeploymentStep(step)
      );

      if (result.success) {
        setNotification({
          message: "Schema deployed successfully!",
          type: 'success'
        });
      }
    } catch (error: any) {
      console.error('Deployment error:', error);
      setNotification({
        message: error.message || "Error during deployment",
        type: 'error'
      });
    } finally {
      setTimeout(() => {
        setIsDeploying(false);
        setDeploymentStep(1);
      }, 1000);
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
        <h1 className="chat-title">IA Diagram Chat</h1>
        <MessageList messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
      <div className="content-section">
        <div className="tabs">
          <div className="tabs-left">
            <button
              className={`tab ${activeTab === 'diagram' ? 'active' : ''}`}
              onClick={() => setActiveTab('diagram')}
            >
              Diagram
            </button>
            <button
              className={`tab ${activeTab === 'migrations' ? 'active' : ''}`}
              onClick={() => sqlScript ? setActiveTab('migrations') : null}
              disabled={!sqlScript}
              style={{ 
                opacity: sqlScript ? 1 : 0.5,
                cursor: sqlScript ? 'pointer' : 'not-allowed'
              }}
            >
              Migrations
            </button>
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button 
                variant="ghost" 
                size="2"
                style={{ 
                  padding: '8px',
                  color: '#888',
                  cursor: 'pointer',
                }}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="currentColor"
                  style={{ transform: 'rotate(90deg)' }}
                >
                  <path d="M8 2a1 1 0 110-2 1 1 0 010 2zM8 9a1 1 0 110-2 1 1 0 010 2zM8 16a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={handleDownloadSQL} disabled={!sqlScript}>
                <Flex gap="2" align="center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <path d="M7 10l5 5 5-5"/>
                    <path d="M12 15V3"/>
                  </svg>
                  Download SQL
                </Flex>
              </DropdownMenu.Item>
              <DropdownMenu.Item color="red" onClick={handleReset}>
                <Flex gap="2" align="center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
                    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                  Reset All
                </Flex>
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={handleSupabaseDeployment} disabled={!sqlScript}>
                <Flex gap="2" align="center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>
                  </svg>
                  Deploy to Supabase
                </Flex>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
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
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmReset}
      />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <LoadingModal 
        isOpen={isDeploying}
        currentStep={deploymentStep}
      />
    </MainLayout>
  );
}

export default App; 