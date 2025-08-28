import React from 'react';
import { Calendar, Users, Settings, Edit, Trash2, MoreVertical, MoveRight, Copy, Check } from 'lucide-react';
import { ApplicationFlow } from '../types/flow';

interface FlowCardProps {
  flow: ApplicationFlow;
  onEdit: (flow: ApplicationFlow) => void;
  onDelete: (flowId: string) => void;
  onPreview: (flow: ApplicationFlow) => void;
}

export default function FlowCard({ flow, onEdit, onDelete, onPreview }: FlowCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'contact-info':
        return <Users className="w-4 h-4" />;
      case 'pre-screening':
        return <Settings className="w-4 h-4" />;
      case 'screening':
        return <Settings className="w-4 h-4" />;
      case 'interview-scheduling':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const handleCardClick = () => {
    onPreview(flow);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setShowMenu(false);
    action();
  };

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/flow/${flow.slug}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    
    setShowMenu(false);
  };

  return (
  <div 
    onClick={handleCardClick}
    className="bg-white rounded-xl border border-gray-200 py-5 pl-5 pr-4 hover:shadow-md transition-shadow duration-200 cursor-pointer relative flex flex-col justify-between min-h-[140px] border-l-4"
    style={{ borderLeftColor: flow.primaryColor || '#6366F1' }}
  >
    {/* Content container that can grow */}
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-md font-medium text-[#464F5E]">{flow.name}</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
  {/* Steps Tag */}
  <div className="relative group">
    <span className="px-2 py-0.5 text-xs rounded-md bg-indigo-50 text-gray-700 cursor-default">
      {flow.steps.length} step{flow.steps.length !== 1 ? 's' : ''}
    </span>
    {/* Popover */}
    <div className="absolute left-0 mt-1 hidden w-52 rounded-lg bg-white border border-gray-200 shadow-lg p-3 text-xs text-gray-700 group-hover:block z-20">
  <div className="space-y-1">
    {flow.steps.map((step, idx) => (
      <div key={idx} className="flex items-center gap-2">
        <MoveRight className="w-3 h-3 text-indigo-500" />
        <span>{step.name}</span>
      </div>
    ))}
  </div>
</div>
  </div>

  {/* Modules Tag */}
  <div className="relative group">
    <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-700 cursor-default">
      {flow.steps.reduce((total, step) => total + step.modules.length, 0)} module
      {flow.steps.reduce((total, step) => total + step.modules.length, 0) !== 1 ? 's' : ''}
    </span>
    {/* Popover */}
    <div className="absolute left-0 mt-1 hidden w-52 rounded-lg bg-white border border-gray-200 shadow-lg p-3 text-xs text-gray-700 group-hover:block z-20">
  <div className="space-y-1">
    {flow.steps.flatMap((step) =>
      step.modules.map((mod, idx) => (
        <div key={step.id + '-' + idx} className="flex items-center gap-2">
          <MoveRight className="w-3 h-3 text-indigo-500" />
          <span>{mod.name}</span>
        </div>
      ))
    )}
  </div>
</div>
  </div>
</div>


          <p className="text-[#637085] text-sm mb-3">{flow.description}</p>
        </div>
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={handleCopyUrl}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy URL'}</span>
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onEdit(flow))}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onDelete(flow.id))}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Date at the bottom */}
    <div className="pt-4">
    <div className="text-xs text-[#637085]">
  {new Date(flow.updatedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}
</div>

    </div>
  </div>
);

}