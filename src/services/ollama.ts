interface DBTableNode {
  id: string;
  type: 'dbTable';
  data: {
    label: string;
    fields: Array<{
      name: string;
      type: string;
      isPrimary?: boolean;
      isForeign?: boolean;
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
        prompt: `Create a detailed database schema as JSON for React Flow.
                Context: ${prompt}

                Rules for table structure:
                1. Each table must have:
                   - Primary key 'id' of type 'ints'
                   - Relevant fields with proper types (ints, text, bool, date)
                   - Foreign keys when referencing other tables
                2. Use clear naming conventions:
                   - Table names in plural (users, orders, etc.)
                   - Field names in snake_case
                   - Foreign keys as table_name_id

                Rules for layout:
                1. Position tables in a logical flow:
                   - Main tables at top (y: 0-200)
                   - Related tables below (y: 250+)
                   - Space horizontally by 300px
                2. Connections must show actual relationships:
                   - Source: table with foreign key
                   - Target: referenced table
                   - Use animated edges for visibility

                Respond only with valid JSON matching this structure:
                {
                  "nodes": [{
                    "id": string,
                    "type": "dbTable",
                    "data": {
                      "label": string,
                      "fields": [{
                        "name": string,
                        "type": string,
                        "isPrimary": boolean,
                        "isForeign": boolean
                      }]
                    },
                    "position": { "x": number, "y": number }
                  }],
                  "edges": [{
                    "id": string,
                    "source": string,
                    "target": string,
                    "type": "smoothstep",
                    "animated": true
                  }]
                }`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate diagram');
    }

    const data = await response.json();
    console.log('AI Response:', data.response); // Pour le debug

    try {
      // Cherche le premier { et le dernier } pour extraire le JSON
      const jsonStr = data.response.substring(
        data.response.indexOf('{'),
        data.response.lastIndexOf('}') + 1
      );
      const diagramData = JSON.parse(jsonStr);

      // Validation basique
      if (!diagramData.nodes || !diagramData.edges) {
        throw new Error('Invalid diagram structure');
      }

      return diagramData;
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Retourner un diagramme vide en cas d'erreur
      return {
        nodes: [
          {
            id: '1',
            type: 'dbTable',
            data: {
              label: 'Error: Invalid AI Response',
              fields: []
            },
            position: { x: 400, y: 0 }
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