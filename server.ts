import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, isSupabaseConnected } from './server/db.js';
import { User, Booking, Bike, Inspection, Review } from './src/types.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'rental-bike-super-secret-jwt-key-2026';

app.use(express.json());

// Type extension for Authenticated Request
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'admin';
  };
}

// Authentication Middlewares
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token.' });
    }
    req.user = decoded as { id: string; email: string; role: 'customer' | 'admin' };
    next();
  });
}

function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded as { id: string; email: string; role: 'customer' | 'admin' };
      }
      next();
    });
  } else {
    next();
  }
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator authorization required.' });
  }
  next();
}

// -------------------------------------------------------------
// 1. AUTHENTICATION ROUTES
// -------------------------------------------------------------

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  drivingLicenseNumber: z.string().optional(),
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);
    const existing = db.getUserByEmail(validated.email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(validated.password, 10);
    const newUser: User & { passwordHash: string } = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: validated.name,
      email: validated.email,
      passwordHash,
      role: 'customer',
      phone: validated.phone || '',
      drivingLicenseNumber: validated.drivingLicenseNumber || '',
      createdAt: new Date().toISOString(),
    };

    const created = db.createUser(newUser);
    const token = jwt.sign(
      { id: created.id, email: created.email, role: created.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user: created, token });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const msg = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message || 'Validation error';
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    const user = db.getUserByEmail(validated.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(validated.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash, ...cleanUser } = user;
    res.json({ user: cleanUser, token });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const msg = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message || 'Validation error';
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: 'Login failed.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }
  const { passwordHash, ...cleanUser } = user;
  res.json({ user: cleanUser });
});

app.put('/api/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, phone, drivingLicenseNumber } = req.body;
  const updated = db.updateUser(req.user.id, {
    ...(name && { name }),
    ...(phone !== undefined && { phone }),
    ...(drivingLicenseNumber !== undefined && { drivingLicenseNumber }),
  });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json({ user: updated });
});

// -------------------------------------------------------------
// 2. BIKES CATALOG & MANAGEMENT
// -------------------------------------------------------------

