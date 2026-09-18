import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Bike as BikeIcon,
  Calendar,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  FileCheck,
  Sliders,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Loader2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  Bike,
  Booking,
  User,
  Inspection,
  RentalPolicies,
  AdminStats,
  BikeType,
  BikeCondition,
  BikeAvailability,
  VehicleCategory,
} from '../types.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { formatINR } from '../utils/currency.js';

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
  onFleetUpdated: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  onFleetUpdated,
}) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'bikes' | 'bookings' | 'inspections' | 'policies' | 'users' | 'database'
  >('bikes');

  // Stats & Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [policies, setPolicies] = useState<RentalPolicies | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Bike Edit/Add Modal State
  const [isBikeModalOpen, setIsBikeModalOpen] = useState<boolean>(false);
  const [editingBike, setEditingBike] = useState<Partial<Bike> | null>(null);
  const [isSavingBike, setIsSavingBike] = useState<boolean>(false);

  // Inspection Modal State
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState<boolean>(false);
  const [selectedBookingForInspection, setSelectedBookingForInspection] = useState<Booking | null>(null);
  const [inspectionType, setInspectionType] = useState<'pre-rental' | 'post-rental'>('pre-rental');
  const [inspectionCondition, setInspectionCondition] = useState<BikeCondition>('Good');
  const [inspectionDamage, setInspectionDamage] = useState<string>('');
  const [damageFee, setDamageFee] = useState<number>(0);
  const [isSavingInspection, setIsSavingInspection] = useState<boolean>(false);

  // Policy Form State
  const [editingPolicies, setEditingPolicies] = useState<RentalPolicies | null>(null);
  const [isSavingPolicies, setIsSavingPolicies] = useState<boolean>(false);

  // SQL Schema Copy helper
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, bikesRes, bookingsRes, inspRes, polRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getBikes(),
        api.getAdminBookings(),
        api.getAdminInspections(),
        api.getPolicies(),
        api.getAdminUsers(),
      ]);

      setStats(statsRes.stats);
      setBikes(bikesRes.bikes);
      setBookings(bookingsRes.bookings);
      setInspections(inspRes.inspections);
      setPolicies(polRes.policies);
      setEditingPolicies(polRes.policies);
      setUsers(usersRes.users);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Bike & Motorcycle CRUD Operations
  const handleOpenAddBike = (preferredType: VehicleCategory = 'motorcycle') => {
    if (preferredType === 'motorcycle') {
      setEditingBike({
        name: '',
        brand: 'Royal Enfield',
        model: 'Classic 350',
        vehicleType: 'motorcycle',
        bikeType: 'Cruiser / Modern Classic',
        hourlyPrice: 120,
        dailyPrice: 950,
        availability: 'Available',
        bikeCondition: 'Good',
        location: 'Indiranagar Hub & Metro Station',
        description: 'Iconic modern classic 350cc thumper motorcycle featuring smooth counterbalanced J-series engine, dual-channel ABS, and comfortable touring ergonomics.',
        imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        specifications: {
          frameMaterial: 'Twin Downtube Spine Frame',
          gears: '5-Speed Constant Mesh',
          brakes: 'Dual-Channel ABS Discs (300mm Front / 270mm Rear)',
          weightKg: 195,
          wheelSizeInch: 19,
          suitableHeightCm: '160cm - 190cm',
          helmetIncluded: true,
          lockIncluded: true,
          engineCc: 349,
          powerBhp: '20.2 bhp @ 6100 rpm',
          fuelType: 'Petrol (BS6 Phase 2)',
          transmission: '5-Speed Manual',
          mileageKmpl: 36.2,
          topSpeedKmph: 114,
          tankCapacityLiters: 13,
        },
      });
    } else {
      setEditingBike({
        name: '',
        brand: 'Trek',
        model: 'FX 3 Disc',
        vehicleType: 'bike',
        bikeType: 'City / Commuter',
        hourlyPrice: 40,
        dailyPrice: 250,
        availability: 'Available',
        bikeCondition: 'Good',
        location: 'Indiranagar Hub & Metro Station',
        description: 'Lightweight urban commuter bicycle engineered with an alloy frame and hydraulic disc brakes for daily city travel.',
        imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
        specifications: {
          frameMaterial: 'Alpha Gold Aluminum',
          gears: '1x10 Speed Shimano Deore',
          brakes: 'Shimano Hydraulic Disc',
          weightKg: 11.5,
          wheelSizeInch: 28,
          suitableHeightCm: '160cm - 185cm',
          helmetIncluded: true,
          lockIncluded: true,
        },
      });
    }
    setIsBikeModalOpen(true);
  };

  const handleOpenEditBike = (b: Bike) => {
    setEditingBike({ ...b });
    setIsBikeModalOpen(true);
  };

  const handleDeleteBike = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this bike from the fleet?')) return;
    try {
      await api.deleteBike(id);
      showNotification('Bike removed from fleet successfully.');
      loadAllAdminData();
      onFleetUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to delete bike');
    }
  };

  const handleSaveBike = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBike || !editingBike.name) return;
    setIsSavingBike(true);
    try {
      if (editingBike.id) {
        await api.updateBike(editingBike.id, editingBike);
        showNotification('Bike specifications updated successfully.');
      } else {
        await api.createBike(editingBike as any);
        showNotification('New bike added to fleet catalog.');
      }
      setIsBikeModalOpen(false);
      setEditingBike(null);
      loadAllAdminData();
      onFleetUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to save bike.');
    } finally {
      setIsSavingBike(false);
    }
  };

  const handleToggleAvailability = async (bike: Bike, newStatus: BikeAvailability) => {
    try {
      await api.updateBike(bike.id, { availability: newStatus });
      showNotification(`${bike.name} status updated to ${newStatus}`);
      loadAllAdminData();
      onFleetUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  // Booking Management
  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: any,
    paymentStatus?: any
  ) => {
    try {
      await api.updateBookingStatus(bookingId, { status, paymentStatus });
      showNotification(`Booking ${bookingId.slice(0, 10)} status updated to ${status}.`);
      loadAllAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to update booking');
    }
  };

  // Inspection Management
  const handleOpenInspectionModal = (b: Booking, type: 'pre-rental' | 'post-rental') => {
    setSelectedBookingForInspection(b);
    setInspectionType(type);
    setInspectionCondition(b.bike?.bikeCondition || 'Good');
    setInspectionDamage('');
    setDamageFee(0);
    setIsInspectionModalOpen(true);
  };

  const handleSaveInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForInspection) return;
    setIsSavingInspection(true);
    try {
      await api.createInspection({
        bookingId: selectedBookingForInspection.id,
        bikeId: selectedBookingForInspection.bikeId,
        inspectorName: user?.name || 'Fleet Administrator',
        inspectionType: inspectionType === 'pre-rental' ? 'pre_rental' : 'post_rental',
        bikeCondition: inspectionCondition as any,
        damageDetails: inspectionDamage.trim() || 'No damage recorded. Certified road-worthy.',
        damageCharges: damageFee > 0 ? damageFee : 0,
      });
      showNotification(`${inspectionType} inspection recorded.`);
      setIsInspectionModalOpen(false);
      setSelectedBookingForInspection(null);
      loadAllAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to save inspection.');
    } finally {
      setIsSavingInspection(false);
    }
  };

  // Policy Save
  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicies) return;
    setIsSavingPolicies(true);
    try {
      await api.updatePolicies(editingPolicies);
      showNotification('Official rental policies and deposit rules updated.');
      loadAllAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to update policies');
    } finally {
      setIsSavingPolicies(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500">
          You must sign in with an Administrator account (admin@bikeshare.com) to access fleet
          operations, booking approvals, and damage inspections.
        </p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
        >
          Switch to Admin Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Fleet Operations & Admin Dashboard
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">
              Admin Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time management of {bikes.length} bikes, reservations, safety inspections, and billing policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllAdminData}
            title="Refresh Live Data"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              id="admin-add-motorcycle-btn"
              onClick={() => handleOpenAddBike('motorcycle')}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Motorcycle</span>
            </button>
            <button
              id="admin-add-bike-btn"
              onClick={() => handleOpenAddBike('bike')}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bicycle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real Computed Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Fleet</span>
            <div className="text-2xl font-black text-slate-900">{stats.totalBikes}</div>
            <span className="text-[10px] text-slate-500">2-Wheelers & Bikes</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Available Now</span>
            <div className="text-2xl font-black text-emerald-600">{stats.availableBikes}</div>
            <span className="text-[10px] text-emerald-700">Ready for pickup</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Active Rides</span>
            <div className="text-2xl font-black text-amber-600">{stats.activeBookings ?? stats.activeRentals ?? 0}</div>
            <span className="text-[10px] text-amber-700">Currently out</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Maintenance</span>
            <div className="text-2xl font-black text-rose-600">{stats.maintenanceBikes ?? stats.inMaintenance ?? 0}</div>
            <span className="text-[10px] text-rose-700">In workshop</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Total Bookings</span>
            <div className="text-2xl font-black text-blue-600">{stats.totalBookings}</div>
            <span className="text-[10px] text-blue-700">All reservations</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Gross Revenue</span>
            <div className="text-2xl font-black text-slate-900">{formatINR(stats.totalRevenue)}</div>
            <span className="text-[10px] text-slate-500">Live booking total</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        {[
          { id: 'bikes', label: `Fleet Catalog (${bikes.length})`, icon: BikeIcon },
          { id: 'bookings', label: `Bookings Feed (${bookings.length})`, icon: Calendar },
          { id: 'inspections', label: `Inspections & Damage (${inspections.length})`, icon: FileCheck },
          { id: 'policies', label: 'Rental Policies', icon: Sliders },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'database', label: 'Database & SQL Architecture', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BIKES MANAGEMENT */}
      {activeTab === 'bikes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Vehicle Details</th>
                    <th className="p-4">Category & Specs</th>
                    <th className="p-4">Location Hub</th>
                    <th className="p-4">Rental Rates</th>
                    <th className="p-4">Status Toggle</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bikes.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={b.imageUrl}
                          alt={b.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {b.vehicleType === 'motorcycle' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                Motorcycle
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Bicycle
                              </span>
                            )}
                            <span className="font-bold text-slate-900">{b.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {b.brand} • {b.model}
                            {b.specifications?.engineCc ? ` • ${b.specifications.engineCc}cc` : ''}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-800 block">{b.bikeType}</span>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                          Condition: {b.bikeCondition}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 max-w-[180px] truncate">{b.location}</td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">{formatINR(b.hourlyPrice)}/hr</div>
                        <div className="text-[11px] text-slate-500">{formatINR(b.dailyPrice)}/day</div>
                      </td>

                      <td className="p-4">
                        <select
                          value={b.availability}
                          onChange={(e) =>
                            handleToggleAvailability(b, e.target.value as BikeAvailability)
                          }
                          className={`p-1.5 rounded-lg text-xs font-bold border ${
                            b.availability === 'Available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : b.availability === 'Rented'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <option value="Available">Available</option>
                          <option value="Rented">Rented</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </td>

                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditBike(b)}
                          className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Bike"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBike(b.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Bike"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS FEED */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Booking ID / User</th>
                    <th className="p-4">Bike Reserved</th>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Total Authorized</th>
                    <th className="p-4">Status Workflow</th>
                    <th className="p-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-800 block">
                          {b.id.slice(0, 10)}
                        </span>
                        <span className="text-slate-500">{b.userEmail || b.user?.email || b.userId.slice(0, 8)}</span>
                        {b.drivingLicenseNumber && (
                          <span className="text-[10px] text-slate-400 block">
                            DL: {b.drivingLicenseNumber}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">
                          {b.bike?.brand} {b.bike?.name}
                        </span>
                        <span className="text-slate-500">{b.pickupLocation}</span>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <span className="text-slate-700 block">
                          Pickup: {b.pickupDate} ({b.pickupTime})
                        </span>
                        <span className="text-slate-500 block">
                          Return: {b.returnDate} ({b.returnTime})
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          Duration: {b.rentalType === 'hourly' ? `${b.durationHours} hrs` : `${b.durationDays} days`}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-black text-slate-900 text-sm block">
                          {formatINR(b.totalAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (Deposit: {formatINR(b.securityDeposit)})
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={b.bookingStatus || (b as any).status || 'upcoming'}
                          onChange={(e) =>
                            handleUpdateBookingStatus(b.id, e.target.value as any)
                          }
                          className="p-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white"
                        >
                          <option value="upcoming">Upcoming / Confirmed</option>
                          <option value="active">Active On Ride</option>
                          <option value="completed">Completed / Returned</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenInspectionModal(b, 'pre-rental')}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="Record Pre-Rental Inspection"
                        >
                          Pre-Check
                        </button>
                        <button
                          onClick={() => handleOpenInspectionModal(b, 'post-rental')}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Record Post-Rental Check-in"
                        >
                          Check-In
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INSPECTIONS & DAMAGE */}
      {activeTab === 'inspections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Safety & Damage Inspection Log</h3>
            <span className="text-xs text-slate-500">
              {inspections.length} recorded fleet inspections
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Inspection Type</th>
                    <th className="p-4">Bike & Booking</th>
                    <th className="p-4">Condition</th>
                    <th className="p-4">Damage Notes</th>
                    <th className="p-4">Damage Charge</th>
                    <th className="p-4">Inspected At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspections.map((insp) => (
                    <tr key={insp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            insp.inspectionType === 'pre_rental'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {insp.inspectionType === 'pre_rental' ? 'Pre-Rental' : 'Post-Rental'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">
                          Bike ID: {insp.bikeId.slice(0, 8)}
                        </span>
                        <span className="text-slate-500 font-mono">
                          Booking: {insp.bookingId.slice(0, 10)}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-800">{insp.bikeCondition}</span>
                      </td>

                      <td className="p-4 text-slate-600 max-w-xs">
                        {insp.damageDetails || 'No damage recorded. Certified road-worthy.'}
                      </td>

                      <td className="p-4">
                        {insp.damageCharges && insp.damageCharges > 0 ? (
                          <span className="font-bold text-rose-600">{formatINR(insp.damageCharges)}</span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400">
                        {new Date(insp.inspectedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RENTAL POLICIES MANAGEMENT */}
      {activeTab === 'policies' && editingPolicies && (
        <form onSubmit={handleSavePolicies} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Rental Operating Policies & Deposit Matrix</h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure standard deposits, late penalty hourly rates, fuel rules, and liability conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Bicycle Deposit (₹)</label>
              <input
                type="number"
                value={editingPolicies.securityDepositStandard}
                onChange={(e) =>
                  setEditingPolicies({
                    ...editingPolicies,
                    securityDepositStandard: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Electric / E-Bike Deposit (₹)</label>
              <input
                type="number"
                value={editingPolicies.securityDepositElectric}
                onChange={(e) =>
                  setEditingPolicies({
                    ...editingPolicies,
                    securityDepositElectric: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Motorcycle / 2-Wheeler Deposit (₹)</label>
              <input
                type="number"
                value={editingPolicies.securityDepositMotorcycle || 2500}
                onChange={(e) =>
                  setEditingPolicies({
                    ...editingPolicies,
                    securityDepositMotorcycle: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Late Return Fee (₹/hour)</label>
              <input
                type="number"
                value={editingPolicies.lateFeePerHour}
                onChange={(e) =>
                  setEditingPolicies({
                    ...editingPolicies,
                    lateFeePerHour: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                value={editingPolicies.gracePeriodMinutes || 30}
                onChange={(e) =>
                  setEditingPolicies({
                    ...editingPolicies,
                    gracePeriodMinutes: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fuel / Battery Policy Statement</label>
              <input
                type="text"
                value={editingPolicies.fuelPolicy}
                onChange={(e) =>
                  setEditingPolicies({ ...editingPolicies, fuelPolicy: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cancellation Policy Statement</label>
              <input
                type="text"
                value={editingPolicies.cancellationPolicy}
                onChange={(e) =>
                  setEditingPolicies({ ...editingPolicies, cancellationPolicy: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Traffic Fine Responsibility Clause</label>
              <input
                type="text"
                value={editingPolicies.trafficFineResponsibility}
                onChange={(e) =>
                  setEditingPolicies({ ...editingPolicies, trafficFineResponsibility: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Driver’s License & Age Requirements</label>
              <input
                type="text"
                value={editingPolicies.drivingLicenceRequirements}
                onChange={(e) =>
                  setEditingPolicies({ ...editingPolicies, drivingLicenceRequirements: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingPolicies}
            className="py-3 px-6 rounded-2xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isSavingPolicies && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Updated Rental Policies</span>
          </button>
        </form>
      )}

      {/* TAB 5: REGISTERED USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Driver’s License ID</th>
                  <th className="p-4">Joined At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4 text-slate-600 font-mono">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{u.phone || '—'}</td>
                    <td className="p-4 font-mono text-slate-700">{u.drivingLicenseNumber || '—'}</td>
                    <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: DATABASE & SQL ARCHITECTURE */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">PostgreSQL / Supabase Database Architecture</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified relational database service with automatic fallback persistence
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Backend Database Service Online</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The application backend utilizes a persistent relational schema in <code>/supabase/schema.sql</code>.
              When <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> are provided in the environment,
              it connects to your live hosted Supabase PostgreSQL cluster. In the local container runtime, it operates
              automatically on the file-backed relational data layer (<code>data/database.json</code>) without crashing.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2 overflow-x-auto">
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
                <span>SQL Schema Tables & Row-Level Security</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `-- Complete SQL schema located in /supabase/schema.sql\n-- Tables: users, bikes, bookings, reviews, inspections, wishlist, cart, rental_policies`
                    );
                    setCopiedSchema(true);
                    setTimeout(() => setCopiedSchema(false), 2000);
                  }}
                  className="hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied' : 'Copy Schema Info'}</span>
                </button>
              </div>
              <pre className="text-slate-300">
{`CREATE TABLE bikes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  bike_type TEXT NOT NULL,
  hourly_price NUMERIC NOT NULL,
  daily_price NUMERIC NOT NULL,
  availability TEXT NOT NULL DEFAULT 'Available',
  bike_condition TEXT NOT NULL DEFAULT 'Good'
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  bike_id TEXT REFERENCES bikes(id),
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed'
);`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE (BIKE / MOTORCYCLE) ADD / EDIT MODAL */}
      {isBikeModalOpen && editingBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    editingBike.vehicleType === 'motorcycle'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {editingBike.vehicleType === 'motorcycle' ? 'Motorcycle / 2-Wheeler' : 'Bicycle / E-Bike'}
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  {editingBike.id ? 'Edit Fleet Vehicle' : (editingBike.vehicleType === 'motorcycle' ? 'Add Motorcycle to Fleet' : 'Add Bicycle to Fleet')}
                </h3>
              </div>
              <button
                onClick={() => setIsBikeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBike} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Vehicle Type Switcher */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-700 mb-1.5">Vehicle Fleet Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBike({
                        ...editingBike,
                        vehicleType: 'motorcycle',
                        bikeType: 'Cruiser / Modern Classic',
                      })
                    }
                    className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                      editingBike.vehicleType === 'motorcycle'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🏍️ Motorcycle / 2-Wheeler
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBike({
                        ...editingBike,
                        vehicleType: 'bike',
                        bikeType: 'City / Commuter',
                      })
                    }
                    className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                      editingBike.vehicleType !== 'motorcycle'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🚲 Bicycle / E-Bike
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editingBike.vehicleType === 'motorcycle' ? 'Motorcycle Name' : 'Bicycle Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={editingBike.vehicleType === 'motorcycle' ? 'Royal Enfield Classic 350' : 'Trek FX 3 Disc'}
                    value={editingBike.name || ''}
                    onChange={(e) => setEditingBike({ ...editingBike, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand / Make</label>
                  <input
                    type="text"
                    required
                    placeholder={editingBike.vehicleType === 'motorcycle' ? 'Royal Enfield' : 'Trek'}
                    value={editingBike.brand || ''}
                    onChange={(e) => setEditingBike({ ...editingBike, brand: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model / Variant</label>
                  <input
                    type="text"
                    required
                    placeholder={editingBike.vehicleType === 'motorcycle' ? 'Classic 350 Dual Channel' : 'FX 3 Disc'}
                    value={editingBike.model || ''}
                    onChange={(e) => setEditingBike({ ...editingBike, model: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sub-Category</label>
                  <select
                    value={editingBike.bikeType}
                    onChange={(e) =>
                      setEditingBike({ ...editingBike, bikeType: e.target.value as BikeType })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  >
                    {editingBike.vehicleType === 'motorcycle' ? (
                      <>
                        <option value="Cruiser / Modern Classic">Cruiser / Modern Classic</option>
                        <option value="Naked / Streetfighter">Naked / Streetfighter</option>
                        <option value="Sports / Supersport">Sports / Supersport</option>
                        <option value="Commuter / Street">Commuter / Street</option>
                        <option value="Cruiser">Cruiser</option>
                      </>
                    ) : (
                      <>
                        <option value="Electric / E-Bike">Electric / E-Bike</option>
                        <option value="Mountain">Mountain</option>
                        <option value="City / Commuter">City / Commuter</option>
                        <option value="Road / Racing">Road / Racing</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Cruiser">Cruiser</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hourly Price (₹/hr)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editingBike.hourlyPrice || 0}
                    onChange={(e) =>
                      setEditingBike({ ...editingBike, hourlyPrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Price (₹/day)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editingBike.dailyPrice || 0}
                    onChange={(e) =>
                      setEditingBike({ ...editingBike, dailyPrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hub Station Location</label>
                  <input
                    type="text"
                    required
                    value={editingBike.location || ''}
                    onChange={(e) => setEditingBike({ ...editingBike, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Availability</label>
                  <select
                    value={editingBike.availability}
                    onChange={(e) =>
                      setEditingBike({
                        ...editingBike,
                        availability: e.target.value as BikeAvailability,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* TECHNICAL SPECIFICATIONS SECTION */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Technical Specifications & Hardware</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {editingBike.vehicleType === 'motorcycle' ? 'Engine & Performance Metrics' : 'Frame & Drivetrain Metrics'}
                  </span>
                </h4>

                {editingBike.vehicleType === 'motorcycle' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Engine CC</label>
                      <input
                        type="number"
                        placeholder="349"
                        value={editingBike.specifications?.engineCc || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              engineCc: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Power (bhp)</label>
                      <input
                        type="text"
                        placeholder="20.2 bhp"
                        value={editingBike.specifications?.powerBhp || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              powerBhp: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Torque (Nm)</label>
                      <input
                        type="text"
                        placeholder="27 Nm @ 4000 rpm"
                        value={editingBike.specifications?.torqueNm || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              torqueNm: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Mileage (kmpl)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="36"
                        value={editingBike.specifications?.mileageKmpl || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              mileageKmpl: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Fuel Tank (Litres)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="13"
                        value={editingBike.specifications?.tankCapacityLiters || editingBike.specifications?.fuelCapacityLitres || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              tankCapacityLiters: val,
                              fuelCapacityLitres: val,
                            },
                          });
                        }}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Seat Height (mm)</label>
                      <input
                        type="number"
                        placeholder="805"
                        value={editingBike.specifications?.seatHeightMm || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              seatHeightMm: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Top Speed (km/h)</label>
                      <input
                        type="number"
                        placeholder="115"
                        value={editingBike.specifications?.topSpeedKmph || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              topSpeedKmph: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Transmission</label>
                      <input
                        type="text"
                        placeholder="5-Speed Manual"
                        value={editingBike.specifications?.transmission || editingBike.specifications?.gears || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              transmission: e.target.value,
                              gears: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Braking System</label>
                      <input
                        type="text"
                        placeholder="Dual-Channel ABS Discs"
                        value={editingBike.specifications?.brakes || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              brakes: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Frame Material</label>
                      <input
                        type="text"
                        placeholder="Aluminum Alloy"
                        value={editingBike.specifications?.frameMaterial || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              frameMaterial: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Gears / Derailleur</label>
                      <input
                        type="text"
                        placeholder="8-Speed Shimano"
                        value={editingBike.specifications?.gears || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              gears: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Brakes</label>
                      <input
                        type="text"
                        placeholder="Mechanical / Hydraulic Disc"
                        value={editingBike.specifications?.brakes || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              brakes: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="12.5"
                        value={editingBike.specifications?.weightKg || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              weightKg: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Wheel Size (Inch)</label>
                      <input
                        type="number"
                        placeholder="28"
                        value={editingBike.specifications?.wheelSizeInch || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              wheelSizeInch: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Rider Height Range</label>
                      <input
                        type="text"
                        placeholder="160cm - 185cm"
                        value={editingBike.specifications?.suitableHeightCm || ''}
                        onChange={(e) =>
                          setEditingBike({
                            ...editingBike,
                            specifications: {
                              ...editingBike.specifications,
                              suitableHeightCm: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Image URL</label>
                <input
                  type="url"
                  required
                  value={editingBike.imageUrl || ''}
                  onChange={(e) => setEditingBike({ ...editingBike, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Overview</label>
                <textarea
                  rows={3}
                  value={editingBike.description || ''}
                  onChange={(e) => setEditingBike({ ...editingBike, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBikeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBike}
                  className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {isSavingBike && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Fleet Vehicle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECTION MODAL */}
      {isInspectionModalOpen && selectedBookingForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                Record {inspectionType === 'pre-rental' ? 'Pre-Rental' : 'Post-Rental'} Inspection
              </h3>
              <button
                onClick={() => setIsInspectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Booking: <strong>{selectedBookingForInspection.id.slice(0, 10)}</strong> • Bike:{' '}
              <strong>{selectedBookingForInspection.bike?.name}</strong>
            </p>

            <form onSubmit={handleSaveInspection} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Observed Bike Condition</label>
                <select
                  value={inspectionCondition}
                  onChange={(e) => setInspectionCondition(e.target.value as BikeCondition)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="Excellent">Excellent (Like New)</option>
                  <option value="Good">Good (Normal Wear)</option>
                  <option value="Fair">Fair (Minor Scratches)</option>
                  <option value="Needs Repair">Needs Repair (Mechanical or Tire Issue)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Damage Description (if any)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Minor chain rub, flat rear tire, or brake lever alignment..."
                  value={inspectionDamage}
                  onChange={(e) => setInspectionDamage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              {inspectionType === 'post-rental' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Assessed Damage Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={damageFee}
                    onChange={(e) => setDamageFee(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Deducted from the {formatINR(selectedBookingForInspection.securityDeposit)} security deposit hold
                  </span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsInspectionModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingInspection}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5"
                >
                  {isSavingInspection && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Inspection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
