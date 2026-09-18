import React from 'react';
import { X, ShieldAlert, Clock, BatteryCharging, AlertTriangle, FileText, CheckCircle2, IndianRupee } from 'lucide-react';
import { RentalPolicies } from '../types.js';
import { formatINR } from '../utils/currency.js';

interface RentalPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies?: RentalPolicies;
}

export const RentalPoliciesModal: React.FC<RentalPoliciesModalProps> = ({
  isOpen,
  onClose,
  policies,
}) => {
  if (!isOpen) return null;

  const policyList = [
    {
      icon: IndianRupee,
      title: '1. Security Deposit',
      value: policies
        ? `${formatINR(policies.securityDepositStandard)} for Cycles • ${formatINR(policies.securityDepositElectric)} for E-Bikes • ${formatINR(policies.securityDepositMotorcycle || 2500)} for Motorcycles`
        : '₹500 Cycles • ₹1,000 E-Bikes • ₹2,500 Motorcycles',
      detail:
        'Authorized as a temporary refundable security hold upon checkout. Automatically released back to your original payment method immediately upon inspection and undamaged check-in.',
    },
    {
      icon: AlertTriangle,
      title: '2. Damage Charges Matrix',
      value: policies?.damageChargesPolicy || 'Itemized based on certified OEM maintenance schedule.',
      detail:
        'Standard repair charges: Puncture repair: ₹150; Bent rim/alloy: ₹1,500; Chain/sprocket wear: ₹800; Mirror/indicator broken: ₹450; Body panel or engine damage: authorized workshop estimate.',
    },
    {
      icon: Clock,
      title: '3. Late Return Charges',
      value: policies?.lateReturnChargesPolicy || '30-minute grace period applies.',
      detail: `A 30-minute grace period is provided. Overdue returns beyond grace period are billed at ${formatINR(policies?.lateFeePerHour || 150)}/hour plus standard rental rate to protect scheduled bookings.`,
    },
    {
      icon: BatteryCharging,
      title: '4. Fuel & Battery Policy',
      value: policies?.fuelPolicy || 'Motorcycles: Level-to-level return. E-Bikes: 90%+ battery provided.',
      detail:
        'Motorcycles must be returned with the same fuel level as recorded at pickup. E-bikes must be returned with at least 20% charge. Fuel shortage is charged at prevailing pump rates plus a ₹100 service fee.',
    },
    {
      icon: CheckCircle2,
      title: '5. Cancellation Policy',
      value: policies?.cancellationPolicy || '100% refund up to 4 hours prior to pickup.',
      detail:
        'Free cancellation with 100% full refund if cancelled at least 4 hours before pickup time. Cancellations within 4 hours incur a 50% reservation fee.',
    },
    {
      icon: Clock,
      title: '6. Rental Extension Charges',
      value: policies?.rentalExtensionChargesPolicy || 'Extend anytime from My Bookings.',
      detail:
        'Need to extend your ride? You can extend your active rental directly from your account dashboard anytime, billed at standard rates provided no overlapping booking exists.',
    },
    {
      icon: ShieldAlert,
      title: '7. Traffic Fine & Challan Responsibility',
      value: policies?.trafficFineResponsibility || 'Renter assumes 100% legal responsibility.',
      detail:
        'Renters are 100% liable for all e-challans, traffic violations, overspeeding fines, helmet citations, and impound fees incurred during the rental window. Helmet is compulsory for rider and pillion.',
    },
    {
      icon: FileText,
      title: '8. Driving Licence & Identification',
      value: policies?.drivingLicenceRequirements || 'Must possess valid Indian Driving License (MCWG for geared motorcycles).',
      detail:
        'For motorcycles, an original Indian Driving License (MCWG or suitable 2-wheeler category) is mandatory. For bicycles, any valid Government Photo ID (Aadhaar / Voter ID / Passport) is accepted.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        id="rental-policies-modal"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Rental Policies & Conditions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official operating policies, deposit guidelines, and damage schedule
            </p>
          </div>
          <button
            id="close-policies-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Policy Cards */}
        <div className="p-6 overflow-y-auto space-y-4">
          {policyList.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">{item.value}</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">All terms governed by local transit regulations</span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
