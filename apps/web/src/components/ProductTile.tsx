import React from 'react';

interface ProductTileProps {
  title: string;
  subtitle?: string;
  bgColor?: string;
  placeholderHeight?: string;
  linkText?: string;
  linkHref?: string;
  className?: string;
}

export const ProductTile: React.FC<ProductTileProps> = ({
  title,
  subtitle,
  bgColor = 'bg-white',
  placeholderHeight = 'h-24',
  linkText = 'Shop now',
  linkHref = '#',
  className = '',
}) => (
  <div className={`${bgColor} rounded-xl p-6 flex flex-col justify-between ${className}`}>
    <div className={`bg-white rounded-lg ${placeholderHeight} mb-4`}></div>
    <div className="text-lg font-bold text-[#0F367A] mb-2">{title}</div>
    {subtitle && <div className="text-base text-[#222] mb-2">{subtitle}</div>}
    <a href={linkHref} className="text-blue-700 font-semibold hover:underline">{linkText}</a>
  </div>
); 