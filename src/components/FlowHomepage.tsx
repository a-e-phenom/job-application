import React, { useState } from 'react';
import { Plus, Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FlowCard from './FlowCard';
import { ApplicationFlow } from '../types/flow';
import { useFlows } from '../hooks/useFlows';

export default function FlowHomepage() {
  const { flows, loading, error, createFlow, updateFlow, deleteFlow, duplicateFlow } = useFlows();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleDeleteFlow = async (flowId: string) => {
    try {
      await deleteFlow(flowId);
    } catch (error) {
      console.error('Failed to delete flow:', error);
    }
  };

  const handlePreviewFlow = (flow: ApplicationFlow) => {
    navigate(`/flow/${flow.slug}`);
  };

  const handleCreateFlow = () => {
    navigate('/create');
  };

  const handleEditFlow = (flow: ApplicationFlow) => {
    navigate(`/edit/${flow.slug}`);
  };

  const handleDuplicateFlow = async (flow: ApplicationFlow) => {
    try {
      await duplicateFlow(flow);
    } catch (error) {
      console.error('Failed to duplicate flow:', error);
    }
  };

  const handleViewModuleTemplates = () => {
    navigate('/modules');
  };

  const filteredFlows = flows.filter(flow => {
    const matchesSearch =
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmwMiGjHLid5I4XmLxqLD-Ig5Rn0cLUVZLcA&s.png"
                alt="Phenom logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-700">Application Flows</h1>
                <p className="text-[#637085] text-sm mt-0">Create and manage your job application workflows</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
               <button
            onClick={handleViewModuleTemplates}
            className="flex items-center space-x-2 bg-white border border-gray-400 text-gray-600 px-4 py-2 rounded-[10px] hover:bg-gray-200 transition-colors duration-200"
          >
            <Settings className="w-4 h-4" />
            <span>Modules</span>
          </button>
            <button
              onClick={handleCreateFlow}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-[10px] hover:bg-indigo-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Create flow</span>
            </button>
         
          </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search */}
<div className="flex flex-col sm:flex-row gap-6 mb-6 mr-6 sm:mr-0 md:mr-8 lg:mr-6">
  <div className="relative mr-6 sm:mr-6 md:mr-6 lg:mr-6 w-full sm:w-1/1 md:w-1/2 lg:w-1/3">
    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder="Search flows..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>

</div>

        {/* Flow Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading flows...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">Error: {error}</div>
            <p className="text-gray-500">Please make sure you're connected to Supabase</p>
          </div>
        ) : (
        filteredFlows.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchTerm ? 'No flows match your criteria' : 'No flows created yet'}
            </div>
            {!searchTerm && (
              <button
                onClick={handleCreateFlow}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create your first flow
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlows.map((flow) => (
              <FlowCard
                key={flow.id}
                flow={flow}
                onEdit={handleEditFlow}
                onDelete={handleDeleteFlow}
                onPreview={handlePreviewFlow}
                onDuplicate={handleDuplicateFlow}
              />
            ))}
          </div>
        )
        )}

      </div>
    </div>
  );
}
