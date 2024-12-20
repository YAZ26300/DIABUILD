import { Node, Edge } from 'reactflow';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import TabPanel from './TabPanel';
import { NODE_TYPES, FLOW_CONFIG } from '../constants/flowConfig';
import { ToolbarButtons } from './ToolbarButtons';

interface ContentSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  sqlScript: string;
  onDeploy: () => void;
  onDownload: () => void;
  onReset: () => void;
  onLogout: () => void;
}

export const ContentSection = ({
  activeTab,
  setActiveTab,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  sqlScript,
  onDeploy,
  onDownload,
  onReset,
  onLogout,
}: ContentSectionProps) => {
  // Configuration des options par défaut pour les arêtes
  const defaultEdgeOptions = {
    style: {
      stroke: 'rgb(34, 255, 158)',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgb(34, 255, 158)',
    },
    animated: true,
  };

  return (
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
          onDeploy={onDeploy}
          onDownload={onDownload}
          onReset={onReset}
          onLogout={onLogout}
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
          defaultEdgeOptions={defaultEdgeOptions}
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
  );
}; 