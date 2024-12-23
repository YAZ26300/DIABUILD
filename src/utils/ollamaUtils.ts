export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/version', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur de connexion à Ollama');
    }

    const data = await response.json();
    return !!data.version;
  } catch (error) {
    console.error('Erreur lors de la connexion à Ollama:', error);
    return false;
  }
} 