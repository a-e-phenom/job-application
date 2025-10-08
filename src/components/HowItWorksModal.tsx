import React from 'react';
import { X } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">How the app works</h2>
            <p className="text-gray-600 text-sm mt-1">A quick guide for using this app to create job application prototypes efficiently</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* The Modules Page */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-sm mr-2">🧩</span>
              The Modules Page
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>The Modules page contains templates for the main modules used in prototypes (Candidate details, Assessments, Interview Scheduling, etc.).</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Each template includes predefined elements and structure to keep designs consistent.</span>
              </li>
            </ul>
          </div>

          {/* Using Existing Templates */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-sm mr-2">🧱</span>
              Using Existing Templates
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Whenever possible, use the existing templates rather than editing or recreating them.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>This keeps your prototypes aligned with the global module standards.</span>
              </li>
            </ul>
          </div>

          {/* Creating New Templates */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-sm mr-2">⚙️</span>
              Creating New Templates
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>If you need something unique, you can build a new template instead of changing the originals.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>New templates will automatically appear in the Modules list for future use.</span>
              </li>
            </ul>
          </div>

          {/* Adding Modules to Prototypes */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-sm mr-2">🚀</span>
              Adding Modules to Prototypes
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>You can add existing modules when creating a flow.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>This lets you quickly assemble functional layouts without starting from scratch.</span>
              </li>
            </ul>
          </div>

          {/* Editing Modules in a Prototype */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-sm mr-2">✏️</span>
              Editing Modules in a Prototype
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>To customize module content only within your flow, click the three-dots icon inside the flow.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>This ensures that global templates remain unchanged while you adjust local content.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Got Questions Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-md font-medium text-gray-900 mb-0">Got questions or feature requests?</h3>
              <p className="text-gray-700 text-sm">
                Feel free to reach out on Slack.
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <img 
                src="/slack.png" 
                alt="Slack logo" 
                className="w-auto h-9 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