app.get('/api/bikes', (req: Request, res: Response) => {
  let bikes = db.getBikes();

  const { category, vehicleType, brand, availability, search, maxPrice, sort } = req.query;

  if (vehicleType && vehicleType !== 'All') {
    bikes = bikes.filter((b) => {
      const vType = b.vehicleType || (b.specifications?.engineCc ? 'motorcycle' : 'bike');
      return vType.toLowerCase() === (vehicleType as string).toLowerCase();
    });
  }

  if (category && category !== 'All') {
    const catLower = (category as string).toLowerCase();
    if (catLower === 'bikes' || catLower === 'bicycles') {
      bikes = bikes.filter(
        (b) => (b.vehicleType || (b.specifications?.engineCc ? 'motorcycle' : 'bike')) === 'bike'
      );
    } else if (catLower === 'motorcycles' || catLower === 'motorcycles / 2-wheelers') {
      bikes = bikes.filter(
        (b) => (b.vehicleType || (b.specifications?.engineCc ? 'motorcycle' : 'bike')) === 'motorcycle'
      );
    } else {
      bikes = bikes.filter((b) => b.bikeType.toLowerCase() === (category as string).toLowerCase());
    }
  }

  if (brand && brand !== 'All') {
    bikes = bikes.filter((b) => b.brand.toLowerCase() === (brand as string).toLowerCase());
  }

  if (availability && availability !== 'All') {
    bikes = bikes.filter((b) => b.availability === availability);
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    bikes = bikes.filter((b) => b.hourlyPrice <= Number(maxPrice));
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    bikes = bikes.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.model.toLowerCase().includes(q) ||
        b.brand.toLowerCase().includes(q) ||
        b.bikeType.toLowerCase().includes(q) ||
        (b.vehicleType && b.vehicleType.toLowerCase().includes(q)) ||
        (b.specifications?.engineCc && `${b.specifications.engineCc}`.includes(q)) ||
        b.location.toLowerCase().includes(q)
    );
  }

  if (sort) {
    if (sort === 'price-low') {
      bikes.sort((a, b) => a.hourlyPrice - b.hourlyPrice);
    } else if (sort === 'price-high') {
      bikes.sort((a, b) => b.hourlyPrice - a.hourlyPrice);
    } else if (sort === 'rating') {
      bikes.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'name') {
      bikes.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  res.json({ bikes });
});

app.get('/api/bikes/:id', (req: Request, res: Response) => {
  const bike = db.getBikeById(req.params.id);
  if (!bike) {
    return res.status(404).json({ error: 'Bike not found.' });
  }
  res.json({ bike });
});

// Admin: Add bike
app.post('/api/bikes', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      model,
      vehicleType,
      bikeType,
      brand,
      imageUrl,
      galleryUrls,
      specifications,
      hourlyPrice,
      dailyPrice,
      availability,
      bikeCondition,
      location,
      description,
    } = req.body;

    if (!name || !model || !bikeType || !brand || !imageUrl || !hourlyPrice || !dailyPrice) {
      return res.status(400).json({ error: 'Missing required bike fields.' });
    }

    const determinedVehicleType =
      vehicleType || (specifications?.engineCc ? 'motorcycle' : 'bike');

    const newBike: Bike = {
      id: `${determinedVehicleType === 'motorcycle' ? 'moto' : 'bike'}-${brand.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}`,
      name,
      model,
      vehicleType: determinedVehicleType,
      bikeType,
      brand,
      imageUrl,
      galleryUrls: galleryUrls || [imageUrl],
      specifications: specifications || {
        frameMaterial: 'Aluminum Alloy',
        gears: 'Standard Gears',
        brakes: 'Hydraulic Disc',
        weightKg: 13,
        wheelSizeInch: 28,
        suitableHeightCm: '160 - 185 cm',
        helmetIncluded: true,
        lockIncluded: true,
      },
      hourlyPrice: Number(hourlyPrice),
      dailyPrice: Number(dailyPrice),
      availability: availability || 'Available',
      bikeCondition: bikeCondition || 'Excellent',
      rating: 5.0,
      reviewCount: 0,
      location: location || 'Central Station',
      description: description || '',
      createdAt: new Date().toISOString(),
    };

    const created = db.createBike(newBike);
    res.status(201).json({ bike: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create bike record.' });
  }
});

// Admin: Edit bike
app.put('/api/bikes/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const updated = db.updateBike(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Bike not found.' });
    }
    res.json({ bike: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update bike record.' });
  }
});

// Admin: Delete bike
app.delete('/api/bikes/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deleteBike(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Bike not found or cannot be removed.' });
  }
  res.json({ message: 'Bike deleted successfully.' });
});

// -------------------------------------------------------------
// 3. AVAILABILITY CHECKING & PRICE CALCULATION
// -------------------------------------------------------------

app.post('/api/bikes/:id/check-availability', (req: Request, res: Response) => {
  const { pickupDate, pickupTime, returnDate, returnTime, excludeBookingId } = req.body;

  if (!pickupDate || !pickupTime || !returnDate || !returnTime) {
    return res.status(400).json({
      available: false,
      message: 'Please provide valid pickup and return dates and times.',
    });
  }

  const result = db.checkAvailability(
    req.params.id,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    excludeBookingId
  );

  res.json(result);
});

app.post('/api/calculate-price', (req: Request, res: Response) => {
  const { bikeId, rentalType, pickupDate, pickupTime, returnDate, returnTime } = req.body;

  if (!bikeId || !rentalType || !pickupDate || !pickupTime || !returnDate || !returnTime) {
    return res.status(400).json({ error: 'Missing parameters for price calculation.' });
  }

  try {
    const breakdown = db.calculatePrice(
      bikeId,
      rentalType,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime
    );
    res.json({ breakdown });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Error calculating price.' });
  }
});

