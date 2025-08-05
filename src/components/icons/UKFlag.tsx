import React from 'react';

const UKFlag = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 600"
    className={className}
  >
    <rect width="1200" height="600" fill="#012169" />
    <path
      d="M0,0 L1200,600 M1200,0 L0,600"
      stroke="#FFFFFF"
      strokeWidth="100"
    />
    <path
      d="M0,0 L1200,600 M1200,0 L0,600"
      stroke="#C8102E"
      strokeWidth="60"
    />
    <path
      d="M600,0 V600 M0,300 H1200"
      stroke="#FFFFFF"
      strokeWidth="200"
    />
    <path
      d="M600,0 V600 M0,300 H1200"
      stroke="#C8102E"
      strokeWidth="120"
    />
  </svg>
);

export default UKFlag;