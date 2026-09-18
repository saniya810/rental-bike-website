import React from 'react';
import { Bike, ShieldCheck, Users, Clock, MapPin, Award, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
  onOpenPoliciesModal?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenPoliciesModal }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Platform Overview & Operations</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Modern Bike Rental Infrastructure Built for the City.
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          RentalBike provides a unified fleet management and self-service bike reservation platform.
          Whether you are a university student commuting between campus halls, a traveling enthusiast
          exploring mountain switchbacks, or a daily city commuter avoiding vehicle traffic, our fleet
          ensures dependable two-wheel mobility.
        </p>
      </div>

      {/* Target Audiences Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Designed for Every Type of Rider
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-base text-slate-900">Students & Campus Mobility</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Affordable hourly rates, conveniently placed quad hubs, and quick digital verification
              enable college students to move quickly between lectures, libraries, and off-campus housing.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-base text-slate-900">Daily Urban Commuters</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Skip peak subway congestion and vehicle parking bottlenecks. Our high-torque electric and
              commuter bikes offer reliable transit with docking hubs right next to major transit stations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-base text-slate-900">Tourists & Weekend Adventurers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Discover parks, waterfronts, and skyline paths with multi-day discount packages, included
              protective helmets, phone mounts, and trail-certified mountain suspensions.
            </p>
          </div>
        </div>
      </section>

      {/* Fleet Maintenance & Safety Standards */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white space-y-6">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Safety & Maintenance Protocols
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Multi-Point Pre-Ride Fleet Certification
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every bike is tracked in our database with real-time condition logs, inspection checklists,
            and automated maintenance alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white block">Hydraulic Brake Tuning</span>
            <p className="text-slate-300">Rigorously tested stopping distance and pad wear before check-in.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white block">Calibrated Tire PSI</span>
            <p className="text-slate-300">Puncture-resistant Kevlar casing inflated to optimal road pressure.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white block">E-Bike Battery Health</span>
            <p className="text-slate-300">Lithium-ion cells checked with cell telemetry and ≥90% charge.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white block">Sanitized Safety Gear</span>
            <p className="text-slate-300">CPSC certified helmets and heavy-duty locks disinfected after every ride.</p>
          </div>
        </div>
      </section>

      {/* Hub Stations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Physical Station Network
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              name: 'Central Park Hub',
              address: 'North Meadow Gate 4, Central Park W',
              hours: '07:00 AM – 10:00 PM',
              bikes: '24 Available Racks',
            },
            {
              name: 'Downtown Transit Terminal',
              address: 'Concourse B, Terminal Station Plaza',
              hours: '06:00 AM – 11:00 PM',
              bikes: '36 Available Racks',
            },
            {
              name: 'University Campus Quad',
              address: 'Student Union Pavilion, 200 Campus Rd',
              hours: '07:00 AM – 10:00 PM',
              bikes: '18 Available Racks',
            },
            {
              name: 'Westside Waterfront',
              address: 'Pier 64 Marine Boardwalk Way',
              hours: '07:00 AM – 10:00 PM',
              bikes: '20 Available Racks',
            },
          ].map((hub, idx) => (
            <div key={idx} className="p-5 rounded-3xl bg-white border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{hub.name}</span>
              </div>
              <p className="text-slate-600">{hub.address}</p>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-400 font-medium">
                <span>{hub.hours}</span>
                <span className="text-emerald-600 font-semibold">{hub.bikes}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-8 rounded-3xl bg-emerald-50 border border-emerald-200 gap-4">
        <div>
          <h3 className="text-lg font-bold text-emerald-950">Ready to start your ride?</h3>
          <p className="text-xs text-emerald-700 mt-0.5">
            Book online in under 2 minutes with real-time slot checking.
          </p>
        </div>
        <div className="flex gap-3">
          {onOpenPoliciesModal && (
            <button
              onClick={onOpenPoliciesModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-100 transition-colors"
            >
              Review Policies
            </button>
          )}
          <button
            onClick={() => onNavigate('bikes')}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Browse Fleet
          </button>
        </div>
      </div>
    </div>
  );
};
