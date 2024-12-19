import { ConnectionMode, ConnectionLineType, MarkerType } from 'reactflow';
import DBTableNode from '../components/DBTableNode';

export const NODE_TYPES = {
  dbTable: DBTableNode
};

export const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep',
  animated: true,
  style: { 
    stroke: '#666',
    strokeWidth: 2,
    opacity: 0.8
  },
  labelStyle: { display: 'none' },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#666'
  }
};

export const FLOW_CONFIG = {
  connectionMode: ConnectionMode.Loose,
  connectionLineType: ConnectionLineType.SmoothStep,
}; 