// -------------------------------------------------------------
// 4. BOOKINGS MANAGEMENT
// -------------------------------------------------------------

const bookingCreateSchema = z.object({
  bikeId: z.string().min(1, 'Bike ID is required'),
  rentalType: z.enum(['hourly', 'daily']),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid pickup date required'),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/, 'Valid pickup time required'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid return date required'),
  returnTime: z.string().regex(/^\d{2}:\d{2}$/, 'Valid return time required'),
  pickupLocation: z.string().min(1, 'Pickup location is required'),
  drivingLicenseNumber: z.string().optional(),
  notes: z.string().optional(),
  simulatePayment: z.boolean().optional(),
});

app.get('/api/bookings', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  // If customer, return own bookings; if admin, return all
  const list =
    req.user.role === 'admin'
      ? db.getBookings()
      : db.getBookings(req.user.id);

  const { status } = req.query;
  const filtered = status
    ? list.filter((b) => b.bookingStatus === status)
    : list;

  res.json({ bookings: filtered });
});

app.get('/api/bookings/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access to this booking record is denied.' });
  }

  res.json({ booking });
});

app.post('/api/bookings', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const validated = bookingCreateSchema.parse(req.body);

    // 1. Check real availability
    const avail = db.checkAvailability(
      validated.bikeId,
      validated.pickupDate,
      validated.pickupTime,
      validated.returnDate,
      validated.returnTime
    );

    if (!avail.available) {
      return res.status(409).json({ error: avail.message, conflictingBooking: avail.conflictingBooking });
    }

    // 2. Calculate real price server-side
    const priceBreakdown = db.calculatePrice(
      validated.bikeId,
      validated.rentalType,
      validated.pickupDate,
      validated.pickupTime,
      validated.returnDate,
      validated.returnTime
    );

    const user = db.getUserById(req.user.id);
    const bike = db.getBikeById(validated.bikeId);

    const isHourly = validated.rentalType === 'hourly';

    const newBooking: Booking = {
      id: `bk-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: req.user.id,
      userName: user?.name || 'Customer',
      userEmail: user?.email || req.user.email,
      userPhone: user?.phone || '',
      bikeId: validated.bikeId,
      bike,
      rentalType: validated.rentalType,
      pickupDate: validated.pickupDate,
      pickupTime: validated.pickupTime,
      returnDate: validated.returnDate,
      returnTime: validated.returnTime,
      pickupLocation: validated.pickupLocation,
      durationHours: isHourly ? priceBreakdown.durationUnits : priceBreakdown.durationUnits * 24,
      durationDays: isHourly ? Math.ceil(priceBreakdown.durationUnits / 24) : priceBreakdown.durationUnits,
      rentalCost: priceBreakdown.baseRentalCost,
      securityDeposit: priceBreakdown.securityDeposit,
      taxes: priceBreakdown.taxes,
      additionalCharges: priceBreakdown.additionalCharges,
      totalAmount: priceBreakdown.totalAmount,
      bookingStatus: 'upcoming',
      paymentStatus: validated.simulatePayment ? 'paid' : 'pending',
      paymentProvider: validated.simulatePayment
        ? 'Payment Gateway (Ready / Simulated Deposit)'
        : 'Payment Gateway Pending Configuration',
      drivingLicenseNumber: validated.drivingLicenseNumber || user?.drivingLicenseNumber || '',
      notes: validated.notes || '',
      createdAt: new Date().toISOString(),
    };

    const created = db.createBooking(newBooking);

    // Update bike availability if immediate pickup
    const todayStr = new Date().toISOString().split('T')[0];
    if (created.pickupDate === todayStr) {
      db.updateBike(created.bikeId, { availability: 'Rented' });
    }

    res.status(201).json({ booking: created, message: 'Booking confirmed successfully.' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const msg = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message || 'Validation error';
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: err.message || 'Failed to create booking.' });
  }
});

// Update booking status (Admin or User cancellation)
app.put('/api/bookings/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { status, notes } = req.body;
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  // Customers can only cancel their own upcoming bookings
  if (req.user.role !== 'admin') {
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this booking.' });
    }
    if (status !== 'cancelled') {
      return res.status(400).json({ error: 'Customers can only cancel bookings.' });
    }
    if (booking.bookingStatus !== 'upcoming') {
      return res.status(400).json({ error: 'Only upcoming bookings can be cancelled.' });
    }
  }

  const updated = db.updateBooking(req.params.id, {
    bookingStatus: status,
    ...(notes && { notes }),
  });

  // If cancelled or completed, restore bike availability
  if (status === 'cancelled' || status === 'completed') {
    db.updateBike(booking.bikeId, { availability: 'Available' });
  } else if (status === 'active') {
    db.updateBike(booking.bikeId, { availability: 'Rented' });
  }

  res.json({ booking: updated });
});

// Rental extension route
app.post('/api/bookings/:id/extend', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { newReturnDate, newReturnTime } = req.body;
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to modify this booking.' });
  }

  // Check availability for the extended period
  const avail = db.checkAvailability(
    booking.bikeId,
    booking.pickupDate,
    booking.pickupTime,
    newReturnDate,
    newReturnTime,
    booking.id // Exclude this booking
  );

  if (!avail.available) {
    return res.status(409).json({
      error: `Extension unavailable: ${avail.message}`,
    });
  }

  // Recalculate price
  const price = db.calculatePrice(
    booking.bikeId,
    booking.rentalType,
    booking.pickupDate,
    booking.pickupTime,
    newReturnDate,
    newReturnTime
  );

  const updated = db.updateBooking(booking.id, {
    returnDate: newReturnDate,
    returnTime: newReturnTime,
    rentalCost: price.baseRentalCost,
    taxes: price.taxes,
    totalAmount: price.totalAmount,
    durationHours: booking.rentalType === 'hourly' ? price.durationUnits : price.durationUnits * 24,
    durationDays: booking.rentalType === 'hourly' ? Math.ceil(price.durationUnits / 24) : price.durationUnits,
  });

  res.json({ booking: updated, message: 'Rental extension successfully applied.' });
});

// -------------------------------------------------------------
// 5. INSPECTIONS & DAMAGE TRACKING (Admin)
// -------------------------------------------------------------

app.get('/api/inspections', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const inspections = db.getInspections();
  res.json({ inspections });
});

app.post('/api/inspections', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { bookingId, bikeId, inspectorName, inspectionType, bikeCondition, damageDetails, damageCharges } = req.body;

  if (!bookingId || !bikeId || !inspectorName || !inspectionType || !bikeCondition) {
    return res.status(400).json({ error: 'Missing required inspection parameters.' });
  }

  const inspection: Inspection = {
    id: `insp-${Date.now()}`,
    bookingId,
    bikeId,
    inspectorName,
    inspectionType,
    bikeCondition,
    damageDetails: damageDetails || 'No visible damage.',
    damageCharges: Number(damageCharges) || 0,
    inspectedAt: new Date().toISOString(),
  };

  const created = db.createInspection(inspection);

  // Update bike condition in fleet record
  db.updateBike(bikeId, {
    bikeCondition: bikeCondition === 'Pristine' ? 'Excellent' : bikeCondition === 'Damaged' ? 'Needs Inspection' : 'Good',
    ...(bikeCondition === 'Damaged' && { availability: 'Maintenance' }),
  });

  res.status(201).json({ inspection: created });
});

// -------------------------------------------------------------
// 6. REVIEWS
// -------------------------------------------------------------

app.get('/api/reviews', (req: Request, res: Response) => {
  const { bikeId } = req.query;
  const reviews = db.getReviews(bikeId as string | undefined);
  res.json({ reviews });
});

app.post('/api/reviews', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { bikeId, rating, comment } = req.body;
  if (!bikeId || !rating || !comment) {
    return res.status(400).json({ error: 'Bike ID, rating (1-5), and comment are required.' });
  }

  const user = db.getUserById(req.user.id);
  const review: Review = {
    id: `rev-${Date.now()}`,
    userId: req.user.id,
    userName: user?.name || 'Verified Rider',
    bikeId,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString(),
  };

  const created = db.createReview(review);
  res.status(201).json({ review: created });
});

// -------------------------------------------------------------
// 7. WISHLIST
// -------------------------------------------------------------

app.get('/api/wishlist', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const items = db.getWishlist(req.user.id);
  res.json({ wishlist: items });
});

app.post('/api/wishlist/:bikeId', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const item = db.addToWishlist(req.user.id, req.params.bikeId);
  res.status(201).json({ item });
});

app.delete('/api/wishlist/:bikeId', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const success = db.removeFromWishlist(req.user.id, req.params.bikeId);
  res.json({ success });
});

// -------------------------------------------------------------
// 8. CART
// -------------------------------------------------------------

app.get('/api/cart', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const items = db.getCart(req.user.id);
  res.json({ cart: items });
});

app.post('/api/cart', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { bikeId, rentalType, pickupDate, pickupTime, returnDate, returnTime, pickupLocation } = req.body;

  const item = db.addToCart({
    id: `cart-${Date.now()}`,
    userId: req.user.id,
    bikeId,
    rentalType: rentalType || 'hourly',
    pickupDate: pickupDate || new Date().toISOString().split('T')[0],
    pickupTime: pickupTime || '10:00',
    returnDate: returnDate || new Date().toISOString().split('T')[0],
    returnTime: returnTime || '14:00',
    pickupLocation: pickupLocation || 'Downtown Station',
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ item });
});

app.delete('/api/cart/:bikeId', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const success = db.removeFromCart(req.user.id, req.params.bikeId);
  res.json({ success });
});

// -------------------------------------------------------------
// 9. POLICIES & ADMIN DASHBOARD METRICS
// -------------------------------------------------------------

app.get('/api/policies', (req: Request, res: Response) => {
  const policies = db.getPolicies();
  res.json({ policies });
});

app.put('/api/policies', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const updated = db.updatePolicies(req.body);
  res.json({ policies: updated });
});

app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

app.get('/api/admin/users', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const users = db.getUsers();
  res.json({ users });
});

// System Status / Supabase connection inspection
app.get('/api/system/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    isSupabaseConfigured: isSupabaseConnected,
    storageEngine: isSupabaseConnected
      ? 'Supabase PostgreSQL Cloud Database'
      : 'Active Disk Persistent SQL-Relational Store (Supabase-Compatible)',
    serverTimestamp: new Date().toISOString(),
    supportedFeatures: [
      'Real Availability Checking (No Overlapping Active Bookings)',
      'Accurate Hourly & Daily Rental Pricing Engine',
      'Row Level Security Architecture & Schema Export',
      'Pre & Post Rental Bike Inspection & Damage Records',
      'Dynamic Rental Policies Management',
      'Wishlist & Cart Synchronization',
    ],
  });
});

// -------------------------------------------------------------
// 10. SEO ENDPOINTS (robots.txt and sitemap.xml)
// -------------------------------------------------------------

app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: /sitemap.xml\n`);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const bikes = db.getBikes();
  const baseUrl = process.env.APP_URL || 'https://bikeshare-platform.run.app';

  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/bikes`,
    `${baseUrl}/about`,
    `${baseUrl}/contact`,
    `${baseUrl}/policies`,
    ...bikes.map((b) => `${baseUrl}/bikes/${b.id}`),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>${url.endsWith('/') ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(sitemap);
});

// -------------------------------------------------------------
// 11. VITE INTEGRATION & PRODUCTION ASSET SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rental Bike Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
export { app };

if (!process.env.VERCEL) {
  startServer();
}
