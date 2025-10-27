import React from 'react';
import './PolaroidCard.css';
import { ThumbsUp } from 'lucide-react';

type PolaroidCardProps = {
  image?: string;
  text: string;
  title: string;
  tilt?: number;
  accent?: string;
  variant?: 'default' | 'mystery';
  href?: string;
  upvotes?: number;
  onUpvote?: () => void;
};

const PolaroidCard: React.FC<PolaroidCardProps> = ({
  image,
  text,
  title,
  tilt = 0,
  accent = '#8b5cf6',
  variant = 'default',
  href,
  upvotes = 0,
  onUpvote,
}) => {
  const content = (
    <div
      className={`polaroid-card ${variant === 'mystery' ? 'polaroid-mystery' : ''}`}
      style={{
        transform: `rotate(${tilt}deg)`
      }}
      data-accent={accent}
    >
      {/* Tape effect */}
      <div className="polaroid-tape" />

      <div className="polaroid-photo">
        {variant === 'mystery' ? (
          <div className="polaroid-image polaroid-mystery-image" aria-hidden>
            <span className="polaroid-question">?</span>
            <span className="polaroid-mystery-text">Your achievement here</span>
          </div>
        ) : (
          <img src={image || ''} alt={text} className="polaroid-image" />
        )}
      </div>
      <div className="polaroid-caption">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-700 mb-2">{text}</p>
        {variant === 'default' && (
          <div className="flex items-center justify-center mt-2">
            <button 
              onClick={onUpvote}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{upvotes}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="polaroid-link" aria-label={text}>
        {content}
      </a>
    );
  }

  return content;
};
export default PolaroidCard;