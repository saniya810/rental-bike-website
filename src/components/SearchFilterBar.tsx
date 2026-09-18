import React from 'react';
import { Search, RotateCcw, Check, Bike as BikeIcon } from 'lucide-react';
import { formatINR } from '../utils/currency.js';

export interface FilterState {
  search: string;
  vehicleType: string;
  category: string;
  brand: string;
  availability: string;
  maxPrice: number;
  sort: string;
}

interface SearchFilterBarProps {
  filters: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  availableBrands: string[];
}

const CATEGORIES: { label: string; value: string; vehicleType?: 'bike' | 'motorcycle' }[] = [
  { label: 'All Fleet', value: 'All' },
  { label: 'Cruiser / Modern Classic', value: 'Cruiser / Modern Classic', vehicleType: 'motorcycle' },
  { label: 'Naked Streetfighter', value: 'Naked Streetfighter', vehicleType: 'motorcycle' },
  { label: 'Supersport / Sports Bike', value: 'Supersport / Sports Bike', vehicleType: 'motorcycle' },
  { label: 'Commuter 2-Wheeler', value: 'Commuter 2-Wheeler', vehicleType: 'motorcycle' },
  { label: 'Adventure / Tourer', value: 'Adventure / Tourer', vehicleType: 'motorcycle' },
  { label: 'Electric / E-Bike', value: 'Electric / E-Bike', vehicleType: 'bike' },
  { label: 'Mountain Bike', value: 'Mountain', vehicleType: 'bike' },
  { label: 'City Commuter', value: 'City / Commuter', vehicleType: 'bike' },
  { label: 'Road / Racing Bike', value: 'Road / Racing', vehicleType: 'bike' },
  { label: 'Hybrid Bike', value: 'Hybrid', vehicleType: 'bike' },
];

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  availableBrands,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Top Search Input & Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="bike-search-input"
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search motorcycles, bikes, CC, brand, or hub (e.g. 'Royal Enfield', 'Yamaha', 'Classic 350')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-900 bg-slate-50/50"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>

        {/* Brand Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="bike-brand-filter"
            value={filters.brand}
            onChange={(e) => onChange({ brand: e.target.value })}
            className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Brands</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            id="bike-availability-filter"
            value={filters.availability}
            onChange={(e) => onChange({ availability: e.target.value })}
            className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available Only</option>
            <option value="Rented">Currently Rented</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          {/* Sort Selector */}
          <select
            id="bike-sort-selector"
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value })}
            className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="featured">Sort: Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Alphabetical</option>
          </select>

          {/* Reset Filters */}
          <button
            id="reset-filters-btn"
            onClick={onReset}
            title="Reset All Filters"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vehicle Type Switcher Tabs (All, Motorcycles, Bikes) */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500 mr-1">Vehicle Type:</span>
        <div className="inline-flex p-1 bg-slate-100 rounded-xl">
          <button
            id="filter-type-all"
            onClick={() => onChange({ vehicleType: 'All', category: 'All' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.vehicleType === 'All'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 2-Wheelers
          </button>
          <button
            id="filter-type-motorcycles"
            onClick={() => onChange({ vehicleType: 'motorcycle', category: 'All' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filters.vehicleType === 'motorcycle'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏍️ Motorcycles</span>
          </button>
          <button
            id="filter-type-bikes"
            onClick={() => onChange({ vehicleType: 'bike', category: 'All' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filters.vehicleType === 'bike'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BikeIcon className="w-3.5 h-3.5" />
            <span>Bicycles & E-Bikes</span>
          </button>
        </div>
      </div>

      {/* Category Sub-Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORIES.filter((cat) => {
          if (filters.vehicleType === 'motorcycle') return cat.value === 'All' || cat.vehicleType === 'motorcycle';
          if (filters.vehicleType === 'bike') return cat.value === 'All' || cat.vehicleType === 'bike';
          return true;
        }).map((cat) => {
          const isSelected = filters.category === cat.value;
          return (
            <button
              key={cat.value}
              id={`filter-category-${cat.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onChange({ category: cat.value })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Max Price Slider */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-700">Max Hourly Rate:</span>
          <input
            id="price-range-slider"
            type="range"
            min="50"
            max="600"
            step="25"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
            className="accent-emerald-600 cursor-pointer w-36 sm:w-48"
          />
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
            Up to {formatINR(filters.maxPrice)}/hr
          </span>
        </div>

        <span className="text-slate-400">
          Showing verified fleet availability across Indian hubs
        </span>
      </div>
    </div>
  );
};
