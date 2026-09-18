import React, { useState } from 'react';
import { Bike, Heart, ShoppingBag, User, ShieldCheck, LogOut, Menu, X, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useWishlistCart } from '../context/WishlistCartContext.js';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, param?: string) => void;
  onOpenPoliciesModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenPoliciesModal }) => {
  const { user, logout, isAdmin } = useAuth();
  const { wishlist, cart } = useWishlistCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'bikes', label: 'Bikes Fleet' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:bg-emerald-700 transition-colors">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block">
                RentalBike<span className="text-emerald-600">.</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium block -mt-1 tracking-wider uppercase">
                Fleet & Rentals
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => onNavigate(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {onOpenPoliciesModal && (
              <button
                id="nav-policies-btn"
                onClick={onOpenPoliciesModal}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Rental Policies
              </button>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <button
              id="nav-wishlist-btn"
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Saved Wishlist"
              aria-label="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              id="nav-cart-btn"
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Rental Cart"
              aria-label="Rental Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* User State */}
            {user ? (
              <div className="relative">
                <button
                  id="nav-user-dropdown-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-all text-sm font-medium text-slate-800"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block max-w-[120px] truncate text-slate-800 font-semibold">
                    {user.name}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                      Admin
                    </span>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <button
                      id="dropdown-my-bookings"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('my-bookings');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      My Bookings
                    </button>

                    <button
                      id="dropdown-wishlist"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('wishlist');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      Saved Wishlist ({wishlist.length})
                    </button>

                    {isAdmin && (
                      <button
                        id="dropdown-admin-dashboard"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        id="dropdown-logout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-signin-btn"
                  onClick={() => onNavigate('auth')}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => onNavigate('auth', 'register')}
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 transition-all"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`mobile-nav-${link.id}`}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.id);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentPage === link.id
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            {onOpenPoliciesModal && (
              <button
                id="mobile-nav-policies"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPoliciesModal();
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Rental Policies & Terms
              </button>
            )}

            {user ? (
              <>
                <button
                  id="mobile-nav-my-bookings"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('my-bookings');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>My Bookings</span>
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                </button>
                {isAdmin && (
                  <button
                    id="mobile-nav-admin"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50 flex items-center justify-between"
                  >
                    <span>Admin Fleet Dashboard</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  id="mobile-nav-logout"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                id="mobile-nav-auth"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('auth');
                }}
                className="w-full text-center mt-2 py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-semibold text-sm shadow"
              >
                Sign In / Register
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
