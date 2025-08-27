import React, { useState } from 'react';
import FlowHomepage from './components/FlowHomepage';
import ApplicationFlow from './components/ApplicationFlow';
import ModuleTemplatesPage from './components/ModuleTemplatesPage';
import CreateFlowPage from './components/CreateFlowPage';
import { ApplicationFlow as FlowType } from './types/flow';

function App() {
  const [currentView, setCurrentView] = useState<'homepage' | 'flow' | 'module-templates' | 'create-flow' | 'edit-flow'>('homepage');
  const [selectedFlow, setSelectedFlow] = useState<FlowType | null>(null);

  const handlePreviewFlow = (flow: FlowType) => {
    setSelectedFlow(flow);
    setCurrentView('flow');
  };

  const handleCreateFlow = () => {
    setSelectedFlow(null);
    setCurrentView('create-flow');
  };

  const handleFlowCreated = (flow: FlowType) => {
    setSelectedFlow(flow);
    setCurrentView('flow');
  };

  const handleFlowUpdate = (updatedFlow: FlowType) => {
    setSelectedFlow(updatedFlow);
  };

  const handleEditFlow = (flow: FlowType) => {
    setSelectedFlow(flow);
    setCurrentView('edit-flow');
  };

  const handleViewModuleTemplates = () => {
    setCurrentView('module-templates');
  };

  const handleBackToHomepage = () => {
    setCurrentView('homepage');
    setSelectedFlow(null);
  };

  if (currentView === 'create-flow') {
    return (
      <CreateFlowPage 
        onBack={handleBackToHomepage}
        onFlowCreated={handleFlowCreated}
        editingFlow={null}
      />
    );
  }

  if (currentView === 'edit-flow' && selectedFlow) {
    return (
      <CreateFlowPage 
        onBack={handleBackToHomepage}
        editingFlow={selectedFlow}
      />
    );
  }

  if (currentView === 'module-templates') {
    return (
      <ModuleTemplatesPage onBack={handleBackToHomepage} />
    );
  }

  if (currentView === 'flow' && selectedFlow) {
    return (
      <ApplicationFlow 
        flow={selectedFlow} 
        onBack={handleBackToHomepage}
        onFlowUpdate={handleFlowUpdate}
      />
    );
  }

  return (
    <FlowHomepage 
      onPreviewFlow={handlePreviewFlow} 
      onCreateFlow={handleCreateFlow}
      onEditFlow={handleEditFlow}
      onViewModuleTemplates={handleViewModuleTemplates}
    />
  );
}

export default App;