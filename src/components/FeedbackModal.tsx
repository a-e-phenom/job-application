import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  primaryColor?: string;
}

export default function FeedbackModal({ isOpen, onClose, onSubmit, primaryColor = '#6366F1' }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
    onClose();
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredStar(starRating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">How did you like it?</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Feel free to give us your feedback about the screening process.
        </p>

        {/* Star Rating */}
        <div className="mb-6">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
                className="p-1 transition-colors duration-200"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredStar || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your comment..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            rating > 0
              ? 'text-white hover:opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          style={{ backgroundColor: rating > 0 ? primaryColor : undefined }}
        >
          Submit rating
        </button>
      </div>
    </div>
  );
}
