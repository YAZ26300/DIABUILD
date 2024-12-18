import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

const Mermaid = ({ chart }: MermaidProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
    });
    
    if (mermaidRef.current) {
      mermaidRef.current.innerHTML = chart;
      mermaid.contentLoaded();
    }
  }, [chart]);

  return <div ref={mermaidRef} className="mermaid" />;
};

export default Mermaid; 