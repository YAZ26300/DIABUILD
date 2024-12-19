export const generateProjectPrompt = async (projectType: string): Promise<string> => {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral',
      prompt: `Generate a brief technical description (max 100 words) for building a ${projectType}. Include key features and main technical requirements.`,
      stream: false,
    }),
  });

  const data = await response.json();
  return data.response;
}; 