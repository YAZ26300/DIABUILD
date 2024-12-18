import { Handle, Position } from 'reactflow';

interface UMLClassData {
  label: string;
  attributes?: string[];
  methods?: string[];
}

interface UMLClassNodeProps {
  data: UMLClassData;
}

const UMLClassNode = ({ data }: UMLClassNodeProps) => {
  return (
    <div className="uml-class-node">
      <Handle type="target" position={Position.Top} />
      <div className="class-name">{data.label}</div>
      <div className="class-attributes">
        {data.attributes?.map((attr, i) => (
          <div key={i} className="attribute">- {attr}</div>
        ))}
      </div>
      <div className="class-methods">
        {data.methods?.map((method, i) => (
          <div key={i} className="method">+ {method}</div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default UMLClassNode; 