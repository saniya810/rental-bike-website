import React, { useState, useEffect } from 'react';
import {
  Star,
  Zap,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Heart,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageSquarePlus,
  Loader2,
  Gauge,
  Fuel,
} from 'lucide-react';
import { Bike, Review } from '../types.js';
import { api } from '../services/api.js';
import { useWishlistCart } from '../context/WishlistCartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { ReviewModal } from '../components/ReviewModal.js';
import { formatINR } from '../utils/currency.js';

interface BikeDetailsPageProps {
  bike: Bike;
  onBack: () => void;
  onBookNow: (bike: Bike) => void;
  onOpenPoliciesModal?: () => void;
}

export const BikeDetailsPage: React.FC<BikeDetailsPageProps> = ({
  bike,
  onBack,
  onBookNow,
  onOpenPoliciesModal,
}) => {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist, addToCart, isInCart } = useWishlistCart();
  const [selectedImage, setSelectedImage] = useState<string>(bike.imageUrl);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);

  // Quick Availability Preview State
  const today = new Date().toISOString().split('T')[0];
  const [previewPickupDate, setPreviewPickupDate] = useState<string>(today);
  const [previewPickupTime, setPreviewPickupTime] = useState<string>('10:00');
  const [previewReturnDate, setPreviewReturnDate] = useState<string>(today);
  const [previewReturnTime, setPreviewReturnTime] = useState<string>('14:00');
  const [previewAvailStatus, setPreviewAvailStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  } | null>(null);
  const [isCheckingAvail, setIsCheckingAvail] = useState<boolean>(false);

  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const res = await api.getReviews(bike.id);
      setReviews(res.reviews);
    } catch (err) {
      console.warn('Failed loading reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    setSelectedImage(bike.imageUrl);
  }, [bike.id]);

  const handleQuickAvailCheck = async () => {
    setIsCheckingAvail(true);
    try {
      const res = await api.checkAvailability({
        bikeId: bike.id,
        pickupDate: previewPickupDate,
        pickupTime: previewPickupTime,
        returnDate: previewReturnDate,
        returnTime: previewReturnTime,
      });
      setPreviewAvailStatus({
        checked: true,
        available: res.available,
        message: res.message,
      });
    } catch (err: any) {
      setPreviewAvailStatus({
        checked: true,
        available: false,
        message: err.message || 'Availability check error',
      });
    } finally {
      setIsCheckingAvail(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(bike, {
        rentalType: 'hourly',
        pickupDate: previewPickupDate,
        pickupTime: previewPickupTime,
        returnDate: previewReturnDate,
        returnTime: previewReturnTime,
        pickupLocation: bike.location,
      });
      setCartSuccessMessage('Added to your rental cart!');
      setTimeout(() => setCartSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add to cart. Please log in.');
    }
  };

  const images = bike.galleryUrls && bike.galleryUrls.length > 0 ? bike.galleryUrls : [bike.imageUrl];
  const isEbike = bike.bikeType === 'Electric / E-Bike';
  const isMotorcycle =
    bike.vehicleType === 'motorcycle' || Boolean(bike.specifications?.engineCc);
  const saved = isInWishlist(bike.id);
  const inCart = isInCart(bike.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back Button */}
      <button
        id="bike-details-back-btn"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Fleet Catalog</span>
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Gallery & Images (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={selectedImage}
              alt={bike.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md ${
                  isMotorcycle ? 'bg-amber-600/90 text-white' : 'bg-slate-900/80 text-white'
                }`}
              >
                {isMotorcycle ? 'Motorcycle' : bike.bikeType}
              </span>
              {isMotorcycle && bike.specifications?.engineCc && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900/85 text-amber-300 backdrop-blur-md">
                  {bike.specifications.engineCc} cc Engine
                </span>
              )}
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                Condition: {bike.bikeCondition}
              </span>
            </div>

            <button
              onClick={() => toggleWishlist(bike)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                saved
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/85 text-slate-700 hover:text-rose-500 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Specifications Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">
              {isMotorcycle ? 'Motorcycle Technical Specifications' : 'Technical Specifications'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              {isMotorcycle ? (
                <>
                  {bike.specifications.engineCc && (
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                      <span className="text-amber-800 block font-medium">Displacement</span>
                      <span className="font-bold text-slate-900">{bike.specifications.engineCc} cc</span>
                    </div>
                  )}
                  {bike.specifications.powerBhp && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block font-medium">Max Power</span>
                      <span className="font-bold text-slate-800">{bike.specifications.powerBhp}</span>
                    </div>
                  )}
                  {bike.specifications.torqueNm && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block font-medium">Peak Torque</span>
                      <span className="font-bold text-slate-800">{bike.specifications.torqueNm}</span>
                    </div>
                  )}
                  {bike.specifications.mileageKmpl && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-emerald-700 block font-medium">Fuel Mileage</span>
                      <span className="font-bold text-slate-900">{bike.specifications.mileageKmpl} km/l</span>
                    </div>
                  )}
                  {bike.specifications.fuelCapacityLitres && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block font-medium">Fuel Tank</span>
                      <span className="font-bold text-slate-800">{bike.specifications.fuelCapacityLitres} Litres</span>
                    </div>
                  )}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Transmission</span>
                    <span className="font-bold text-slate-800">{bike.specifications.gears}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Braking System</span>
                    <span className="font-bold text-slate-800">{bike.specifications.brakes}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Kerb Weight</span>
                    <span className="font-bold text-slate-800">{bike.specifications.weightKg} kg</span>
                  </div>
                  {bike.specifications.seatHeightMm && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block font-medium">Seat Height</span>
                      <span className="font-bold text-slate-800">{bike.specifications.seatHeightMm} mm</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Frame Material</span>
                    <span className="font-bold text-slate-800">{bike.specifications.frameMaterial}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Gears / Drivetrain</span>
                    <span className="font-bold text-slate-800">{bike.specifications.gears}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Braking System</span>
                    <span className="font-bold text-slate-800">{bike.specifications.brakes}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Net Weight</span>
                    <span className="font-bold text-slate-800">{bike.specifications.weightKg} kg</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Wheel Diameter</span>
                    <span className="font-bold text-slate-800">{bike.specifications.wheelSizeInch}" Wheels</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Recommended Height</span>
                    <span className="font-bold text-slate-800">{bike.specifications.suitableHeightCm}</span>
                  </div>
                  {isEbike && bike.specifications.batteryCapacity && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-emerald-700 block font-medium">Battery Pack</span>
                      <span className="font-bold text-emerald-950">{bike.specifications.batteryCapacity}</span>
                    </div>
                  )}
                  {isEbike && bike.specifications.maxRangeKm && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-emerald-700 block font-medium">Max Motor Range</span>
                      <span className="font-bold text-emerald-950">{bike.specifications.maxRangeKm} km</span>
                    </div>
                  )}
                  {isEbike && bike.specifications.motorPower && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-emerald-700 block font-medium">Motor Output</span>
                      <span className="font-bold text-emerald-950">{bike.specifications.motorPower}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-emerald-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>ISI/DOT Helmet Included</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Heavy-Duty Lock Included</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pre-Rental Safety Inspection</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Booking Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {bike.brand}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{bike.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({bike.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {bike.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">{bike.model}</p>
            </div>

            {/* Hub Station Location */}
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Available at: <strong>{bike.location}</strong>
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">{bike.description}</p>

            {/* Price Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Hourly Rate
                </span>
                <span className="text-2xl font-black text-slate-900">{formatINR(bike.hourlyPrice)}</span>
                <span className="text-xs text-slate-500 font-medium"> / hr</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Daily Rate
                </span>
                <span className="text-2xl font-black text-emerald-600">{formatINR(bike.dailyPrice)}</span>
                <span className="text-xs text-slate-500 font-medium"> / day</span>
              </div>
            </div>

            {/* Mini Slot Availability Tester */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-900 block">Check Live Slot Availability</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Pickup Date</label>
                  <input
                    type="date"
                    min={today}
                    value={previewPickupDate}
                    onChange={(e) => setPreviewPickupDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Return Date</label>
                  <input
                    type="date"
                    min={previewPickupDate}
                    value={previewReturnDate}
                    onChange={(e) => setPreviewReturnDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickAvailCheck}
                disabled={isCheckingAvail}
                className="w-full py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {isCheckingAvail && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Verify Slot Availability</span>
              </button>

              {previewAvailStatus && (
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                    previewAvailStatus.available
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {previewAvailStatus.available ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{previewAvailStatus.message}</span>
                </div>
              )}
            </div>

            {/* Cart Success message */}
            {cartSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{cartSuccessMessage}</span>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                id="details-book-now-btn"
                onClick={() => onBookNow(bike)}
                className="w-full py-3.5 rounded-2xl font-black text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <span>{isMotorcycle ? 'Book This Motorcycle Now' : 'Book This Bike Now'}</span>
              </button>

              <button
                id="details-add-to-cart-btn"
                onClick={handleAddToCart}
                className="w-full py-3 rounded-2xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{inCart ? 'In Cart (Update Plan)' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* Policy Link */}
            {onOpenPoliciesModal && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onOpenPoliciesModal}
                  className="text-xs text-slate-500 hover:text-emerald-700 underline"
                >
                  View Security Deposit, Fuel & Damage Policies
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Rider Reviews & Feedback</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified rider ratings from completed bookings
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                alert('Please sign in to post a review.');
                return;
              }
              setIsReviewModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1.5 w-fit"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {isLoadingReviews ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r.userName}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-700">{r.rating}.0</span>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed">{r.comment}</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            No rider reviews yet. Be the first to share your riding experience!
          </div>
        )}
      </section>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        bike={bike}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={fetchReviews}
      />
    </div>
  );
};
