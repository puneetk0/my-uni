
import React from 'react';
import './PolaroidCard.css';

type PolaroidCardProps = {
  image: string;
  text: string;
};

const PolaroidCard: React.FC<PolaroidCardProps> = ({ image, text }) => {
  return (
    <div className="polaroid-card">
      <img src={image} alt={text} className="polaroid-image" />
      <div className="polaroid-caption">{text}</div>
    </div>
  );
};

export default PolaroidCard;
