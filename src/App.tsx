import { useState, useCallback } from 'react';
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
  applyEdgeChanges
} from 'reactflow';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import { Message } from './types';
import { generateDiagram } from './services/ollama';
import 'reactflow/dist/style.css';
import './App.css';
import DBTableNode from './components/DBTableNode';
import dagre from 'dagre';

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
      const layoutedElements = getLayoutedElements(
        diagramData.nodes,
        diagramData.edges
      );
      setNodes(layoutedElements.nodes);
      setEdges(layoutedElements.edges);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "J'ai généré le diagramme selon votre description.",
        role: 'assistant',
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Désolé, une erreur s'est produite lors de la génération du diagramme.",
        role: 'assistant'
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <div className="chat-section">
        <h1>IA Diagram Chat</h1>
        <MessageList messages={messages} />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
      <div className="diagram-section">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App; 