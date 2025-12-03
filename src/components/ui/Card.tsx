import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
