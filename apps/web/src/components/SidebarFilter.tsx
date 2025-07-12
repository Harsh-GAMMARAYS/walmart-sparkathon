import React from 'react';

interface SidebarFilterProps {
  departments: string[];
  categories: string[];
  brands: string[];
  selectedDepartments: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  priceRange: [number, number];
  toggleDepartment: (dept: string) => void;
  toggleCategory: (cat: string) => void;
  toggleBrand: (brand: string) => void;
  setPriceRange: (range: [number, number]) => void;
}

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  departments,
  categories,
  brands,
  selectedDepartments,
  selectedCategories,
  selectedBrands,
  priceRange,
  toggleDepartment,
  toggleCategory,
  toggleBrand,
  setPriceRange,
}) => (
  <aside className="w-64 hidden lg:block sticky top-[80px] h-[calc(100vh-80px)] bg-white border-r border-gray-200 shadow-sm p-6 overflow-y-auto">
    <h2 className="text-xl font-extrabold mb-6 text-gray-900">Filters</h2>
    
    {/* Departments Section */}
    <div className="mb-8">
      <h3 className="font-bold text-base mb-3 text-gray-800 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        Departments
      </h3>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {departments.map((dept) => (
          <label key={dept} className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors">
            <input 
              type="checkbox" 
              checked={selectedDepartments.includes(dept)} 
              onChange={() => toggleDepartment(dept)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="truncate">{dept}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Categories Section */}
    <div className="mb-8">
      <h3 className="font-bold text-base mb-3 text-gray-800">Category</h3>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {categories.map((cat) => (
          <label key={cat} className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors">
            <input 
              type="checkbox" 
              checked={selectedCategories.includes(cat)} 
              onChange={() => toggleCategory(cat)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="truncate">{cat}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Brands Section */}
    <div className="mb-8">
      <h3 className="font-bold text-base mb-3 text-gray-800">Brand</h3>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {brands.map((brand) => (
          <label key={brand} className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors">
            <input 
              type="checkbox" 
              checked={selectedBrands.includes(brand)} 
              onChange={() => toggleBrand(brand)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="truncate">{brand}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Price Section */}
    <div className="mb-8">
      <h3 className="font-bold text-base mb-3 text-gray-800">Price Range</h3>
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Min</label>
          <input
            type="number"
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={priceRange[0]}
            min={0}
            max={priceRange[1]}
            onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
          />
        </div>
        <span className="text-gray-700 font-semibold mt-4">-</span>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Max</label>
          <input
            type="number"
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={priceRange[1]}
            min={priceRange[0]}
            max={10000}
            onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
          />
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        ${priceRange[0]} - ${priceRange[1]}
      </div>
    </div>
  </aside>
); 