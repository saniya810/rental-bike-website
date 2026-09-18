import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Bike,
  Booking,
  User,
  Inspection,
  Review,
  WishlistItem,
  CartItem,
  RentalPolicies,
  PriceBreakdown,
  AvailabilityCheckResult,
  AdminStats,
} from '../src/types.js';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  bikes: Bike[];
  bookings: Booking[];
  inspections: Inspection[];
  reviews: Review[];
  wishlist: WishlistItem[];
  cart: CartItem[];
  policies: RentalPolicies;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Supabase client initialization (if credentials configured)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const isSupabaseConnected = Boolean(supabase);

// Default seed data with INR rates and motorcycle policy
const initialPolicies: RentalPolicies = {
  securityDepositStandard: 1000,
  securityDepositElectric: 2000,
  securityDepositMotorcycle: 3000,
  damageChargesPolicy:
    'Renter is liable for any physical damage beyond normal wear & tear. Itemized fees: Tyre puncture repair: ₹150; Chain/derailleur repair: ₹450; Bent rim repair: ₹800; Mirror/indicator breakage: ₹350; Frame or engine damage: authorized workshop quote.',
  lateReturnChargesPolicy:
    'A 30-minute courtesy grace period is provided. Subsequent overdue hours are charged at ₹150/hour plus the standard hourly rate.',
  lateFeePerHour: 150,
  gracePeriodMinutes: 30,
  fuelPolicy:
    'Motorcycles are dispatched with sufficient fuel to reach the nearest fuel station and must be returned with the same fuel level as recorded at handover. Electric 2-wheelers are provided at ≥90% charge and must be returned with at least 20% battery or a ₹150 recharge fee applies.',
  cancellationPolicy:
    'Free cancellation up to 4 hours before reserved pickup time for a 100% full refund to source. Cancellations made under 4 hours incur a 50% reservation fee.',
  rentalExtensionChargesPolicy:
    'Rental extensions can be requested anytime from My Bookings subject to vehicle availability at standard hourly or daily rates in INR.',
  trafficFineResponsibility:
    'The customer holds 100% legal responsibility for any traffic e-challans, speeding violations, red-light citations, or illegal parking fines incurred during active rental periods.',
  drivingLicenceRequirements:
    'All riders renting motorized 2-wheelers or motorcycles must possess a valid Indian Driving License (MCWG / Two Wheeler with Gear) or valid International Driving Permit (IDP). Non-motorized bicycle rentals require a valid government photo ID.',
};

const defaultPasswordHash = bcrypt.hashSync('Admin@12345', 10);
const userPasswordHash = bcrypt.hashSync('User@12345', 10);

