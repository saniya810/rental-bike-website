import React from 'react';
import { ShoppingBag, Trash2, ArrowRight, Calendar, Clock, MapPin, Bike as BikeIcon } from 'lucide-react';
import { Bike } from '../types.js';
import { useWishlistCart } from '../context/WishlistCartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { formatINR } from '../utils/currency.js';

interface CartPageProps {
  onNavigate: (page: string) => void;
  onBookNow: (bike: Bike) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate, onBookNow }) => {
  const { user } = useAuth();
  const { cart, removeFromCart } = useWishlistCart();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Sign in to view your rental cart</h2>
        <p className="text-xs text-slate-500">
          Staged reservations and selected rental plans are saved to your account.
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rental Cart</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bikes staged for checkout. Finalize your schedule and authorize your reservation.
          </p>
        </div>

        <button
          onClick={() => onNavigate('bikes')}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          <span>Continue Browsing</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {cart.length > 0 ? (
        <div className="space-y-4">
          {cart.map((item) => {
            const bike = item.bike;
            if (!bike) return null;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={bike.imageUrl}
                    alt={bike.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">
                      {bike.brand} • {bike.bikeType}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{bike.name}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>Rate: {formatINR(bike.hourlyPrice)}/hr or {formatINR(bike.dailyPrice)}/day</span>
                      <span>•</span>
                      <span>Hub: {bike.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <button
                    onClick={() => removeFromCart(bike.id)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove from cart"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => onBookNow(bike)}
                    className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Proceed to Book</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Your rental cart is empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Ready to ride? Explore available motorcycles and bikes across city hubs and stage your rental here.
            </p>
          </div>
          <button
            onClick={() => onNavigate('bikes')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            Explore Fleet
          </button>
        </div>
      )}
    </div>
  );
};
