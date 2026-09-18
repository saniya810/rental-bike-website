import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { WishlistCartProvider } from './context/WishlistCartContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { BikesPage } from './pages/BikesPage.js';
import { BikeDetailsPage } from './pages/BikeDetailsPage.js';
import { MyBookingsPage } from './pages/MyBookingsPage.js';
import { WishlistPage } from './pages/WishlistPage.js';
import { CartPage } from './pages/CartPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { BookingModal } from './components/BookingModal.js';
import { RentalPoliciesModal } from './components/RentalPoliciesModal.js';
import { Bike, Booking, RentalPolicies } from './types.js';
import { api } from './services/api.js';
import { Loader2, AlertCircle } from 'lucide-react';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Fleet & Policies State
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [policies, setPolicies] = useState<RentalPolicies | undefined>(undefined);
  const [isLoadingFleet, setIsLoadingFleet] = useState<boolean>(true);
  const [fleetError, setFleetError] = useState<string | null>(null);

  // Global Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingBike, setBookingBike] = useState<Bike | null>(null);

  // Global Policies Modal State
  const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState<boolean>(false);

  // Fetch initial fleet and policies from the backend
  const fetchFleet = async () => {
    try {
      setIsLoadingFleet(true);
      const [bikesRes, polRes] = await Promise.all([
        api.getBikes(),
        api.getPolicies(),
      ]);
      setBikes(bikesRes.bikes);
      setPolicies(polRes.policies);
      setFleetError(null);
    } catch (err: any) {
      console.error('Failed to load fleet data:', err);
      setFleetError(err.message || 'Could not connect to fleet server.');
    } finally {
      setIsLoadingFleet(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleNavigate = (page: string, param?: string) => {
    if (page === 'auth' && param === 'register') {
      setAuthMode('register');
    } else if (page === 'auth') {
      setAuthMode('login');
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBike = (bike: Bike) => {
    setSelectedBike(bike);
    setCurrentPage('bike-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookBike = (bike: Bike) => {
    setBookingBike(bike);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    fetchFleet(); // Refresh fleet availability
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenPoliciesModal={() => setIsPoliciesModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {fleetError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Fleet server notice: {fleetError} - Loading cached local fleet records.</span>
            </div>
          </div>
        )}

        {isLoadingFleet && bikes.length === 0 ? (
          <div className="py-32 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-600" />
            <p className="text-sm font-semibold text-slate-600">
              Initializing Fleet Database & Hub Operations...
            </p>
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <HomePage
                bikes={bikes}
                onNavigate={handleNavigate}
                onSelectBike={handleSelectBike}
                onBookBike={handleBookBike}
                onOpenPoliciesModal={() => setIsPoliciesModalOpen(true)}
              />
            )}

            {currentPage === 'bikes' && (
              <BikesPage
                bikes={bikes}
                onSelectBike={handleSelectBike}
                onBookBike={handleBookBike}
              />
            )}

            {currentPage === 'bike-details' && selectedBike && (
              <BikeDetailsPage
                bike={selectedBike}
                onBack={() => handleNavigate('bikes')}
                onBookNow={handleBookBike}
                onOpenPoliciesModal={() => setIsPoliciesModalOpen(true)}
              />
            )}

            {currentPage === 'my-bookings' && (
              <MyBookingsPage
                onNavigate={handleNavigate}
                onSelectBikeForDetails={handleSelectBike}
              />
            )}

            {currentPage === 'wishlist' && (
              <WishlistPage
                onNavigate={handleNavigate}
                onSelectBike={handleSelectBike}
                onBookNow={handleBookBike}
              />
            )}

            {currentPage === 'cart' && (
              <CartPage
                onNavigate={handleNavigate}
                onBookNow={handleBookBike}
              />
            )}

            {currentPage === 'auth' && (
              <AuthPage
                initialMode={authMode}
                onSuccess={() => handleNavigate('home')}
              />
            )}

            {currentPage === 'about' && (
              <AboutPage
                onNavigate={handleNavigate}
                onOpenPoliciesModal={() => setIsPoliciesModalOpen(true)}
              />
            )}

            {currentPage === 'contact' && <ContactPage />}

            {currentPage === 'admin' && (
              <AdminDashboardPage
                onNavigate={handleNavigate}
                onFleetUpdated={fetchFleet}
              />
            )}
          </>
        )}
      </main>

      {/* Global Booking Flow Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        bike={bookingBike}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
        onOpenPoliciesModal={() => setIsPoliciesModalOpen(true)}
      />

      {/* Global Rental Policies & Damage Schedule Modal */}
      <RentalPoliciesModal
        isOpen={isPoliciesModalOpen}
        onClose={() => setIsPoliciesModalOpen(false)}
        policies={policies}
      />

      {/* Shared Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPoliciesModal={() => setIsPoliciesModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistCartProvider>
        <AppContent />
      </WishlistCartProvider>
    </AuthProvider>
  );
}