const initialBikes: Bike[] = [
  {
    id: 'bike-trek-marlin-7',
    name: 'Trek Marlin 7 Gen 3',
    model: 'Marlin 7 Hardtail',
    bikeType: 'Mountain',
    brand: 'Trek',
    imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1000&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: {
      frameMaterial: 'Alpha Silver Aluminum',
      gears: 'Shimano Deore M5120 10-speed',
      brakes: 'Shimano MT200 Hydraulic Disc',
      weightKg: 13.8,
      wheelSizeInch: 29,
      suitableHeightCm: '165 - 188 cm',
      helmetIncluded: true,
      lockIncluded: true,
    },
    hourlyPrice: 12,
    dailyPrice: 48,
    availability: 'Available',
    bikeCondition: 'Excellent',
    rating: 4.9,
    reviewCount: 28,
    location: 'Central Park Hub',
    description: 'Trail-ready cross-country mountain bike with suspension lockout and modern progressive trail geometry.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bike-specialized-turbo-veado',
    name: 'Specialized Turbo Vado 4.0',
    model: 'Turbo Vado 4.0 Step-Through',
    bikeType: 'Electric / E-Bike',
    brand: 'Specialized',
    imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1000&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: {
      frameMaterial: 'E5 Premium Aluminum',
      gears: 'SRAM NX 11-speed',
      brakes: 'SRAM Level Hydraulic 180mm',
      weightKg: 24.2,
      wheelSizeInch: 28,
      batteryCapacity: '710Wh Specialized U2-710',
      maxRangeKm: 120,
      motorPower: 'Specialized 2.0 (250W / 70Nm)',
      suitableHeightCm: '160 - 185 cm',
      helmetIncluded: true,
      lockIncluded: true,
    },
    hourlyPrice: 18,
    dailyPrice: 75,
    availability: 'Available',
    bikeCondition: 'Excellent',
    rating: 5.0,
    reviewCount: 42,
    location: 'Downtown Station',
    description: 'Smooth and ultra-powerful electric bike with integrated radar display, headlight, and long-range battery.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bike-cannondale-quick-disc-3',
    name: 'Cannondale Quick Disc 3',
    model: 'Quick 3 Fitness Commuter',
    bikeType: 'City / Commuter',
    brand: 'Cannondale',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: {
      frameMaterial: 'SmartForm C3 Alloy',
      gears: 'Shimano Sora 18-speed',
      brakes: 'Tektro HD-R280 Hydraulic Disc',
      weightKg: 10.9,
      wheelSizeInch: 28,
      suitableHeightCm: '170 - 190 cm',
      helmetIncluded: true,
      lockIncluded: true,
    },
    hourlyPrice: 9,
    dailyPrice: 38,
    availability: 'Available',
    bikeCondition: 'Excellent',
    rating: 4.8,
    reviewCount: 19,
    location: 'Metro Transit Terminal',
    description: 'Agile and lightweight commuter designed for high-speed city transit, cardio fitness, and daily campus commute.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bike-giant-defy-advanced',
    name: 'Giant Defy Advanced 1',
    model: 'Defy Advanced Endurance',
    bikeType: 'Road / Racing',
    brand: 'Giant',
    imageUrl: 'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=1000&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: {
      frameMaterial: 'Advanced-Grade Carbon Composite',
      gears: 'Shimano 105 Di2 Electronic 24-Speed',
      brakes: 'Shimano 105 Hydraulic',
      weightKg: 8.6,
      wheelSizeInch: 28,
      suitableHeightCm: '172 - 188 cm',
      helmetIncluded: true,
      lockIncluded: true,
    },
    hourlyPrice: 20,
    dailyPrice: 85,
    availability: 'Available',
    bikeCondition: 'Excellent',
    rating: 4.95,
    reviewCount: 31,
    location: 'Westside Waterfront',
    description: 'Ultra-light carbon endurance road bike built for century rides, mountain climbs, and exhilarating weekend pavement speed.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bike-rad-city-5-plus',
    name: 'Rad Power RadCity 5 Plus',
    model: 'RadCity 5 Plus Step-Thru',
    bikeType: 'Electric / E-Bike',
    brand: 'Rad Power',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: {
      frameMaterial: '6061 Aluminum Alloy',
      gears: 'Microshift 7-Speed',
      brakes: 'Nutt Hydraulic Disc',
      weightKg: 29.5,
      wheelSizeInch: 27.5,
      batteryCapacity: '672Wh Lithium-ion',
      maxRangeKm: 85,
      motorPower: '750W Geared Hub Motor',
      suitableHeightCm: '155 - 185 cm',
      helmetIncluded: true,
      lockIncluded: true,
    },
    hourlyPrice: 16,
    dailyPrice: 65,
    availability: 'Available',
    bikeCondition: 'Good',
    rating: 4.75,
    reviewCount: 36,
    location: 'University Campus',
    description: 'Comfortable step-thru electric cruiser with cargo rack, front suspension, and hill-conquering torque.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bike-brompton-c-line-explore',
    name: 'Brompton C Line Explore',
    model: 'C Line 6-Speed Folding',
    bikeType: 'City / Commuter',
    brand: 'Brompton',
    imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1000&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: {
      frameMaterial: 'Precision Drawn Heat-Treated Steel',
      gears: 'Brompton Wide Range 6-speed',
      brakes: 'Brompton Dual Pivot Calipers',
      weightKg: 12.1,
      wheelSizeInch: 16,
      suitableHeightCm: '145 - 195 cm',
      helmetIncluded: true,
      lockIncluded: true,
    },
    hourlyPrice: 14,
    dailyPrice: 55,
    availability: 'Available',
    bikeCondition: 'Excellent',
    rating: 4.88,
    reviewCount: 22,
    location: 'Downtown Station',
    description: 'Iconic British folding bicycle engineered to fit anywhere—subway trains, cafes, and car trunks with ease.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bike-trek-dual-sport-3',
    name: 'Trek Dual Sport 3 Gen 5',
    model: 'Dual Sport All-Terrain',
    bikeType: 'Hybrid',
    brand: 'Trek',
    imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: {
      frameMaterial: 'Alpha Gold Aluminum',
      gears: 'Shimano Deore 1x10-speed',
      brakes: 'Shimano MT201 Hydraulic',
      weightKg: 11.8,
      wheelSizeInch: 27.5,
      suitableHeightCm: '165 - 185 cm',
      helmetIncluded: true,
      lockIncluded: true,
    },
    hourlyPrice: 11,
    dailyPrice: 44,
    availability: 'Available',
    bikeCondition: 'Good',
    rating: 4.8,
    reviewCount: 15,
    location: 'Central Park Hub',
    description: 'Go-anywhere hybrid bike that rolls smoothly over pavement while confident on gravel and light dirt tracks.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bike-electra-cruiser-7d',
    name: 'Electra Townie 7D Cruiser',
    model: 'Townie 7D Flat Foot',
    bikeType: 'Cruiser',
    brand: 'Specialized',
    imageUrl: 'https://images.unsplash.com/photo-1528629297340-d1d461b55f91?auto=format&fit=crop&w=1000&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1528629297340-d1d461b55f91?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: {
      frameMaterial: 'Classic Steel Cruiser Frame',
      gears: 'Shimano Tourney 7-speed',
      brakes: 'Alloy Linear-Pull',
      weightKg: 15.2,
      wheelSizeInch: 26,
      suitableHeightCm: '155 - 190 cm',
      helmetIncluded: true,
      lockIncluded: true,
    },
    hourlyPrice: 8,
    dailyPrice: 32,
    availability: 'Available',
    bikeCondition: 'Good',
    rating: 4.7,
    reviewCount: 17,
    location: 'Westside Waterfront',
    description: 'Relaxed upright geometry with ergonomic saddle and wide balloon tires for coastal cruising and leisurely sightseeing.',
    createdAt: new Date().toISOString(),
  },
];

