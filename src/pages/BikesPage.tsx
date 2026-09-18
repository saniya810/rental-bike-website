import React, { useState, useMemo } from 'react';
import { Bike } from '../types.js';
import { BikeCard } from '../components/BikeCard.js';
import { SearchFilterBar, FilterState } from '../components/SearchFilterBar.js';
import { Bike as BikeIcon, RotateCcw } from 'lucide-react';

interface BikesPageProps {
  bikes: Bike[];
  onSelectBike: (bike: Bike) => void;
  onBookBike: (bike: Bike) => void;
}

const INITIAL_FILTERS: FilterState = {
  search: '',
  vehicleType: 'All',
  fuelPowerType: 'All',
  category: 'All',
  brand: 'All',
  availability: 'All',
  maxPrice: 600,
  sort: 'featured',
};

export const BikesPage: React.FC<BikesPageProps> = ({
  bikes,
  onSelectBike,
  onBookBike,
}) => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Extract unique brands from bikes data
  const availableBrands = useMemo(() => {
    const set = new Set(bikes.map((b) => b.brand));
    return Array.from(set).sort();
  }, [bikes]);

  // Client-side instant filtering & sorting
  const filteredBikes = useMemo(() => {
    return bikes
      .filter((bike) => {
        // Vehicle type (All / motorcycle / bike)
        if (filters.vehicleType && filters.vehicleType !== 'All') {
          const vType = bike.vehicleType || (bike.specifications?.engineCc ? 'motorcycle' : 'bike');
          if (vType !== filters.vehicleType) {
            return false;
          }
        }

        // Fuel / Power Type (All / Petrol / Diesel / Electric / Hybrid)
        if (filters.fuelPowerType && filters.fuelPowerType !== 'All') {
          const fType =
            bike.fuelPowerType ||
            (bike.specifications?.fuelType?.toLowerCase().includes('petrol')
              ? 'Petrol'
              : bike.bikeType.toLowerCase().includes('electric')
              ? 'Electric'
              : 'Petrol');
          if (fType.toLowerCase() !== filters.fuelPowerType.toLowerCase()) {
            return false;
          }
        }

        // Category
        if (filters.category !== 'All') {
          if (bike.bikeType.toLowerCase() !== filters.category.toLowerCase()) {
            return false;
          }
        }

        // Brand
        if (filters.brand !== 'All') {
          if (bike.brand.toLowerCase() !== filters.brand.toLowerCase()) {
            return false;
          }
        }

        // Availability
        if (filters.availability !== 'All') {
          if (bike.availability !== filters.availability) {
            return false;
          }
        }

        // Max price
        if (bike.hourlyPrice > filters.maxPrice) {
          return false;
        }

        // Search query
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const match =
            bike.name.toLowerCase().includes(q) ||
            bike.model.toLowerCase().includes(q) ||
            bike.brand.toLowerCase().includes(q) ||
            bike.bikeType.toLowerCase().includes(q) ||
            bike.location.toLowerCase().includes(q) ||
            (bike.fuelPowerType && bike.fuelPowerType.toLowerCase().includes(q)) ||
            (bike.specifications.gears && bike.specifications.gears.toLowerCase().includes(q)) ||
            (bike.specifications.engineCc && `${bike.specifications.engineCc}`.includes(q)) ||
            (bike.specifications.powerBhp && bike.specifications.powerBhp.toLowerCase().includes(q));
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'price-low') return a.hourlyPrice - b.hourlyPrice;
        if (filters.sort === 'price-high') return b.hourlyPrice - a.hourlyPrice;
        if (filters.sort === 'rating') return b.rating - a.rating;
        if (filters.sort === 'name') return a.name.localeCompare(b.name);
        return 0; // default featured
      });
  }, [bikes, filters]);

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore Motorcycles & 2-Wheelers Fleet
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Discover genuine motorcycles (Royal Enfield, Yamaha, KTM, Bajaj) and premium bicycles.
          Check specifications, live hub availability, and book instantly with verified INR pricing.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <SearchFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        availableBrands={availableBrands}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredBikes.length}</strong> of{' '}
          {bikes.length} bikes in fleet
        </span>
        {filters.category !== 'All' && (
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Filter: {filters.category}
          </span>
        )}
      </div>

      {/* Bikes Grid */}
      {filteredBikes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBikes.map((bike) => (
            <BikeCard
              key={bike.id}
              bike={bike}
              onSelect={onSelectBike}
              onBookNow={onBookBike}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BikeIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No bikes match your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your search terms, broadening the category, or raising the max hourly
              rate limit.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
