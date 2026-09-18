import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
  Loader2,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Bike, PriceBreakdown, AvailabilityCheckResult, Booking } from '../types.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { formatINR } from '../utils/currency.js';

interface BookingModalProps {
  isOpen: boolean;
  bike: Bike | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  onOpenPoliciesModal?: () => void;
}

const PICKUP_LOCATIONS = [
  'Central Hub & Metro Station',
  'Downtown Transit Central Terminal',
  'Connaught Place Hub',
  'Indiranagar Hub',
  'Koramangala Station',
  'University Campus Quad Hub',
  'Westside Waterfront Boardwalk',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  bike,
  onClose,
  onBookingSuccess,
  onOpenPoliciesModal,
}) => {
  const { user } = useAuth();

  // Booking Form State
  const [rentalType, setRentalType] = useState<'hourly' | 'daily'>('hourly');

  // Dates defaults: pickup today/tomorrow, default times
  const today = new Date().toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState<string>(today);
  const [pickupTime, setPickupTime] = useState<string>('10:00');
  const [returnDate, setReturnDate] = useState<string>(today);
  const [returnTime, setReturnTime] = useState<string>('14:00');
  const [pickupLocation, setPickupLocation] = useState<string>(
    bike?.location || PICKUP_LOCATIONS[0]
  );
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState<string>(
    user?.drivingLicenseNumber || ''
  );
  const [notes, setNotes] = useState<string>('');

  // Availability & Pricing State
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<AvailabilityCheckResult | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (bike) {
      setPickupLocation(bike.location || PICKUP_LOCATIONS[0]);
    }
  }, [bike]);

  // Trigger Availability and Price recalculation whenever parameters change
  useEffect(() => {
    if (!bike || !isOpen) return;

    let isCancelled = false;

    async function evaluateBooking() {
      if (!bike) return;
      setIsCheckingAvailability(true);
      setErrorMessage(null);

      try {
        // 1. Check availability
        const avail = await api.checkAvailability({
          bikeId: bike.id,
          pickupDate,
          pickupTime,
          returnDate,
          returnTime,
        });

        if (isCancelled) return;
        setAvailabilityResult(avail);

        if (avail.available) {
          // 2. Calculate price
          const { breakdown } = await api.calculatePrice({
            bikeId: bike.id,
            rentalType,
            pickupDate,
            pickupTime,
            returnDate,
            returnTime,
          });
          if (isCancelled) return;
          setPriceBreakdown(breakdown);
        } else {
          setPriceBreakdown(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setErrorMessage(err.message || 'Availability check failed');
          setAvailabilityResult({
            available: false,
            message: err.message || 'Unable to verify slot availability.',
          });
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingAvailability(false);
        }
      }
    }

    const timer = setTimeout(evaluateBooking, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [bike, isOpen, rentalType, pickupDate, pickupTime, returnDate, returnTime]);

  if (!isOpen || !bike) return null;

  const isMotorcycle =
    bike.vehicleType === 'motorcycle' || Boolean(bike.specifications?.engineCc);

  const handleCreateBooking = async () => {
    if (!availabilityResult?.available) {
      setErrorMessage('This vehicle is not available for the requested time frame.');
      return;
    }

    if (!drivingLicenseNumber.trim()) {
      setErrorMessage(
        isMotorcycle
          ? 'Please enter your valid Indian Driving License (MCWG / Gear) number.'
          : 'Please provide your Driving License or Government Photo ID number.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { booking } = await api.createBooking({
        bikeId: bike.id,
        rentalType,
        pickupDate,
        pickupTime,
        returnDate,
        returnTime,
        pickupLocation,
        drivingLicenseNumber: drivingLicenseNumber.trim(),
        notes,
        simulatePayment: true, // Deposit authorization verified
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setConfirmedBooking(booking);
      onBookingSuccess(booking);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div
        id="booking-flow-modal"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <img
              src={bike.imageUrl}
              alt={bike.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  {bike.brand}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                    isMotorcycle ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isMotorcycle ? 'Motorcycle' : bike.bikeType}
                </span>
                {isMotorcycle && bike.specifications?.engineCc && (
                  <span className="text-xs px-2 py-0.5 bg-slate-900 text-amber-300 rounded-md font-bold">
                    {bike.specifications.engineCc} cc
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                {bike.name}
              </h3>
            </div>
          </div>

          <button
            id="close-booking-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {confirmedBooking ? (
            /* Booking Confirmation View */
            <div id="booking-confirmation-view" className="py-4 text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900">Reservation Confirmed!</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Your {isMotorcycle ? 'motorcycle' : 'bike'} is reserved and ready for pickup at your designated hub station.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{confirmedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Station:</span>
                  <span className="font-semibold text-slate-900">{confirmedBooking.pickupLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Window:</span>
                  <span className="font-medium text-slate-900">
                    {confirmedBooking.pickupDate} at {confirmedBooking.pickupTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Return Window:</span>
                  <span className="font-medium text-slate-900">
                    {confirmedBooking.returnDate} at {confirmedBooking.returnTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rental Duration:</span>
                  <span className="font-semibold text-emerald-700">
                    {confirmedBooking.rentalType === 'hourly'
                      ? `${confirmedBooking.durationHours} Hours`
                      : `${confirmedBooking.durationDays} Days`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Refundable Deposit:</span>
                  <span className="font-semibold text-slate-800">{formatINR(confirmedBooking.securityDeposit)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-900">Total Authorized:</span>
                  <span className="font-black text-emerald-600 text-base">
                    {formatINR(confirmedBooking.totalAmount)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 text-center pt-1">
                  Refundable security deposit hold of {formatINR(confirmedBooking.securityDeposit)} will be released immediately after check-in inspection.
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  id="confirmed-view-bookings-btn"
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                >
                  View in My Bookings
                </button>
              </div>
            </div>
          ) : (
            /* Booking Creation Form */
            <>
              {/* Step 1: Rental Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  1. Choose Rental Plan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="plan-hourly-btn"
                    onClick={() => setRentalType('hourly')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      rentalType === 'hourly'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Hourly Rental</span>
                      <span className="text-base font-extrabold text-emerald-600">
                        {formatINR(bike.hourlyPrice)}/hr
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Ideal for short rides, city transit & errands
                    </p>
                  </button>

                  <button
                    type="button"
                    id="plan-daily-btn"
                    onClick={() => setRentalType('daily')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      rentalType === 'daily'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Daily Rental</span>
                      <span className="text-base font-extrabold text-emerald-600">
                        {formatINR(bike.dailyPrice)}/day
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Save with full-day & weekend highway trips
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 2: Pickup & Return Dates/Times */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  2. Select Pickup & Return Schedule
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pickup */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Pickup Date & Time
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        id="booking-pickup-date"
                        type="date"
                        min={today}
                        value={pickupDate}
                        onChange={(e) => {
                          setPickupDate(e.target.value);
                          if (e.target.value > returnDate) {
                            setReturnDate(e.target.value);
                          }
                        }}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        id="booking-pickup-time"
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Return */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      Return Date & Time
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        id="booking-return-date"
                        type="date"
                        min={pickupDate}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        id="booking-return-time"
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Location and Driving License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Pickup Station Hub
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      id="booking-pickup-location"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    >
                      {PICKUP_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {isMotorcycle ? 'Driver’s License (MCWG / Gear)' : 'Photo ID / Driver’s License'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FileCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="booking-license-input"
                      type="text"
                      placeholder={isMotorcycle ? 'e.g. DL-0420110012345' : 'e.g. DL / Govt ID Number'}
                      value={drivingLicenseNumber}
                      onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Availability Check Status Banner */}
              <div id="availability-status-banner">
                {isCheckingAvailability ? (
                  <div className="p-3 rounded-2xl bg-slate-100 text-slate-600 flex items-center gap-2 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Verifying fleet schedule and overlapping active bookings...</span>
                  </div>
                ) : availabilityResult ? (
                  availabilityResult.available ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{availabilityResult.message}</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-xs">
                      <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Unavailable for selected dates</span>
                      </div>
                      <p>{availabilityResult.message}</p>
                    </div>
                  )
                ) : null}
              </div>

              {/* Price Breakdown Summary */}
              {priceBreakdown && (
                <div id="price-summary-card" className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>
                      Rental Base ({priceBreakdown.durationUnits}{' '}
                      {priceBreakdown.rentalType === 'hourly' ? 'hours' : 'days'} @{' '}
                      {formatINR(priceBreakdown.ratePerUnit)}/{priceBreakdown.rentalType === 'hourly' ? 'hr' : 'day'})
                    </span>
                    <span>{formatINR(priceBreakdown.baseRentalCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Refundable Security Deposit</span>
                      {onOpenPoliciesModal && (
                        <button
                          type="button"
                          onClick={onOpenPoliciesModal}
                          className="text-emerald-600 hover:underline"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                    <span className="font-semibold text-slate-800">{formatINR(priceBreakdown.securityDeposit)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST & Service Charge (18%)</span>
                    <span>{formatINR(priceBreakdown.taxes)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Included Safety Gear (ISI/DOT Helmet & Lock)</span>
                    <span className="text-emerald-600 font-semibold">FREE Included</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
                    <div>
                      <span className="font-extrabold text-slate-900">Total Booking Authorization:</span>
                      <p className="text-[10px] text-slate-400">
                        Deposit released back to payment source immediately upon return inspection
                      </p>
                    </div>
                    <span className="text-lg font-black text-emerald-600">
                      {formatINR(priceBreakdown.totalAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Architecture Transparency Notice */}
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Transparent Indian Rupee (INR) Pricing:</span>
                  <p className="text-blue-800 leading-relaxed mt-0.5">
                    Reservations authorize the refundable security deposit hold alongside base rent & GST.
                    In deployed production, verified UPI, NetBanking, and credit/debit cards are supported securely.
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  id="submit-booking-btn"
                  type="button"
                  disabled={
                    !availabilityResult?.available ||
                    isCheckingAvailability ||
                    isSubmitting ||
                    !priceBreakdown
                  }
                  onClick={handleCreateBooking}
                  className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Reservation...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        Confirm & Book for{' '}
                        {priceBreakdown ? formatINR(priceBreakdown.totalAmount) : '₹0'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
