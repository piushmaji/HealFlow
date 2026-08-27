import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { QuantityCounter } from './QuantityCounter';

export const MedicineCard = ({
  title = 'Nasal spray 15 ml',
  category = 'Decongestant',
  price = 10,
  imageUrl = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
  onAddToCart,
  className = '',
}) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <Card className={`p-4 bg-white border-[#CEDEFF] shadow-card font-poppins max-w-xs ${className}`}>
      <div className="bg-[#F2F5FF] rounded-2xl p-3 mb-3 flex items-center justify-center border border-[#CEDEFF] relative">
        <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white text-[#5B81FA] border border-[#CEDEFF]">
          {category}
        </span>
        <img
          src={imageUrl}
          alt={title}
          className="h-28 object-contain rounded-lg hover:scale-105 transition-transform"
        />
      </div>

      <div className="space-y-1 mb-3">
        <h4 className="text-xs font-bold text-[#1F1F1F] font-heading">{title}</h4>
        <p className="text-sm font-extrabold text-[#5B81FA]">${price}</p>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <QuantityCounter value={quantity} onChange={setQuantity} />
        <Button
          variant="primary"
          size="sm"
          pill
          onClick={() => onAddToCart && onAddToCart({ title, price, quantity })}
          className="px-3.5 py-1.5 text-xs font-bold shadow-material-1 shrink-0"
        >
          Add to cart
        </Button>
      </div>
    </Card>
  );
};
