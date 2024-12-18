import { DBTableNode } from '../types';

export const generateSQL = (nodes: DBTableNode[]): string => {
  let sql = '';

  nodes.forEach(node => {
    sql += `-- Create ${node.data.label} table\n`;
    sql += `CREATE TABLE ${node.data.label} (\n`;
    
    const fields = node.data.fields.map(field => {
      let fieldDef = `  ${field.name} `;
      
      switch (field.type) {
        case 'ints':
          fieldDef += 'INTEGER';
          break;
        case 'text':
          fieldDef += 'TEXT';
          break;
        case 'bool':
          fieldDef += 'BOOLEAN';
          break;
        case 'date':
          fieldDef += 'TIMESTAMP';
          break;
        case 'float':
          fieldDef += 'DECIMAL';
          break;
        default:
          fieldDef += 'TEXT';
      }
      
      if (field.isPrimary) {
        fieldDef += ' PRIMARY KEY';
      }
      
      return fieldDef;
    });
    
    sql += fields.join(',\n');
    sql += '\n);\n\n';
  });

  return sql;
}; 