export const resetApplication = () => {
  // Nettoyer le localStorage si vous en utilisez
  localStorage.clear();
  
  // Nettoyer la console
  console.clear();
  
  // Forcer le rechargement de la page
  window.location.reload();
}; 