export const downloadSQL = (sqlScript: string) => {
  if (!sqlScript) return;
  
  const blob = new Blob([sqlScript], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'database_schema.sql';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}; 