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
} from '../types.js';
import { initialBikes, initialPolicies } from '../data/initialData.js';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    throw new Error('API server returned non-JSON response');
  }

  const data = await res.json();

  if (!res.ok) {
    const message = data && data.error ? data.error : res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  // --- Auth ---
  async register(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    drivingLicenseNumber?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await handleResponse<{ user: User; token: string }>(res);
    localStorage.setItem('auth_token', result.token);
    return result;
  },

  async login(payload: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await handleResponse<{ user: User; token: string }>(res);
    localStorage.setItem('auth_token', result.token);
    return result;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ user: User }>(res);
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });
    return handleResponse<{ user: User }>(res);
  },

  logout(): void {
    localStorage.removeItem('auth_token');
  },

  // --- Bikes ---
  async getBikes(params?: {
    category?: string;
    vehicleType?: string;
    fuelPowerType?: string;
    brand?: string;
    availability?: string;
    search?: string;
    maxPrice?: number;
    sort?: string;
  }): Promise<{ bikes: Bike[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'All') query.set('category', params.category);
      if (params?.vehicleType && params.vehicleType !== 'All') query.set('vehicleType', params.vehicleType);
      if (params?.fuelPowerType && params.fuelPowerType !== 'All') query.set('fuelPowerType', params.fuelPowerType);
      if (params?.brand && params.brand !== 'All') query.set('brand', params.brand);
      if (params?.availability && params.availability !== 'All') query.set('availability', params.availability);
      if (params?.search) query.set('search', params.search);
      if (params?.maxPrice) query.set('maxPrice', String(params.maxPrice));
      if (params?.sort) query.set('sort', params.sort);

      const res = await fetch(`${API_BASE}/bikes?${query.toString()}`);
      const data = await handleResponse<{ bikes: Bike[] }>(res);
      if (data && Array.isArray(data.bikes)) {
        return data;
      }
      return { bikes: initialBikes };
    } catch (err) {
      console.warn('Backend /api/bikes unavailable, serving bundled fleet:', err);
      let filtered = [...initialBikes];
      if (params?.vehicleType && params.vehicleType !== 'All') {
        filtered = filtered.filter((b) => {
          const vType = b.vehicleType || (b.specifications?.engineCc ? 'motorcycle' : 'bike');
          return vType.toLowerCase() === params.vehicleType!.toLowerCase();
        });
      }
      if (params?.fuelPowerType && params.fuelPowerType !== 'All') {
        filtered = filtered.filter((b) => {
          const fType = b.fuelPowerType || (b.specifications?.fuelType?.toLowerCase().includes('petrol') ? 'Petrol' : b.bikeType.toLowerCase().includes('electric') ? 'Electric' : 'Petrol');
          return fType.toLowerCase() === params.fuelPowerType!.toLowerCase();
        });
      }
      if (params?.category && params.category !== 'All') {
        const catLower = params.category.toLowerCase();
        if (catLower === 'bikes' || catLower === 'bicycles') {
          filtered = filtered.filter((b) => (b.vehicleType || (b.specifications?.engineCc ? 'motorcycle' : 'bike')) === 'bike');
        } else if (catLower === 'motorcycles' || catLower === 'motorcycles / 2-wheelers') {
          filtered = filtered.filter((b) => (b.vehicleType || (b.specifications?.engineCc ? 'motorcycle' : 'bike')) === 'motorcycle');
        } else {
          filtered = filtered.filter((b) => b.bikeType.toLowerCase().includes(catLower));
        }
      }
      if (params?.brand && params.brand !== 'All') {
        filtered = filtered.filter((b) => b.brand.toLowerCase() === params.brand!.toLowerCase());
      }
      if (params?.availability && params.availability !== 'All') {
        filtered = filtered.filter((b) => b.availability === params.availability);
      }
      if (params?.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        filtered = filtered.filter((b) =>
          b.name.toLowerCase().includes(q) ||
          b.brand.toLowerCase().includes(q) ||
          b.model.toLowerCase().includes(q) ||
          b.bikeType.toLowerCase().includes(q) ||
          (b.fuelPowerType && b.fuelPowerType.toLowerCase().includes(q)) ||
          b.location.toLowerCase().includes(q)
        );
      }
      if (params?.maxPrice) {
        filtered = filtered.filter((b) => b.hourlyPrice <= params.maxPrice! || b.dailyPrice <= params.maxPrice!);
      }
      if (params?.sort) {
        if (params.sort === 'price-low') {
          filtered.sort((a, b) => a.hourlyPrice - b.hourlyPrice);
        } else if (params.sort === 'price-high') {
          filtered.sort((a, b) => b.hourlyPrice - a.hourlyPrice);
        } else if (params.sort === 'rating') {
          filtered.sort((a, b) => b.rating - a.rating);
        } else if (params.sort === 'name') {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
      }
      return { bikes: filtered };
    }
  },

  async getBikeById(id: string): Promise<{ bike: Bike }> {
    try {
      const res = await fetch(`${API_BASE}/bikes/${id}`);
      return await handleResponse<{ bike: Bike }>(res);
    } catch (err) {
      const found = initialBikes.find((b) => b.id === id);
      if (found) {
        return { bike: found };
      }
      throw err;
    }
  },

  async createBike(bikeData: Partial<Bike>): Promise<{ bike: Bike }> {
    const res = await fetch(`${API_BASE}/bikes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(bikeData),
    });
    return handleResponse<{ bike: Bike }>(res);
  },

  async updateBike(id: string, updates: Partial<Bike>): Promise<{ bike: Bike }> {
    const res = await fetch(`${API_BASE}/bikes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });
    return handleResponse<{ bike: Bike }>(res);
  },

  async deleteBike(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/bikes/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  // --- Availability & Price ---
  async checkAvailability(payload: {
    bikeId: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    excludeBookingId?: string;
  }): Promise<AvailabilityCheckResult> {
    try {
      const res = await fetch(`${API_BASE}/bikes/${payload.bikeId}/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await handleResponse<AvailabilityCheckResult>(res);
    } catch {
      return {
        available: true,
        message: 'Vehicle is currently available for selected pickup slot.',
      };
    }
  },

  async calculatePrice(payload: {
    bikeId: string;
    rentalType: 'hourly' | 'daily';
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
  }): Promise<{ breakdown: PriceBreakdown }> {
    try {
      const res = await fetch(`${API_BASE}/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await handleResponse<{ breakdown: PriceBreakdown }>(res);
    } catch {
      const bike = initialBikes.find((b) => b.id === payload.bikeId) || initialBikes[0];
      const start = new Date(`${payload.pickupDate}T${payload.pickupTime}`);
      const end = new Date(`${payload.returnDate}T${payload.returnTime}`);
      const diffHours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
      const diffDays = Math.max(1, Math.ceil(diffHours / 24));
      const rentalCost = payload.rentalType === 'daily'
        ? diffDays * bike.dailyPrice
        : diffHours * bike.hourlyPrice;
      const isElectric = bike.bikeType.toLowerCase().includes('electric');
      const isMotorcycle = bike.bikeType.toLowerCase().includes('motorcycle');
      const securityDeposit = (
        isMotorcycle
          ? initialPolicies.securityDepositMotorcycle
          : isElectric
          ? initialPolicies.securityDepositElectric
          : initialPolicies.securityDepositStandard
      ) ?? 1000;
      const taxes = Number((rentalCost * 0.08).toFixed(2));
      const totalAmount = Number((rentalCost + securityDeposit + taxes).toFixed(2));
      const durationUnits = payload.rentalType === 'daily' ? diffDays : diffHours;
      const ratePerUnit = payload.rentalType === 'daily' ? bike.dailyPrice : bike.hourlyPrice;
      return {
        breakdown: {
          rentalType: payload.rentalType,
          durationUnits,
          ratePerUnit,
          baseRentalCost: rentalCost,
          securityDeposit,
          taxes,
          additionalCharges: 0,
          totalAmount,
        },
      };
    }
  },

  // --- Bookings ---
  async getBookings(status?: string): Promise<{ bookings: Booking[] }> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/bookings${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ bookings: Booking[] }>(res);
  },

  async getMyBookings(status?: string): Promise<{ bookings: Booking[] }> {
    return this.getBookings(status);
  },

  async getAdminBookings(status?: string): Promise<{ bookings: Booking[] }> {
    return this.getBookings(status);
  },

  async getBookingById(id: string): Promise<{ booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ booking: Booking }>(res);
  },

  async createBooking(payload: {
    bikeId: string;
    rentalType: 'hourly' | 'daily';
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    pickupLocation: string;
    drivingLicenseNumber?: string;
    notes?: string;
    simulatePayment?: boolean;
  }): Promise<{ booking: Booking; message: string }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ booking: Booking; message: string }>(res);
  },

  async updateBookingStatus(
    id: string,
    statusOrPayload: 'upcoming' | 'active' | 'completed' | 'cancelled' | { status: 'upcoming' | 'active' | 'completed' | 'cancelled'; paymentStatus?: any; notes?: string },
    notes?: string
  ): Promise<{ booking: Booking }> {
    const body = typeof statusOrPayload === 'string'
      ? { status: statusOrPayload, notes }
      : statusOrPayload;

    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(body),
    });
    return handleResponse<{ booking: Booking }>(res);
  },

  async cancelBooking(id: string, reason?: string): Promise<{ booking: Booking }> {
    return this.updateBookingStatus(id, 'cancelled', reason);
  },

  async extendBooking(
    idOrPayload: string | { bookingId: string; newReturnDate: string; newReturnTime: string },
    maybeReturnDate?: string,
    maybeReturnTime?: string
  ): Promise<{ booking: Booking; message: string }> {
    let bookingId: string;
    let newReturnDate: string;
    let newReturnTime: string;

    if (typeof idOrPayload === 'object') {
      bookingId = idOrPayload.bookingId;
      newReturnDate = idOrPayload.newReturnDate;
      newReturnTime = idOrPayload.newReturnTime;
    } else {
      bookingId = idOrPayload;
      newReturnDate = maybeReturnDate || '';
      newReturnTime = maybeReturnTime || '';
    }

    const res = await fetch(`${API_BASE}/bookings/${bookingId}/extend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ newReturnDate, newReturnTime }),
    });
    return handleResponse<{ booking: Booking; message: string }>(res);
  },

  // --- Inspections ---
  async getInspections(): Promise<{ inspections: Inspection[] }> {
    const res = await fetch(`${API_BASE}/inspections`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ inspections: Inspection[] }>(res);
  },

  async getAdminInspections(): Promise<{ inspections: Inspection[] }> {
    return this.getInspections();
  },

  async createInspection(payload: {
    bookingId: string;
    bikeId: string;
    inspectorName: string;
    inspectionType: 'pre_rental' | 'post_rental';
    bikeCondition: string;
    damageDetails?: string;
    damageCharges?: number;
  }): Promise<{ inspection: Inspection }> {
    const res = await fetch(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ inspection: Inspection }>(res);
  },

  // --- Reviews ---
  async getReviews(bikeId?: string): Promise<{ reviews: Review[] }> {
    const query = bikeId ? `?bikeId=${bikeId}` : '';
    const res = await fetch(`${API_BASE}/reviews${query}`);
    return handleResponse<{ reviews: Review[] }>(res);
  },

  async createReview(payload: {
    bikeId: string;
    rating: number;
    comment: string;
  }): Promise<{ review: Review }> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ review: Review }>(res);
  },

  // --- Wishlist ---
  async getWishlist(): Promise<{ wishlist: WishlistItem[] }> {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ wishlist: WishlistItem[] }>(res);
  },

  async addToWishlist(bikeId: string): Promise<{ item: WishlistItem }> {
    const res = await fetch(`${API_BASE}/wishlist/${bikeId}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ item: WishlistItem }>(res);
  },

  async removeFromWishlist(bikeId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/wishlist/${bikeId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // --- Cart ---
  async getCart(): Promise<{ cart: CartItem[] }> {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ cart: CartItem[] }>(res);
  },

  async addToCart(item: Partial<CartItem>): Promise<{ item: CartItem }> {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(item),
    });
    return handleResponse<{ item: CartItem }>(res);
  },

  async removeFromCart(bikeId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/cart/${bikeId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // --- Policies ---
  async getPolicies(): Promise<{ policies: RentalPolicies }> {
    try {
      const res = await fetch(`${API_BASE}/policies`);
      const data = await handleResponse<{ policies: RentalPolicies }>(res);
      if (data && data.policies) {
        return data;
      }
      return { policies: initialPolicies };
    } catch (err) {
      console.warn('Backend /api/policies unavailable, using bundled policies:', err);
      return { policies: initialPolicies };
    }
  },

  async updatePolicies(policies: Partial<RentalPolicies>): Promise<{ policies: RentalPolicies }> {
    const res = await fetch(`${API_BASE}/policies`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(policies),
    });
    return handleResponse<{ policies: RentalPolicies }>(res);
  },

  // --- Admin ---
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ stats: AdminStats }>(res);
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ users: User[] }>(res);
  },

  // --- System status ---
  async getSystemStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/system/status`);
    return handleResponse<any>(res);
  },
};
