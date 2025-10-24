import React from 'react';
import './PolaroidCard.css';

type PolaroidCardProps = {
  image?: string;
  text: string;
  tilt?: number;
  accent?: string;
  variant?: 'default' | 'mystery';
  href?: string;
};

const PolaroidCard: React.FC<PolaroidCardProps> = ({ 
  image, 
  text, 
  tilt = 0, 
  accent = '#8b5cf6', 
  variant = 'default', 
  href 
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
      <div className="polaroid-caption">{text}</div>
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