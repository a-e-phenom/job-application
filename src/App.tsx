import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FlowHomepage from './components/FlowHomepage';
import ApplicationFlow from './components/ApplicationFlow';
import ModuleTemplatesPage from './components/ModuleTemplatesPage';
import CreateFlowPage from './components/CreateFlowPage';
import FolderView from './components/FolderView';
import Login from './components/Login';
import CompletionPage from './components/CompletionPage';
import ActivityLog from './components/ActivityLog';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const authenticated = localStorage.getItem('authenticated') === 'true';
    setIsAuthenticated(authenticated);
    setIsChecking(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path="/flow/:slug" element={<FlowRoute />} />
        <Route path="/complete" element={<CompletionPage />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/" element={
          <ProtectedRoute>
            <FlowHomepage />
          </ProtectedRoute>
        } />
        
        <Route path="/folder/:folderId" element={
          <ProtectedRoute>
            <FolderView />
          </ProtectedRoute>
        } />
        
        <Route path="/modules" element={
          <ProtectedRoute>
            <ModuleTemplatesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/create" element={
          <ProtectedRoute>
            <CreateFlowPage />
          </ProtectedRoute>
        } />
        
        <Route path="/edit/:slug" element={
          <ProtectedRoute>
            <EditFlowRoute />
          </ProtectedRoute>
        } />
        
        <Route path="/activitylog" element={
          <ProtectedRoute>
            <ActivityLog />
          </ProtectedRoute>
        } />
        
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