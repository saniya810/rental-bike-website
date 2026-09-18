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

// Supabase client initialization (if credentials configured)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const isSupabaseConnected = Boolean(supabase);

import { initialPolicies, initialBikes, seedDatabase } from '../src/data/initialData.js';

// Database helper functions with automatic disk syncing and serverless resilience
class DatabaseService {
  private data: DatabaseSchema = seedDatabase();

  constructor() {
    let loaded = false;
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        loaded = true;
        // Ensure policies exist if schema evolved
        if (!this.data.policies) {
          this.data.policies = initialPolicies;
        }
        // Ensure that any newly added vehicles (such as motorcycles) are merged into existing data
        if (!this.data.bikes || this.data.bikes.length < initialBikes.length) {
          const existingIds = new Set((this.data.bikes || []).map((b) => b.id));
          for (const bike of initialBikes) {
            if (!existingIds.has(bike.id)) {
              this.data.bikes.push(bike);
            }
          }
          this.save();
        }
      } catch (err) {
        console.warn('Failed reading database.json, re-seeding in-memory store:', err);
        this.data = seedDatabase();
        this.save();
        loaded = true;
      }
    }
    if (!loaded) {
      this.data = seedDatabase();
      this.save();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      // In serverless environments like Vercel Lambda, the filesystem is read-only.
      // Changes remain safely in-memory during the invocation without throwing unhandled exceptions.
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
