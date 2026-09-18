export type VehicleCategory = 'bike' | 'motorcycle';

export type BikeType =
  | 'Mountain'
  | 'City / Commuter'
  | 'Electric / E-Bike'
  | 'Road / Racing'
  | 'Hybrid'
  | 'Cruiser'
  | 'Cruiser / Modern Classic'
  | 'Sports / Supersport'
  | 'Naked / Streetfighter'
  | 'Commuter / Street';

export type BikeCondition = 'Excellent' | 'Good' | 'Fair' | 'Needs Inspection';

export type AvailabilityStatus = 'Available' | 'Rented' | 'Maintenance';
export type BikeAvailability = AvailabilityStatus;

export type RentalType = 'hourly' | 'daily';

export type BookingStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  drivingLicenseNumber?: string;
  createdAt: string;
}

export interface BikeSpecifications {
  frameMaterial?: string;
  gears?: string;
  brakes?: string;
  weightKg?: number;
  wheelSizeInch?: number;
  batteryCapacity?: string; // For E-Bikes
  maxRangeKm?: number;      // For E-Bikes
  motorPower?: string;      // For E-Bikes
  suitableHeightCm?: string;
  helmetIncluded?: boolean;
  lockIncluded?: boolean;
  // Motorcycle / 2-wheeler specific specifications
  engineCc?: number;
  powerBhp?: string;
  torqueNm?: string;
  fuelType?: string;
  transmission?: string;
  mileageKmpl?: number;
  topSpeedKmph?: number;
  tankCapacityLiters?: number;
  fuelCapacityLitres?: number;
  seatHeightMm?: number;
}

export interface Bike {
  id: string;
  name: string;
  model: string;
  vehicleType?: VehicleCategory; // 'bike' for cycle/e-bike or 'motorcycle' for 2-wheeler
  bikeType: BikeType;
  brand: string;
  imageUrl: string;
  galleryUrls?: string[];
  specifications: BikeSpecifications;
  hourlyPrice: number;
  dailyPrice: number;
  availability: AvailabilityStatus;
  bikeCondition: BikeCondition;
  rating: number;
  reviewCount: number;
  location: string;
  description?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  bikeId: string;
  bike?: Bike;
  rentalType: RentalType;
  pickupDate: string;  // YYYY-MM-DD
  pickupTime: string;  // HH:MM
  returnDate: string;  // YYYY-MM-DD
  returnTime: string;  // HH:MM
  pickupLocation: string;
  durationHours: number;
  durationDays: number;
  rentalCost: number;
  securityDeposit: number;
  taxes: number;
  additionalCharges: number;
  totalAmount: number;
  bookingStatus: BookingStatus;
  status?: BookingStatus;
  user?: { id: string; name?: string; email?: string };
  paymentStatus: PaymentStatus;
  paymentProvider: string;
  drivingLicenseNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Inspection {
  id: string;
  bookingId: string;
  bikeId: string;
  bikeName?: string;
  inspectorName: string;
  inspectionType: 'pre_rental' | 'post_rental';
  bikeCondition: 'Pristine' | 'Minor Scratches' | 'Brake Wear' | 'Damaged' | 'Repaired';
  damageDetails: string;
  damageCharges: number;
  inspectedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  bikeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  bikeId: string;
  bike?: Bike;
  createdAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  bikeId: string;
  bike?: Bike;
  rentalType: RentalType;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupLocation: string;
  createdAt: string;
}

export interface RentalPolicies {
  securityDepositStandard: number;
  securityDepositElectric: number;
  securityDepositMotorcycle?: number;
  damageChargesPolicy: string;
  lateReturnChargesPolicy: string;
  lateFeePerHour: number;
  gracePeriodMinutes?: number;
  fuelPolicy: string;
  cancellationPolicy: string;
  rentalExtensionChargesPolicy: string;
  trafficFineResponsibility: string;
  drivingLicenceRequirements: string;
}

export interface PriceBreakdown {
  rentalType: RentalType;
  durationUnits: number;
  ratePerUnit: number;
  baseRentalCost: number;
  securityDeposit: number;
  taxes: number;
  additionalCharges: number;
  totalAmount: number;
}

export interface AvailabilityCheckResult {
  available: boolean;
  message: string;
  conflictingBooking?: {
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
  };
}

export interface AdminStats {
  totalBookings: number;
  activeBookings: number;
  activeRentals?: number;
  upcomingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  totalBikes: number;
  availableBikes: number;
  rentedBikes: number;
  maintenanceBikes: number;
  inMaintenance?: number;
  totalUsers: number;
  totalInspections: number;
  totalDamageChargesCollected: number;
}

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  bikes: Bike[];
  bookings: Booking[];
  inspections: Inspection[];
  reviews: Review[];
  wishlist: WishlistItem[];
  cart: CartItem[];
  policies: RentalPolicies;
}
