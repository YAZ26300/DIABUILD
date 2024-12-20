import { useEffect, useState } from 'react';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { AuthWrapper } from './components/AuthWrapper';
import { ToolbarButtons } from './components/ToolbarButtons';
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
import { resetApplication } from './services/resetService';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import { deployToSupabase } from './services/supabaseService';
import Notification from './components/Notification';
import LoadingModal from './components/LoadingModal';
import { Background, Controls } from 'reactflow';
import { ReactFlow } from 'reactflow';

function App() {
  const { supabase, isAuthenticated, isAuthLoading, handleLogout } = useSupabaseAuth();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, updateGraph } = useGraph();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diagram');
  const [sqlScript, setSqlScript] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(1);

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
    <AuthWrapper
      isLoading={isAuthLoading}
      isAuthenticated={isAuthenticated}
      supabase={supabase}
    >
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
            <ToolbarButtons
              onDeploy={handleSupabaseDeployment}
              onDownload={handleDownloadSQL}
              onReset={handleReset}
              onLogout={handleLogout}
              sqlScript={sqlScript}
            />
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
    </AuthWrapper>
  );
}

export default App; 