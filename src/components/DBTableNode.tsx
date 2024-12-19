import { Handle, Position } from 'reactflow';
import { useState } from 'react';

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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleDoubleClick = (field: string, value: string) => {
    setEditingField(field);
    setEditingValue(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (editingField) {
      if (editingField === 'tableName') {
        data.label = editingValue;
      } else {
        const fieldIndex = data.fields.findIndex(f => f.name === editingField);
        if (fieldIndex !== -1) {
          data.fields[fieldIndex].name = editingValue;
        }
      }
    }
    setEditingField(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div className="db-table-node">
      <Handle type="target" position={Position.Top} />
      {editingField === 'tableName' ? (
        <input
          value={editingValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          autoFocus
        />
      ) : (
        <div 
          className="table-name"
          onDoubleClick={() => handleDoubleClick('tableName', data.label)}
        >
          {data.label}
        </div>
      )}
      <div className="table-fields">
        {data.fields.map((field, i) => (
          <div key={i} className="field">
            {editingField === field.name ? (
              <input
                value={editingValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyPress={handleKeyPress}
                autoFocus
              />
            ) : (
              <span onDoubleClick={() => handleDoubleClick(field.name, field.name)}>
                {field.name}
              </span>
            )}
            <span className="field-type">{field.type}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default DBTableNode; 