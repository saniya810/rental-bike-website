import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  X,
  FileCheck,
  Loader2,
  CalendarPlus,
  Bike as BikeIcon,
} from 'lucide-react';
import { Booking, Bike } from '../types.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { formatINR } from '../utils/currency.js';

interface MyBookingsPageProps {
  onNavigate: (page: string) => void;
  onSelectBikeForDetails?: (bike: Bike) => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  onNavigate,
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  // Extension Modal State
  const [extendBooking, setExtendBooking] = useState<Booking | null>(null);
  const [extendReturnDate, setExtendReturnDate] = useState<string>('');
  const [extendReturnTime, setExtendReturnTime] = useState<string>('');
  const [isExtending, setIsExtending] = useState<boolean>(false);
  const [extensionMessage, setExtensionMessage] = useState<string | null>(null);

  // Cancellation Modal State
  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Inspection Report View Modal
  const [viewInspectionBooking, setViewInspectionBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.getMyBookings();
      setBookings(res.bookings);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async () => {
    if (!cancelBookingTarget) return;
    setIsCancelling(true);
    try {
      await api.cancelBooking(cancelBookingTarget.id);
      setCancelBookingTarget(null);
      await fetchBookings();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel reservation');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendBooking) return;
    setIsExtending(true);
    setExtensionMessage(null);
    try {
      const res = await api.extendBooking({
        bookingId: extendBooking.id,
        newReturnDate: extendReturnDate,
        newReturnTime: extendReturnTime,
      });
      setExtensionMessage(res.message);
      setTimeout(() => {
        setExtendBooking(null);
        fetchBookings();
      }, 1200);
    } catch (err: any) {
      setExtensionMessage(err.message || 'Extension failed. Time slot may already be reserved.');
    } finally {
      setIsExtending(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const stat = b.bookingStatus || (b as any).status;
    if (selectedFilter === 'all') return true;
    return stat === selectedFilter;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'upcoming':
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            Upcoming / Confirmed
          </span>
        );
      case 'active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 animate-pulse">
            Active On Ride
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            Returned & Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Sign in to view your bookings</h2>
        <p className="text-xs text-slate-500">
          Access your active rentals, upcoming pickups, and past invoice receipts.
        </p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Rental Bookings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your scheduled trips, extend rental durations, or check inspection reports.
          </p>
        </div>

        <button
          onClick={() => onNavigate('bikes')}
          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm w-fit"
        >
          Book Another Bike
        </button>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'confirmed', 'active', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
              selectedFilter === tab
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'all' ? 'All Bookings' : tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-xs">Loading your reservations...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
            >
              {/* Bike & Info */}
              <div className="flex gap-4 items-start sm:items-center">
                {b.bike?.imageUrl ? (
                  <img
                    src={b.bike.imageUrl}
                    alt={b.bike.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                    <BikeIcon className="w-8 h-8 text-slate-400" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      ID: {b.id.slice(0, 12)}
                    </span>
                    {getStatusBadge(b.bookingStatus || b.status)}
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                      {b.rentalType === 'hourly' ? `${b.durationHours} Hours` : `${b.durationDays} Days`}
                    </span>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {b.bike ? `${b.bike.brand} ${b.bike.name}` : 'Reserved Bike'}
                  </h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Pickup: {b.pickupDate} ({b.pickupTime})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      Return: {b.returnDate} ({b.returnTime})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Hub: {b.pickupLocation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing & Actions */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-start sm:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-3">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block font-medium">Total Authorized</span>
                  <span className="text-xl font-black text-slate-900">{formatINR(b.totalAmount)}</span>
                  <span className="text-[10px] text-emerald-700 block">
                    (Includes {formatINR(b.securityDeposit)} refundable deposit)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Inspection Link */}
                  <button
                    onClick={() => setViewInspectionBooking(b)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Inspection</span>
                  </button>

                  {/* Extend Button (available if confirmed or active) */}
                  {((b.bookingStatus === 'upcoming' || b.bookingStatus === 'active') || ((b as any).status === 'confirmed' || (b as any).status === 'active')) && (
                    <button
                      onClick={() => {
                        setExtendBooking(b);
                        setExtendReturnDate(b.returnDate);
                        setExtendReturnTime(b.returnTime);
                        setExtensionMessage(null);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Extend Time</span>
                    </button>
                  )}

                  {/* Cancel Button (available if upcoming/confirmed) */}
                  {(b.bookingStatus === 'upcoming' || (b as any).status === 'confirmed') && (
                    <button
                      onClick={() => setCancelBookingTarget(b)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No bookings in this tab</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven’t made any reservations under this status category yet.
            </p>
          </div>
          <button
            onClick={() => onNavigate('bikes')}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            Explore Available Bikes
          </button>
        </div>
      )}

      {/* Extension Modal */}
      {extendBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Extend Rental Duration</h3>
              <button
                onClick={() => setExtendBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Extend your return time for <strong>{extendBooking.bike?.name}</strong>. The system will
              verify slot availability and bill at standard rates with no penalties.
            </p>

            <form onSubmit={handleExtendSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">New Return Date</label>
                <input
                  type="date"
                  min={extendBooking.returnDate}
                  value={extendReturnDate}
                  onChange={(e) => setExtendReturnDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">New Return Time</label>
                <input
                  type="time"
                  value={extendReturnTime}
                  onChange={(e) => setExtendReturnTime(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              {extensionMessage && (
                <div className="p-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium">
                  {extensionMessage}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setExtendBooking(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExtending}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                >
                  {isExtending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Extension</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Cancel Reservation?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel booking <strong>{cancelBookingTarget.id.slice(0, 10)}</strong>?
                Full refund will be returned to your original payment hold.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelBookingTarget(null)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelBooking}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
              >
                {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Report Modal */}
      {viewInspectionBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">Fleet Inspection Record</h3>
                <p className="text-xs text-slate-500">Booking {viewInspectionBooking.id.slice(0, 12)}</p>
              </div>
              <button
                onClick={() => setViewInspectionBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Inspected Bike:</span>
                <span className="font-bold text-slate-900">
                  {viewInspectionBooking.bike?.brand} {viewInspectionBooking.bike?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Bike Condition:</span>
                <span className="font-bold text-emerald-700">
                  {viewInspectionBooking.bike?.bikeCondition || 'Good'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tire Pressure & Brakes:</span>
                <span className="font-semibold text-slate-800">Passed Certification</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Safety Gear Issued:</span>
                <span className="font-semibold text-slate-800">Helmet & Combination Cable Lock</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block mb-1">Check-in / Dispatch Notes:</span>
                <p className="text-slate-700 italic">
                  "Pre-rental multi-point safety inspection cleared. Brakes adjusted, chain lubricated, tire PSI calibrated to manufacturer recommendation."
                </p>
              </div>
            </div>

            <button
              onClick={() => setViewInspectionBooking(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              Close Inspection Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
