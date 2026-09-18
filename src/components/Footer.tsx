import React from 'react';
import { Bike, MapPin, Clock, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenPoliciesModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPoliciesModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                RentalBike<span className="text-emerald-400">.</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Professional, reliable bike rentals for daily commuters, students, travelers, and tourists.
              Flexible hourly and daily pricing with instant digital reservation.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Full-Stack Verified Fleet Operations</span>
            </div>
          </div>

          {/* Col 2: Hub Locations */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Rental Stations
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Central Park Hub & Trailhead</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Downtown Transit Central Terminal</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>University Campus Quad Hub</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Westside Waterfront Boardwalk</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Explore & Book
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('bikes')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Browse All Bikes & E-Bikes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-bookings')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  My Reservations & History
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  About Platform & Fleet Safety
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Support & Contact
                </button>
              </li>
              {onOpenPoliciesModal && (
                <li>
                  <button
                    onClick={onOpenPoliciesModal}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>Rental Policies & Terms</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Operating Hours & Policy */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Service Hours
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Mon – Sun: 07:00 AM – 10:00 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Dispatch: +1 (555) 019-2831</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>help@bikeshare-support.com</span>
              </li>
            </ul>
            <div className="pt-2">
              <p className="text-xs text-slate-500">
                Helmets, safety locks, and orientation are provided with every rental.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Rental Bike Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-slate-300 transition-colors"
            >
              Terms & Conditions
            </button>
            <span>•</span>
            {onOpenPoliciesModal && (
              <button
                onClick={onOpenPoliciesModal}
                className="hover:text-slate-300 transition-colors"
              >
                Security Deposit & Damage Matrix
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
