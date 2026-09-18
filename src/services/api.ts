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

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson && data.error ? data.error : res.statusText || 'Request failed';
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
    brand?: string;
    availability?: string;
    search?: string;
    maxPrice?: number;
    sort?: string;
  }): Promise<{ bikes: Bike[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.brand) query.set('brand', params.brand);
    if (params?.availability) query.set('availability', params.availability);
    if (params?.search) query.set('search', params.search);
    if (params?.maxPrice) query.set('maxPrice', String(params.maxPrice));
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/bikes?${query.toString()}`);
    return handleResponse<{ bikes: Bike[] }>(res);
  },

  async getBikeById(id: string): Promise<{ bike: Bike }> {
    const res = await fetch(`${API_BASE}/bikes/${id}`);
    return handleResponse<{ bike: Bike }>(res);
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
    const res = await fetch(`${API_BASE}/bikes/${payload.bikeId}/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<AvailabilityCheckResult>(res);
  },

  async calculatePrice(payload: {
    bikeId: string;
    rentalType: 'hourly' | 'daily';
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
  }): Promise<{ breakdown: PriceBreakdown }> {
    const res = await fetch(`${API_BASE}/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ breakdown: PriceBreakdown }>(res);
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
    const res = await fetch(`${API_BASE}/policies`);
    return handleResponse<{ policies: RentalPolicies }>(res);
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
