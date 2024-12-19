interface DBTableNode {
  id: string;
  type: 'dbTable';
  data: {
    label: string;
    purpose?: string;
    fields: Array<{
      name: string;
      type: string;
      isPrimary?: boolean;
      isForeign?: boolean;
      description?: string;
    }>;
  };
  position: { x: number; y: number };
}

interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
}

interface DiagramResponse {
  description?: string;
  nodes: DBTableNode[];
  edges: DiagramEdge[];
}

export const generateDiagram = async (prompt: string): Promise<DiagramResponse> => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: `You are a database architect specialized in creating comprehensive database schemas.
                Task: Create a complete database schema for: ${prompt}

                Requirements for a COMPLETE schema:
                1. Table Structure:
                   - Every table must have:
                     * Primary key 'id' (ints)
                     * Timestamps (created_at, updated_at)
                     * All relevant fields for the domain
                     * Proper foreign keys for relationships
                   - Use appropriate field types:
                     * ints: for IDs and numbers
                     * text: for strings and descriptions
                     * bool: for flags and status
                     * date: for dates and timestamps
                     * float: for decimal numbers
                     * json: for complex data

                2. Required Tables:
                   - Main entity tables (users, products, etc.)
                   - Junction tables for many-to-many relationships
                   - Configuration and status tables
                   - At least 4-6 interconnected tables
                   - Include all necessary fields for each table

                3. Relationships:
                   - Define all foreign key relationships
                   - Include junction tables for many-to-many
                   - Ensure referential integrity

                Return ONLY a valid JSON object with this structure:
                {
                  "nodes": [
                    {
                      "id": "1",
                      "type": "dbTable",
                      "data": {
                        "label": "table_name",
                        "fields": [
                          {
                            "name": "id",
                            "type": "ints",
                            "isPrimary": true
                          },
                          {
                            "name": "foreign_key_id",
                            "type": "ints",
                            "isForeign": true
                          },
                          {
                            "name": "field_name",
                            "type": "field_type"
                          }
                        ]
                      },
                      "position": { "x": number, "y": number }
                    }
                  ],
                  "edges": [
                    {
                      "id": "e1-2",
                      "source": "1",
                      "target": "2",
                      "type": "smoothstep",
                      "animated": true
                    }
                  ]
                }

                Layout Rules:
                - Position main tables at top (y: 0-200)
                - Related tables below (y: 250+)
                - Space horizontally by 300px
                - Avoid overlapping
                - Organize for minimal edge crossing

                IMPORTANT: 
                - Generate a COMPLETE schema with ALL necessary tables and fields
                - Include ALL relevant relationships
                - Return ONLY the JSON, no explanations
                - Ensure the schema is production-ready`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate diagram');
    }

    const data = await response.json();
    console.log('Raw AI Response:', data.response);

    try {
      // Trouver et extraire le JSON de la réponse
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const diagramData = JSON.parse(jsonMatch[0]);
      console.log('Parsed diagram data:', diagramData);

      // Validation
      if (!Array.isArray(diagramData.nodes) || !Array.isArray(diagramData.edges)) {
        throw new Error('Invalid diagram structure');
      }

      // Vérifier que chaque nœud a la structure correcte
      diagramData.nodes = diagramData.nodes.map((node: any) => ({
        ...node,
        type: 'dbTable',
        data: {
          ...node.data,
          fields: Array.isArray(node.data.fields) ? node.data.fields : []
        }
      }));

      return diagramData;
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Diagramme par défaut en cas d'erreur
      return {
        nodes: [
          {
            id: '1',
            type: 'dbTable',
            data: {
              label: 'Example Table',
              fields: [
                {
                  name: 'id',
                  type: 'ints',
                  isPrimary: true
                }
              ]
            },
            position: { x: 400, y: 200 }
          }
        ],
        edges: []
      };
    }
  } catch (error) {
    console.error('Error calling Ollama:', error);
    throw error;
  }
};

export const generateSQL = (nodes: DBTableNode[]): string => {
  let sql = '';

  nodes.forEach(node => {
    sql += `-- Create ${node.data.label} table\n`;
    sql += `CREATE TABLE ${node.data.label} (\n`;
    
    const fields = node.data.fields.map((field: any) => {
      let fieldDef = `  ${field.name} `;
      
      let fieldType = '';
      switch (field.type) {
        case 'ints':
          fieldType = 'bigint';
          break;
        case 'text':
          fieldType = 'text';
          break;
        case 'bool':
          fieldType = 'boolean';
          break;
        case 'date':
          fieldType = 'date';
          break;
        case 'float':
          fieldType = 'decimal';
          break;
        default:
          fieldType = 'text';
      }
      
      if (field.isPrimary) {
        fieldDef += `${fieldType} PRIMARY KEY GENERATED ALWAYS AS IDENTITY`;
      } else if (field.isForeign) {
        fieldDef += `${fieldType} REFERENCES ${field.references} (id)`;
      } else {
        fieldDef += fieldType;
        if (field.required) {
          fieldDef += ' NOT NULL';
        }
        if (field.unique) {
          fieldDef += ' UNIQUE';
        }
        if (field.default !== undefined) {
          fieldDef += ` DEFAULT ${field.default}`;
        }
      }
      
      return fieldDef;
    });
    
    sql += fields.join(',\n');
    sql += '\n);\n\n';
  });

  return sql;
}; 