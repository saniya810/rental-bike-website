import React from 'react';
import { Star, Zap, Heart, Eye, Gauge } from 'lucide-react';
import { Bike } from '../types.js';
import { useWishlistCart } from '../context/WishlistCartContext.js';
import { formatINR } from '../utils/currency.js';

interface BikeCardProps {
  bike: Bike;
  onSelect: (bike: Bike) => void;
  onBookNow: (bike: Bike) => void;
}

export const BikeCard: React.FC<BikeCardProps> = ({ bike, onSelect, onBookNow }) => {
  const { isInWishlist, toggleWishlist } = useWishlistCart();
  const saved = isInWishlist(bike.id);

  const getAvailabilityBadge = () => {
    switch (bike.availability) {
      case 'Available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Available Now
          </span>
        );
      case 'Rented':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Currently Rented
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            In Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  const isEbike = bike.bikeType === 'Electric / E-Bike';
  const isMotorcycle =
    bike.vehicleType === 'motorcycle' || Boolean(bike.specifications?.engineCc);

  return (
    <div
      id={`bike-card-${bike.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col"
    >
      {/* Bike Image & Overlays */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={bike.imageUrl}
          alt={`${bike.brand} ${bike.name} ${bike.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase backdrop-blur-md ${
                isMotorcycle
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'bg-slate-900/80 text-white'
              }`}
            >
              {isMotorcycle ? 'Motorcycle' : bike.bikeType}
            </span>
            {isMotorcycle && bike.specifications?.engineCc && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-900/85 text-amber-300 backdrop-blur-md">
                {bike.specifications.engineCc} cc
              </span>
            )}
          </div>
          {getAvailabilityBadge()}
        </div>

        {/* Wishlist Button Top Right */}
        <button
          id={`wishlist-btn-${bike.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(bike);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
            saved
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-white/85 text-slate-700 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {/* Station Location Pill Bottom */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 shadow-sm flex items-center gap-1 max-w-[90%] truncate">
          <span className="truncate">Hub: {bike.location}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Brand */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
              {bike.brand}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{bike.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({bike.reviewCount})</span>
            </div>
          </div>

          {/* Bike Name & Model */}
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">
            {bike.name}
          </h3>
          <p className="text-xs text-slate-500 mb-3">{bike.model}</p>

          {/* Quick Specs Pill Row */}
          <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] text-slate-600">
            {isMotorcycle ? (
              <>
                {bike.specifications.powerBhp && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">
                    {bike.specifications.powerBhp.split('@')[0].trim()}
                  </span>
                )}
                {bike.specifications.mileageKmpl && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    {bike.specifications.mileageKmpl} kmpl
                  </span>
                )}
                {bike.specifications.brakes && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 truncate max-w-[160px]">
                    {bike.specifications.brakes}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {bike.specifications.gears}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {bike.specifications.brakes}
                </span>
                {isEbike && bike.specifications.maxRangeKm && (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {bike.specifications.maxRangeKm} km range
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {bike.specifications.weightKg} kg
                </span>
              </>
            )}
          </div>
        </div>

        {/* Pricing & CTA Block */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-2xl font-extrabold text-slate-900">
                {formatINR(bike.hourlyPrice)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/hr</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-700">
                {formatINR(bike.dailyPrice)}
              </span>
              <span className="text-xs text-slate-400">/day</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`view-details-btn-${bike.id}`}
              onClick={() => onSelect(bike)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
            <button
              id={`book-now-btn-${bike.id}`}
              onClick={() => onBookNow(bike)}
              className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Book Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
