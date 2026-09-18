import React from 'react';
import { Heart, Trash2, ArrowRight, Bike as BikeIcon } from 'lucide-react';
import { Bike } from '../types.js';
import { useWishlistCart } from '../context/WishlistCartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { formatINR } from '../utils/currency.js';

interface WishlistPageProps {
  onNavigate: (page: string) => void;
  onSelectBike: (bike: Bike) => void;
  onBookNow: (bike: Bike) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  onNavigate,
  onSelectBike,
  onBookNow,
}) => {
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlistCart();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Sign in to view your wishlist</h2>
        <p className="text-xs text-slate-500">
          Save your favorite e-bikes, mountain bikes, and commuter models to book anytime.
        </p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Wishlist</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bikes you’ve bookmarked for upcoming adventures or daily commutes.
          </p>
        </div>

        <button
          onClick={() => onNavigate('bikes')}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          <span>Explore More Bikes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const bike = item.bike;
            if (!bike) return null;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={bike.imageUrl}
                      alt={bike.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => toggleWishlist(bike)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-600 hover:bg-white shadow"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">
                      {bike.brand}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{bike.name}</h3>
                    <p className="text-xs text-slate-500">{bike.bikeType}</p>
                    <div className="pt-2 flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-slate-900">
                        {formatINR(bike.hourlyPrice)}
                      </span>
                      <span className="text-xs text-slate-400">/hr</span>
                      <span className="text-xs text-slate-300 mx-1">•</span>
                      <span className="text-xs font-bold text-slate-700">{formatINR(bike.dailyPrice)}</span>
                      <span className="text-xs text-slate-400">/day</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectBike(bike)}
                    className="py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onBookNow(bike)}
                    className="py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Browse our fleet of motorcycles, e-bikes, and city bicycles and click the heart icon
              to save them here.
            </p>
          </div>
          <button
            onClick={() => onNavigate('bikes')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            Browse Fleet
          </button>
        </div>
      )}
    </div>
  );
};
