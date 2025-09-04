import React from 'react';
import { Database } from '@/integrations/supabase/types';

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface MapLegendProps {
  categories: Category[];
  className?: string;
}

const MapLegend: React.FC<MapLegendProps> = ({ categories, className = "" }) => {
  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-[200px] ${className}`}>
      <h4 className="font-semibold text-sm mb-2 text-gray-800">Map Legend</h4>
      <div className="space-y-2">
        {/* User Location */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center relative">
            <span className="text-white text-xs font-bold">•</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
          </div>
          <span className="text-gray-700 font-medium">Your Location</span>
        </div>
        
        {/* Categories */}
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-2 text-xs">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
              style={{ backgroundColor: category.color }}
            >
              <span className="text-xs">{category.icon}</span>
            </div>
            <span className="text-gray-700 truncate">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;