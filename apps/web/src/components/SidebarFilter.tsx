import React from 'react';

interface SidebarFilterProps {
  categories: string[];
  brands: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  priceRange: [number, number];
  toggleCategory: (cat: string) => void;
  toggleBrand: (brand: string) => void;
  setPriceRange: (range: [number, number]) => void;
}

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  priceRange,
  toggleCategory,
  toggleBrand,
  setPriceRange,
}) => (
  <aside className="w-64 hidden lg:block sticky top-[80px] h-[calc(100vh-80px)] bg-white border-r border-gray-200 shadow-sm p-6 overflow-y-auto walmart-scrollbar">
    <h2 className="text-xl font-extrabold mb-6 text-gray-900">Filters</h2>
    <div className="mb-8">
      <h3 className="font-bold text-base mb-3 text-gray-800">Category</h3>
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <label key={cat} className="flex items-center gap-2 text-base font-medium text-gray-900">
            <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
            {cat}
          </label>
        ))}
      </div>
    </div>
    <div className="mb-8">
      <h3 className="font-bold text-base mb-3 text-gray-800">Brand</h3>
      <div className="flex flex-col gap-2">
        {brands.map((brand) => (
          <label key={brand} className="flex items-center gap-2 text-base font-medium text-gray-900">
            <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
            {brand}
          </label>
        ))}
      </div>
    </div>
    <div className="mb-8">
      <h3 className="font-bold text-base mb-3 text-gray-800">Price</h3>
      <div className="flex items-center gap-3">
        <input
          type="number"
          className="w-20 border rounded px-2 py-1 text-base text-gray-900"
          value={priceRange[0]}
          min={0}
          max={priceRange[1]}
          onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
        />
        <span className="text-gray-700 font-semibold">-</span>
        <input
          type="number"
          className="w-20 border rounded px-2 py-1 text-base text-gray-900"
          value={priceRange[1]}
          min={priceRange[0]}
          max={10000}
          onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
        />
      </div>
    </div>
  </aside>
); 