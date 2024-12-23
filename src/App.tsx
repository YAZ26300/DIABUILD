import { useEffect, useState, useCallback } from 'react';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { AuthWrapper } from './components/AuthWrapper';
import { ToolbarButtons } from './components/ToolbarButtons';
import MainLayout from './layouts/MainLayout';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import TabPanel from './components/TabPanel';
import { useGraph } from './hooks/useGraph';
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
import { useChat } from './hooks/useChat';
import { checkOllamaConnection } from './utils/ollamaUtils';

function App() {
  const { supabase, isAuthenticated, isAuthLoading, handleLogout } = useSupabaseAuth();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, updateGraph } = useGraph();
  const { messages, isLoading, sqlScript, handleSendMessage } = useChat(updateGraph);
  
  const [activeTab, setActiveTab] = useState('diagram');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(1);
  const [isOllamaConnected, setIsOllamaConnected] = useState(false);

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

  const handleOllamaCheck = useCallback(async () => {
    try {
      const isConnected = await checkOllamaConnection();
      setIsOllamaConnected(isConnected);
    } catch (error) {
      console.error('Erreur lors de la vérification d\'Ollama:', error);
      setIsOllamaConnected(false);
    }
  }, []);

  const handleOllamaDisconnect = useCallback(() => {
    setIsOllamaConnected(false);
  }, []);

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
          <ChatInput 
            onSend={handleSendMessage} 
            isLoading={isLoading} 
            isOllamaConnected={isOllamaConnected}
          />
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
              onOllamaCheck={handleOllamaCheck}
              onOllamaDisconnect={handleOllamaDisconnect}
              isOllamaConnected={isOllamaConnected}
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