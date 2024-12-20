import { useEffect, useState } from 'react';
import './LoadingModal.css';

interface Step {
  id: number;
  label: string;
  status: 'waiting' | 'current' | 'completed' | 'error';
}

interface LoadingModalProps {
  isOpen: boolean;
  currentStep?: number;
  steps?: Step[];
}

const DEFAULT_STEPS: Step[] = [
  { id: 1, label: "SQL script preparation", status: 'waiting' },
  { id: 2, label: "Schema deployment", status: 'waiting' },
  { id: 3, label: "Completion", status: 'waiting' }
];

const LoadingModal = ({ 
  isOpen, 
  currentStep = 1,
  steps = DEFAULT_STEPS 
}: LoadingModalProps) => {
  const [activeSteps, setActiveSteps] = useState(steps);

  useEffect(() => {
    if (isOpen) {
      setActiveSteps(steps.map(step => ({
        ...step,
        status: step.id < currentStep ? 'completed' 
               : step.id === currentStep ? 'current' 
               : 'waiting'
      })));
    }
  }, [isOpen, currentStep, steps]);

  if (!isOpen) return null;

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal">
        <h2>Déploiement en cours</h2>
        <div className="steps-container">
          {activeSteps.map((step) => (
            <div key={step.id} className={`step-item ${step.status}`}>
              <div className="step-number">
                {step.status === 'completed' ? '✓' : step.id}
              </div>
              <div className="step-label">{step.label}</div>
              {step.status === 'current' && (
                <div className="step-loader" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingModal; 