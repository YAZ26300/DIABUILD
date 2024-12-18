import { Handle, Position } from 'reactflow';

interface Field {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
}

interface DBTableData {
  label: string;
  fields: Field[];
}

interface DBTableNodeProps {
  data: DBTableData;
}

const DBTableNode = ({ data }: DBTableNodeProps) => {
  return (
    <div className="db-table-node">
      <Handle type="target" position={Position.Top} />
      <div className="table-name">{data.label}</div>
      <div className="table-fields">
        {data.fields.map((field, i) => (
          <div key={i} className="field">
            <span className="key-icon">
              {field.isPrimary && '🔑'}
              {field.isForeign && '🔗'}
            </span>
            <span className="field-name">{field.name}</span>
            <span className="field-type">{field.type}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default DBTableNode; 