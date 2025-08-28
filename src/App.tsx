import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FlowHomepage from './components/FlowHomepage';
import ApplicationFlow from './components/ApplicationFlow';
import ModuleTemplatesPage from './components/ModuleTemplatesPage';
import CreateFlowPage from './components/CreateFlowPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<FlowHomepage />} />
        
        {/* Module templates */}
        <Route path="/modules" element={<ModuleTemplatesPage />} />
        
        {/* Create new flow */}
        <Route path="/create" element={<CreateFlowPage />} />
        
        {/* Edit existing flow */}
        <Route path="/edit/:slug" element={<EditFlowRoute />} />
        
        {/* View specific flow by slug */}
        <Route path="/flow/:slug" element={<FlowRoute />} />
        
        {/* Redirect any unknown routes to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Route component for editing flows
function EditFlowRoute() {
  return <CreateFlowPage />;
}

// Route component for viewing flows
function FlowRoute() {
  return <ApplicationFlow />;
}

export default App;