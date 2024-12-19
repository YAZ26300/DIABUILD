import { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Controls, 
  Background,
  Node,
  Edge,
  Connection,
  addEdge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  ConnectionMode,
  ConnectionLineType,
} from 'reactflow';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import { Message } from './types';
import { generateDiagram, generateSQL } from './services/ollama';
import 'reactflow/dist/style.css';
import './App.css';
import DBTableNode from './components/DBTableNode';
import dagre from 'dagre';
import TabPanel from './components/TabPanel';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-sql';
import { Theme } from '@radix-ui/themes';

const nodeTypes = {
  dbTable: DBTableNode
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 300, ranksep: 200 });

  // Ajouter les nœuds
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 150 });
  });

  // Ajouter les connexions
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculer le layout
  dagre.layout(dagreGraph);

  // Appliquer les positions
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 75
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diagram');
  const [sqlScript, setSqlScript] = useState('');

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

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
      console.log('Received diagram data:', diagramData);

      if (!diagramData.nodes || diagramData.nodes.length === 0) {
        throw new Error('No nodes in diagram data');
      }

      const layoutedElements = getLayoutedElements(
        diagramData.nodes,
        diagramData.edges
      );

      setNodes(layoutedElements.nodes);
      setEdges(layoutedElements.edges);
      
      // Générer le SQL
      const sql = generateSQL(diagramData.nodes);
      setSqlScript(sql);
      
      // Créer la description des tables
      const tableDescriptions = diagramData.nodes.map(node => {
        const fields = node.data.fields.map(f => 
          `${f.name}${f.isPrimary ? ' (Primary Key)' : ''}${f.isForeign ? ' (Foreign Key)' : ''}`
          + (f.description ? ` - ${f.description}` : '')
        );
        
        return {
          name: node.data.label,
          description: `${node.data.purpose || 'Stores and manages'} ${node.data.label.toLowerCase()} data.\n\n` +
                      `Purpose: ${node.data.purpose || 'Manages core data for ' + node.data.label}\n` +
                      `Columns: ${fields.join(', ')}`
        };
      });
      
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
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Erreur lors de la génération du diagramme. Veuillez réessayer.",
        role: 'assistant'
      };
      setMessages(prev => [...prev, errorMessage]);
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
    <Theme appearance="dark" grayColor="sand" radius="large" scaling="95%">
      <div className="app-layout">
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
              nodeTypes={nodeTypes}
              fitView
              connectionMode={ConnectionMode.Loose}
              connectionLineType={ConnectionLineType.SmoothStep}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: { 
                  stroke: '#666',
                  strokeWidth: 2,
                  opacity: 0.8
                },
                labelStyle: { display: 'none' },
                markerEnd: {
                  type: 'arrowclosed',
                  color: '#666'
                }
              }}
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
      </div>
    </Theme>
  );
}

export default App; 