function seedDatabase(): DatabaseSchema {
  const users = [
    {
      id: 'usr-admin-01',
      name: 'Fleet Administrator',
      email: 'admin@bikeshare.com',
      passwordHash: defaultPasswordHash,
      role: 'admin' as const,
      phone: '+1 555-019-2831',
      drivingLicenseNumber: 'DL-ADM-998822',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: 'usr-customer-01',
      name: 'Alex Rivera',
      email: 'user@bikeshare.com',
      passwordHash: userPasswordHash,
      role: 'customer' as const,
      phone: '+1 555-014-9923',
      drivingLicenseNumber: 'DL-NY-7729103',
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
  ];

  const bookings: Booking[] = [
    {
      id: 'bk-2026-001',
      userId: 'usr-customer-01',
      userName: 'Alex Rivera',
      userEmail: 'user@bikeshare.com',
      userPhone: '+1 555-014-9923',
      bikeId: 'bike-trek-marlin-7',
      bike: initialBikes[0],
      rentalType: 'hourly',
      pickupDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      pickupTime: '10:00',
      returnDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      returnTime: '14:00',
      pickupLocation: 'Central Park Hub',
      durationHours: 4,
      durationDays: 1,
      rentalCost: 48,
      securityDeposit: 50,
      taxes: 3.84,
      additionalCharges: 0,
      totalAmount: 101.84,
      bookingStatus: 'completed',
      paymentStatus: 'paid',
      paymentProvider: 'Stripe Gateway (Verified)',
      drivingLicenseNumber: 'DL-NY-7729103',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'bk-2026-002',
      userId: 'usr-customer-01',
      userName: 'Alex Rivera',
      userEmail: 'user@bikeshare.com',
      userPhone: '+1 555-014-9923',
      bikeId: 'bike-specialized-turbo-veado',
      bike: initialBikes[1],
      rentalType: 'daily',
      pickupDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      pickupTime: '09:00',
      returnDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      returnTime: '17:00',
      pickupLocation: 'Downtown Station',
      durationHours: 56,
      durationDays: 2,
      rentalCost: 150,
      securityDeposit: 100,
      taxes: 12.0,
      additionalCharges: 0,
      totalAmount: 262.0,
      bookingStatus: 'upcoming',
      paymentStatus: 'paid',
      paymentProvider: 'Stripe Gateway (Verified)',
      drivingLicenseNumber: 'DL-NY-7729103',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const inspections: Inspection[] = [
    {
      id: 'insp-001',
      bookingId: 'bk-2026-001',
      bikeId: 'bike-trek-marlin-7',
      bikeName: 'Trek Marlin 7 Gen 3',
      inspectorName: 'Fleet Admin (Tech Station 2)',
      inspectionType: 'post_rental',
      bikeCondition: 'Pristine',
      damageDetails: 'Normal road dust. Chain lubricated and tire pressures verified at 35 PSI. No damage detected.',
      damageCharges: 0,
      inspectedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  const reviews: Review[] = [
    {
      id: 'rev-001',
      userId: 'usr-customer-01',
      userName: 'Alex Rivera',
      bikeId: 'bike-trek-marlin-7',
      rating: 5,
      comment: 'Super crisp shifting and fantastic suspension for the rocky park trails! Pickup was instantaneous at Central Park Hub.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'rev-002',
      userId: 'usr-customer-01',
      userName: 'Sarah Jenkins (Tourist)',
      bikeId: 'bike-specialized-turbo-veado',
      rating: 5,
      comment: 'The electric boost easily flattened all the city bridge climbs. Rode over 60km and still had 60% battery left!',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  return {
    users,
    bikes: initialBikes,
    bookings,
    inspections,
    reviews,
    wishlist: [
      {
        id: 'wsh-01',
        userId: 'usr-customer-01',
        bikeId: 'bike-giant-defy-advanced',
        createdAt: new Date().toISOString(),
      },
    ],
    cart: [],
    policies: initialPolicies,
  };
}

// Database helper functions with automatic disk syncing
class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure policies exist if schema evolved
        if (!this.data.policies) {
          this.data.policies = initialPolicies;
        }
      } catch (err) {
        console.error('Failed reading database.json, re-seeding:', err);
        this.data = seedDatabase();
        this.save();
      }
    } else {
      this.data = seedDatabase();
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed saving database.json:', err);
    }
  }

  // --- Users ---
  getUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  getUserById(id: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User & { passwordHash: string }): User {
    this.data.users.push(user);
    this.save();
    const { passwordHash, ...cleanUser } = user;
    return cleanUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    const { passwordHash, ...cleanUser } = this.data.users[idx];
    return cleanUser;
  }

  // --- Bikes ---
  getBikes(): Bike[] {
    return this.data.bikes;
  }

  getBikeById(id: string): Bike | undefined {
    return this.data.bikes.find((b) => b.id === id);
  }

  createBike(bike: Bike): Bike {
    this.data.bikes.push(bike);
    this.save();
    return bike;
  }

  updateBike(id: string, updates: Partial<Bike>): Bike | null {
    const idx = this.data.bikes.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.bikes[idx] = { ...this.data.bikes[idx], ...updates };
    this.save();
    return this.data.bikes[idx];
  }

  deleteBike(id: string): boolean {
    const initialLen = this.data.bikes.length;
    this.data.bikes = this.data.bikes.filter((b) => b.id !== id);
    if (this.data.bikes.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Availability Checking ---
  checkAvailability(
    bikeId: string,
    pickupDate: string,
    pickupTime: string,
    returnDate: string,
    returnTime: string,
    excludeBookingId?: string
  ): AvailabilityCheckResult {
    const bike = this.getBikeById(bikeId);
    if (!bike) {
      return { available: false, message: 'Bike not found in registry.' };
    }

    if (bike.availability === 'Maintenance') {
      return {
        available: false,
        message: 'This bike is currently in scheduled maintenance workshop.',
      };
    }

    const startTimestamp = new Date(`${pickupDate}T${pickupTime}:00`).getTime();
    const endTimestamp = new Date(`${returnDate}T${returnTime}:00`).getTime();

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return { available: false, message: 'Invalid pickup or return date/time.' };
    }

    if (endTimestamp <= startTimestamp) {
      return {
        available: false,
        message: 'Return date & time must be strictly later than pickup date & time.',
      };
    }

    // Check overlapping bookings in upcoming or active state
    const overlappingBooking = this.data.bookings.find((b) => {
      if (b.bikeId !== bikeId) return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (b.bookingStatus === 'cancelled' || b.bookingStatus === 'completed') return false;

      const existingStart = new Date(`${b.pickupDate}T${b.pickupTime}:00`).getTime();
      const existingEnd = new Date(`${b.returnDate}T${b.returnTime}:00`).getTime();

      // Overlap formula: start1 < end2 && end1 > start2
      return startTimestamp < existingEnd && endTimestamp > existingStart;
    });

    if (overlappingBooking) {
      return {
        available: false,
        message: `Bike is already reserved from ${overlappingBooking.pickupDate} ${overlappingBooking.pickupTime} to ${overlappingBooking.returnDate} ${overlappingBooking.returnTime}.`,
        conflictingBooking: {
          pickupDate: overlappingBooking.pickupDate,
          pickupTime: overlappingBooking.pickupTime,
          returnDate: overlappingBooking.returnDate,
          returnTime: overlappingBooking.returnTime,
        },
      };
    }

    return {
      available: true,
      message: 'Bike is fully available for your requested rental window!',
    };
  }

  // --- Price Calculation ---
  calculatePrice(
    bikeId: string,
    rentalType: 'hourly' | 'daily',
    pickupDate: string,
    pickupTime: string,
    returnDate: string,
    returnTime: string
  ): PriceBreakdown {
    const bike = this.getBikeById(bikeId);
    if (!bike) {
      throw new Error('Bike not found');
    }

    const start = new Date(`${pickupDate}T${pickupTime}:00`).getTime();
    const end = new Date(`${returnDate}T${returnTime}:00`).getTime();
    const diffMs = Math.max(0, end - start);
    const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

    let durationUnits = 1;
    let ratePerUnit = bike.hourlyPrice;
    let baseRentalCost = 0;

    if (rentalType === 'hourly') {
      durationUnits = diffHours;
      ratePerUnit = bike.hourlyPrice;
      baseRentalCost = durationUnits * ratePerUnit;
    } else {
      // Daily rental
      durationUnits = Math.max(1, Math.ceil(diffHours / 24));
      ratePerUnit = bike.dailyPrice;
      baseRentalCost = durationUnits * ratePerUnit;
    }

    const isElectric = bike.bikeType === 'Electric / E-Bike';
    const isMotorcycle =
      bike.vehicleType === 'motorcycle' ||
      Boolean(bike.specifications?.engineCc && bike.specifications.engineCc > 0);
    const securityDeposit = isMotorcycle
      ? (this.data.policies.securityDepositMotorcycle ?? 3000)
      : isElectric
      ? this.data.policies.securityDepositElectric
      : this.data.policies.securityDepositStandard;

    // 8% tax calculation
    const taxes = Math.round(baseRentalCost * 0.08 * 100) / 100;
    const additionalCharges = 0; // Helmet and lock included by policy
    const totalAmount = Math.round((baseRentalCost + securityDeposit + taxes + additionalCharges) * 100) / 100;

    return {
      rentalType,
      durationUnits,
      ratePerUnit,
      baseRentalCost,
      securityDeposit,
      taxes,
      additionalCharges,
      totalAmount,
    };
  }

  // --- Bookings ---
  getBookings(userId?: string): Booking[] {
    const list = userId
      ? this.data.bookings.filter((b) => b.userId === userId)
      : this.data.bookings;

    // Attach current bike details
    return list.map((b) => ({
      ...b,
      bike: this.getBikeById(b.bikeId),
    }));
  }

  getBookingById(id: string): Booking | undefined {
    const b = this.data.bookings.find((item) => item.id === id);
    if (!b) return undefined;
    return {
      ...b,
      bike: this.getBikeById(b.bikeId),
    };
  }

  createBooking(booking: Booking): Booking {
    this.data.bookings.unshift(booking);
    this.save();
    return {
      ...booking,
      bike: this.getBikeById(booking.bikeId),
    };
  }

  updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const idx = this.data.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.bookings[idx] = { ...this.data.bookings[idx], ...updates };
    this.save();
    return {
      ...this.data.bookings[idx],
      bike: this.getBikeById(this.data.bookings[idx].bikeId),
    };
  }

  // --- Inspections ---
  getInspections(): Inspection[] {
    return this.data.inspections.map((i) => {
      const bike = this.getBikeById(i.bikeId);
      return {
        ...i,
        bikeName: bike ? `${bike.brand} ${bike.name}` : i.bikeName || 'Fleet Bike',
      };
    });
  }

  createInspection(inspection: Inspection): Inspection {
    this.data.inspections.unshift(inspection);
    this.save();
    return inspection;
  }

  // --- Reviews ---
  getReviews(bikeId?: string): Review[] {
    if (bikeId) {
      return this.data.reviews.filter((r) => r.bikeId === bikeId);
    }
    return this.data.reviews;
  }

  createReview(review: Review): Review {
    this.data.reviews.unshift(review);
    // Update bike rating & reviewCount
    const bikeReviews = this.data.reviews.filter((r) => r.bikeId === review.bikeId);
    const avg =
      bikeReviews.reduce((sum, r) => sum + r.rating, 0) / bikeReviews.length;
    this.updateBike(review.bikeId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: bikeReviews.length,
    });
    this.save();
    return review;
  }

  // --- Wishlist ---
  getWishlist(userId: string): WishlistItem[] {
    return this.data.wishlist
      .filter((w) => w.userId === userId)
      .map((w) => ({
        ...w,
        bike: this.getBikeById(w.bikeId),
      }));
  }

  addToWishlist(userId: string, bikeId: string): WishlistItem {
    const existing = this.data.wishlist.find(
      (w) => w.userId === userId && w.bikeId === bikeId
    );
    if (existing) {
      return {
        ...existing,
        bike: this.getBikeById(bikeId),
      };
    }
    const item: WishlistItem = {
      id: `wsh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      bikeId,
      createdAt: new Date().toISOString(),
    };
    this.data.wishlist.push(item);
    this.save();
    return {
      ...item,
      bike: this.getBikeById(bikeId),
    };
  }

  removeFromWishlist(userId: string, bikeId: string): boolean {
    const initialLen = this.data.wishlist.length;
    this.data.wishlist = this.data.wishlist.filter(
      (w) => !(w.userId === userId && w.bikeId === bikeId)
    );
    if (this.data.wishlist.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Cart ---
  getCart(userId: string): CartItem[] {
    return this.data.cart
      .filter((c) => c.userId === userId)
      .map((c) => ({
        ...c,
        bike: this.getBikeById(c.bikeId),
      }));
  }

  addToCart(item: CartItem): CartItem {
    // Remove if already in cart to update
    this.data.cart = this.data.cart.filter(
      (c) => !(c.userId === item.userId && c.bikeId === item.bikeId)
    );
    this.data.cart.push(item);
    this.save();
    return {
      ...item,
      bike: this.getBikeById(item.bikeId),
    };
  }

  removeFromCart(userId: string, bikeId: string): boolean {
    const len = this.data.cart.length;
    this.data.cart = this.data.cart.filter(
      (c) => !(c.userId === userId && c.bikeId === bikeId)
    );
    if (this.data.cart.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  clearCart(userId: string): void {
    this.data.cart = this.data.cart.filter((c) => c.userId !== userId);
    this.save();
  }

  // --- Policies ---
  getPolicies(): RentalPolicies {
    return this.data.policies;
  }

  updatePolicies(policies: Partial<RentalPolicies>): RentalPolicies {
    this.data.policies = { ...this.data.policies, ...policies };
    this.save();
    return this.data.policies;
  }

  // --- Admin Stats (Calculated strictly from actual records) ---
  getAdminStats(): AdminStats {
    const bookings = this.data.bookings;
    const bikes = this.data.bikes;
    const users = this.data.users;
    const inspections = this.data.inspections;

    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === 'paid' && b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => sum + (b.rentalCost || 0), 0);

    const totalDamageCharges = inspections.reduce(
      (sum, i) => sum + (i.damageCharges || 0),
      0
    );

    return {
      totalBookings: bookings.length,
      activeBookings: bookings.filter((b) => b.bookingStatus === 'active').length,
      upcomingBookings: bookings.filter((b) => b.bookingStatus === 'upcoming').length,
      completedBookings: bookings.filter((b) => b.bookingStatus === 'completed').length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalBikes: bikes.length,
      availableBikes: bikes.filter((b) => b.availability === 'Available').length,
      rentedBikes: bikes.filter((b) => b.availability === 'Rented').length,
      maintenanceBikes: bikes.filter((b) => b.availability === 'Maintenance').length,
      totalUsers: users.length,
      totalInspections: inspections.length,
      totalDamageChargesCollected: Math.round(totalDamageCharges * 100) / 100,
    };
  }
}

export const db = new DatabaseService();
