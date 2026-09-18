import React, { useState } from 'react';
import {
  Bike as BikeIcon,
  Zap,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  Compass,
  FileCheck,
} from 'lucide-react';
import { Bike } from '../types.js';
import { BikeCard } from '../components/BikeCard.js';

interface HomePageProps {
  bikes: Bike[];
  onNavigate: (page: string, param?: string) => void;
  onSelectBike: (bike: Bike) => void;
  onBookBike: (bike: Bike) => void;
  onOpenPoliciesModal?: () => void;
}

const CATEGORY_HIGHLIGHTS = [
  {
    title: 'Motorcycles / 2-Wheelers',
    count: 'Cruiser, Sport & Street',
    icon: Compass,
    description: 'Royal Enfield Classic 350, Yamaha R15, KTM Duke & Bajaj Pulsar with touring gear.',
    type: 'Motorcycles',
  },
  {
    title: 'Electric / E-Bike',
    count: 'Eco Boost & Range',
    icon: Zap,
    description: 'Effortless hills and city commutes with battery ranges up to 120km.',
    type: 'Electric / E-Bike',
  },
  {
    title: 'Mountain Fleet',
    count: 'Trail Ready',
    icon: SlidersHorizontal,
    description: 'Cross-country hardtails with suspension lockout and hydraulic disc brakes.',
    type: 'Mountain',
  },
  {
    title: 'City & Commuter',
    count: 'Lightweight Agility',
    icon: BikeIcon,
    description: 'Fast, agile urban transit with ergonomic comfort bars and luggage racks.',
    type: 'City / Commuter',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  bikes,
  onNavigate,
  onSelectBike,
  onBookBike,
  onOpenPoliciesModal,
}) => {
  // Quick Search Widget state
  const [searchCategory, setSearchCategory] = useState<string>('All');
  const [searchLocation, setSearchLocation] = useState<string>('Central Park Hub & Trailhead');

  const featuredBikes = bikes.slice(0, 4);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('bikes');
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Subtle geometric backdrop */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified 2-Wheeler Fleet Management & Instant Booking</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Motorcycle & 2-Wheeler <br />
              <span className="text-emerald-400">Rentals in India</span> Made Simple.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Rent certified motorcycles (Royal Enfield Classic 350, Yamaha R15, KTM Duke, Bajaj Pulsar) and premium bicycles across hub stations.
              Enjoy transparent hourly or daily pricing in INR (₹), real-time slot checking, and instant digital check-in.
            </p>

            {/* Quick Availability Search Widget */}
            <div className="pt-4">
              <form
                onSubmit={handleQuickSearch}
                className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 text-slate-900 max-w-2xl"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Vehicle Category
                    </label>
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="All">All 2-Wheelers & Bikes</option>
                      <option value="Motorcycles">Motorcycles</option>
                      <option value="Cruiser / Modern Classic">Cruiser (Royal Enfield)</option>
                      <option value="Supersport / Sports Bike">Supersport (Yamaha R15)</option>
                      <option value="Naked Streetfighter">Streetfighter (KTM Duke / MT-15)</option>
                      <option value="Electric / E-Bike">Electric / E-Bike</option>
                      <option value="Mountain">Mountain Bike</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Pickup Hub Station
                    </label>
                    <select
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Central Hub & Trailhead">Central Hub & Metro Station</option>
                      <option value="Downtown Transit Central Terminal">Downtown Terminal</option>
                      <option value="University Campus Quad Hub">University Hub</option>
                      <option value="Westside Waterfront Boardwalk">Westside Terminal</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 h-[42px]"
                    >
                      <span>Browse Fleet</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Micro Highlights */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Hidden Fees (INR Pricing)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>DOT Helmet & Lock Included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Digital Verification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Target Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Curated for Every Rider
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Engineered for students, daily commuters, weekend travelers, and sightseers.
            </p>
          </div>
          <button
            onClick={() => onNavigate('bikes')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All Fleet Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORY_HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate('bikes')}
                className="group p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    {item.count}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-emerald-600">
                  <span>Explore Bikes</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Fleet Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase block mb-1">
              Ready For Immediate Ride
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Fleet
            </h2>
          </div>
          <button
            onClick={() => onNavigate('bikes')}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 w-fit"
          >
            <span>Browse Full Catalog ({bikes.length} Bikes)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBikes.map((bike) => (
            <BikeCard
              key={bike.id}
              bike={bike}
              onSelect={onSelectBike}
              onBookNow={onBookBike}
            />
          ))}
        </div>
      </section>

      {/* 4. Flexible Rental Plans (Hourly vs Daily) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
          <div className="max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Clear Pricing Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Choose Between Hourly or Daily Rental Plans
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              No complicated tiers. Calculate your exact rental total upfront with automated security deposit
              management and 100% refundable checkout holds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {/* Hourly Card */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300">
                  From ₹80 / Hour
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Hourly Rental Plan</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cost = Hourly Rate × Number of Hours. Perfect for short commutes, campus hops,
                scenic afternoon rides, and quick city meetings.
              </p>
              <ul className="space-y-2 text-xs text-slate-200 pt-2 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Billed in 1-hour increments with 30-min grace period</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ISI/DOT Helmet & security lock included</span>
                </li>
              </ul>
            </div>

            {/* Daily Card */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300">
                  From ₹450 / Day
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Daily Multi-Day Plan</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cost = Daily Rate × Number of Days. Tailored for weekend highway getaways, tourists,
                and weekly city commuters looking for the highest cost efficiency.
              </p>
              <ul className="space-y-2 text-xs text-slate-200 pt-2 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Overnight retention with secure combination locking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Includes multi-day fast charger for Electric 2-wheelers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How The Rental System Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Seamlessly reserve online, check in with photo ID, and return to any authorized hub station.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Select Bike & Dates',
              desc: 'Browse verified specs and pick your requested pickup & return window.',
            },
            {
              step: '02',
              title: 'Check Real Availability',
              desc: 'Automated conflict detection prevents overlapping bookings.',
            },
            {
              step: '03',
              title: 'Pickup at Station Hub',
              desc: 'Present your driver’s license or photo ID to complete quick safety check.',
            },
            {
              step: '04',
              title: 'Ride & Return',
              desc: 'Return to any hub. Security deposit released immediately upon inspection.',
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 text-left space-y-2 relative"
            >
              <span className="text-3xl font-black text-emerald-600/30 block mb-1">
                {s.step}
              </span>
              <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {onOpenPoliciesModal && (
          <div className="text-center mt-8">
            <button
              onClick={onOpenPoliciesModal}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1"
            >
              <FileCheck className="w-4 h-4" />
              <span>Review full security deposit, damage matrix, and fuel policies</span>
            </button>
          </div>
        )}
      </section>

      {/* 6. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-600 text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl shadow-emerald-600/20">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Explore the City on Two Wheels?
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Reserve your bike now with guaranteed availability, zero hidden costs, and comprehensive safety gear included.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => onNavigate('bikes')}
              className="py-3 px-8 rounded-xl font-bold text-sm text-emerald-900 bg-white hover:bg-emerald-50 transition-all shadow-md"
            >
              Browse Fleet & Book
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="py-3 px-8 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 border border-emerald-500 transition-all"
            >
              Read About Safety & Hubs
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
