// ===================================================================
// FOODCONNECT - DATA SERVICE LAYER (CLEAN SLATE & PRODUCTION ARCHITECTURE)
// Handles all data operations with ZERO pre-populated sample listings/donations.
// Full schema integrity, expiration logic, and municipal waste management.
// ===================================================================

const STORAGE_KEYS = {
  USERS: 'foodconnect_users_v2',
  LISTINGS: 'foodconnect_listings_v2',
  DONATIONS: 'foodconnect_donations_v2',
  MESSAGES: 'foodconnect_messages_v2',
  NOTIFICATIONS: 'foodconnect_notifications_v2',
  WASTE_REQUESTS: 'foodconnect_waste_requests_v2',
  CLEAN_INITIALIZED: 'foodconnect_blank_slate_v2'
};

// Safe storage utilities
function loadStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading storage key:', key, err);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error saving storage key:', key, err);
  }
}

// Ensure clean slate on initial run
function initializeCleanSlate() {
  try {
    const initialized = localStorage.getItem(STORAGE_KEYS.CLEAN_INITIALIZED);
    if (!initialized) {
      // Clear legacy storage keys with mock data
      localStorage.removeItem('foodconnect_listings');
      localStorage.removeItem('foodconnect_donations');
      localStorage.removeItem('foodconnect_messages');
      localStorage.removeItem('foodconnect_notifications');
      localStorage.removeItem('foodconnect_active_user');

      // Initialize empty arrays
      saveStorage(STORAGE_KEYS.USERS, []);
      saveStorage(STORAGE_KEYS.LISTINGS, []);
      saveStorage(STORAGE_KEYS.DONATIONS, []);
      saveStorage(STORAGE_KEYS.MESSAGES, []);
      saveStorage(STORAGE_KEYS.NOTIFICATIONS, []);
      saveStorage(STORAGE_KEYS.WASTE_REQUESTS, []);

      localStorage.setItem(STORAGE_KEYS.CLEAN_INITIALIZED, 'true');
    }
  } catch (e) {
    console.warn('Could not initialize clean slate:', e);
  }
}

initializeCleanSlate();

// Haversine Distance Calculation (in km)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 2.5;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Helper to check if a listing's expiration time has passed
export function isListingExpired(listing) {
  if (listing.status === 'expired') return true;
  if (!listing.expiresAt) return false;
  const expireDate = new Date(listing.expiresAt);
  return !isNaN(expireDate.getTime()) && Date.now() > expireDate.getTime();
}

// -------------------------------------------------------------
// USER SERVICES
// -------------------------------------------------------------
export const userService = {
  getUsers() {
    return loadStorage(STORAGE_KEYS.USERS, []);
  },
  getUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  },
  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: userData.name || userData.organizationName,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role, // 'donor' | 'ngo' | 'admin'
      organizationName: userData.organizationName || userData.name,
      address: userData.address || '',
      location: userData.location || { lat: 26.9124, lng: 75.7873 },
      profileImage: userData.profileImage || '',
      isVerified: userData.role === 'donor' || userData.role === 'ngo' ? false : true,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },
  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      saveStorage(STORAGE_KEYS.USERS, users);
      return users[index];
    }
    return null;
  },
  toggleVerify(id) {
    const users = this.getUsers();
    const user = users.find(u => u.id === id);
    if (user) {
      user.isVerified = !user.isVerified;
      saveStorage(STORAGE_KEYS.USERS, users);
      return user;
    }
    return null;
  }
};

// -------------------------------------------------------------
// FOOD LISTINGS SERVICES
// -------------------------------------------------------------
export const foodService = {
  getListings() {
    const listings = loadStorage(STORAGE_KEYS.LISTINGS, []);
    let modified = false;

    // Check expiration on read
    listings.forEach(item => {
      if (item.status === 'available' && isListingExpired(item)) {
        item.status = 'expired';
        item.updatedAt = new Date().toISOString();
        modified = true;
      }
    });

    if (modified) {
      saveStorage(STORAGE_KEYS.LISTINGS, listings);
    }
    return listings;
  },
  getListingById(id) {
    const listings = this.getListings();
    return listings.find(l => l.id === id) || null;
  },
  // Only available and non-expired listings are discoverable by NGOs
  getAvailableListings() {
    const listings = this.getListings();
    return listings.filter(l => l.status === 'available' && !isListingExpired(l));
  },
  getDonorListings(donorId) {
    const listings = this.getListings();
    return listings.filter(l => l.donorId === donorId);
  },
  createListing(listingData) {
    const listings = loadStorage(STORAGE_KEYS.LISTINGS, []);

    // Compute ISO expiration date
    let expiresAt = listingData.expiresAt;
    if (!expiresAt) {
      // Default to 6 hours from now if not explicitly passed
      expiresAt = new Date(Date.now() + 6 * 3600 * 1000).toISOString();
    }

    const newListing = {
      id: 'food_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      donorId: listingData.donorId,
      donorName: listingData.donorName,
      foodName: listingData.foodName,
      category: listingData.category,
      description: listingData.description || '',
      quantity: Number(listingData.quantity),
      unit: listingData.unit || 'kg',
      foodType: listingData.foodType || 'Vegetarian',
      preparedAt: listingData.preparedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pickupDeadline: listingData.pickupDeadline || 'Within 6 hours',
      expiresAt,
      imageURL: listingData.imageURL || '',
      pickupAddress: listingData.pickupAddress || '',
      latitude: listingData.latitude || 26.8520,
      longitude: listingData.longitude || 75.8050,
      listingType: listingData.listingType || 'free', // 'free' | 'paid'
      price: listingData.listingType === 'paid' ? Number(listingData.price || 0) : 0,
      qualityScore: listingData.qualityScore || 88,
      qualityStatus: listingData.qualityStatus || 'Good Quality',
      qualityAnalysis: listingData.qualityAnalysis || null,
      status: 'available', // available | accepted | pickup_started | picked_up | delivered | cancelled | expired
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    listings.unshift(newListing);
    saveStorage(STORAGE_KEYS.LISTINGS, listings);

    // Notify registered NGOs
    const allUsers = userService.getUsers();
    const ngos = allUsers.filter(u => u.role === 'ngo');
    ngos.forEach(ngo => {
      notificationService.createNotification({
        userId: ngo.id,
        title: 'New Food Listing Available Nearby',
        message: `${newListing.donorName} listed ${newListing.quantity} ${newListing.unit} of ${newListing.foodName} (${newListing.listingType === 'paid' ? `₹${newListing.price}` : 'FREE'}).`,
        type: 'new_food',
        relatedId: newListing.id
      });
    });

    return newListing;
  },
  updateListing(id, updates) {
    const listings = loadStorage(STORAGE_KEYS.LISTINGS, []);
    const index = listings.findIndex(l => l.id === id);
    if (index !== -1) {
      listings[index] = { ...listings[index], ...updates, updatedAt: new Date().toISOString() };
      saveStorage(STORAGE_KEYS.LISTINGS, listings);
      return listings[index];
    }
    return null;
  },
  deleteListing(id) {
    let listings = loadStorage(STORAGE_KEYS.LISTINGS, []);
    listings = listings.filter(l => l.id !== id);
    saveStorage(STORAGE_KEYS.LISTINGS, listings);
    return true;
  }
};

// -------------------------------------------------------------
// DONATION WORKFLOW SERVICES
// -------------------------------------------------------------
export const donationService = {
  getDonations() {
    return loadStorage(STORAGE_KEYS.DONATIONS, []);
  },
  getDonationById(id) {
    const donations = this.getDonations();
    return donations.find(d => d.id === id) || null;
  },
  getUserDonations(userId, role) {
    const donations = this.getDonations();
    if (role === 'donor') {
      return donations.filter(d => d.donorId === userId);
    } else if (role === 'ngo') {
      return donations.filter(d => d.ngoId === userId);
    }
    return donations;
  },
  acceptDonation(foodListingId, ngoUser, paymentDetails = null) {
    const listing = foodService.getListingById(foodListingId);
    if (!listing) throw new Error('Listing not found');
    
    // Check if expired
    if (isListingExpired(listing)) {
      foodService.updateListing(foodListingId, { status: 'expired' });
      throw new Error('This surplus food listing has expired and can no longer be accepted.');
    }

    if (listing.status !== 'available') {
      throw new Error('This food listing is no longer available.');
    }

    // 1. Mark listing as accepted
    foodService.updateListing(foodListingId, { status: 'accepted' });

    // 2. Create donation record
    const donations = loadStorage(STORAGE_KEYS.DONATIONS, []);
    const newDonation = {
      id: 'donation_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      foodListingId: listing.id,
      foodName: listing.foodName,
      donorId: listing.donorId,
      donorName: listing.donorName,
      ngoId: ngoUser.id,
      ngoName: ngoUser.organizationName || ngoUser.name,
      quantity: `${listing.quantity} ${listing.unit}`,
      imageURL: listing.imageURL,
      pickupAddress: listing.pickupAddress,
      latitude: listing.latitude,
      longitude: listing.longitude,
      listingType: listing.listingType,
      price: listing.price,
      // Payment information for paid listings
      paymentMethod: paymentDetails?.method || (listing.listingType === 'paid' ? 'pickup_cash' : 'free'),
      paymentStatus: paymentDetails?.status || (listing.listingType === 'paid' ? 'pending' : 'completed'),
      transactionRef: paymentDetails?.transactionRef || null,
      status: 'accepted', // POSTED -> ACCEPTED -> PICKUP STARTED -> PICKED UP -> DELIVERED
      acceptedAt: new Date().toISOString(),
      pickupStartedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    donations.unshift(newDonation);
    saveStorage(STORAGE_KEYS.DONATIONS, donations);

    // 3. Notify Donor
    notificationService.createNotification({
      userId: listing.donorId,
      title: 'Donation Accepted!',
      message: `${newDonation.ngoName} has accepted your listing: ${listing.foodName}.${listing.listingType === 'paid' ? ` (Payment: ${newDonation.paymentMethod === 'direct_upi' ? 'Paid via UPI' : 'Pay on Collection'})` : ''}`,
      type: 'donation_accepted',
      relatedId: newDonation.id
    });

    return newDonation;
  },
  updateStatus(donationId, nextStatus) {
    const donations = loadStorage(STORAGE_KEYS.DONATIONS, []);
    const donation = donations.find(d => d.id === donationId);
    if (!donation) throw new Error('Donation not found');

    donation.status = nextStatus;
    const now = new Date().toISOString();

    if (nextStatus === 'pickup_started') donation.pickupStartedAt = now;
    if (nextStatus === 'picked_up') donation.pickedUpAt = now;
    if (nextStatus === 'delivered') donation.deliveredAt = now;
    donation.updatedAt = now;

    saveStorage(STORAGE_KEYS.DONATIONS, donations);

    // Also sync listing status
    if (donation.foodListingId) {
      foodService.updateListing(donation.foodListingId, { status: nextStatus });
    }

    // Notify Donor
    const statusTitles = {
      pickup_started: 'Pickup Has Started',
      picked_up: 'Food Picked Up Successfully',
      delivered: 'Donation Delivered to Beneficiaries'
    };
    notificationService.createNotification({
      userId: donation.donorId,
      title: statusTitles[nextStatus] || 'Donation Status Updated',
      message: `Status of ${donation.foodName} is now: ${nextStatus.replace('_', ' ').toUpperCase()}`,
      type: 'status_update',
      relatedId: donation.id
    });

    return donation;
  }
};

// -------------------------------------------------------------
// MUNICIPAL WASTE MANAGEMENT SERVICES (Section 6)
// For expired/spoiled surplus food disposal
// -------------------------------------------------------------
export const wasteService = {
  getRequests() {
    return loadStorage(STORAGE_KEYS.WASTE_REQUESTS, []);
  },
  getDonorRequests(donorId) {
    const all = this.getRequests();
    return all.filter(r => r.donorId === donorId);
  },
  createWasteRequest({ donorId, donorName, foodListingId, foodName, quantity, spoilageReason, regionWard, address, preferredSlot }) {
    const requests = loadStorage(STORAGE_KEYS.WASTE_REQUESTS, []);
    const ticketNumber = 'MC-WASTE-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newRequest = {
      id: 'waste_' + Date.now(),
      ticketNumber,
      donorId,
      donorName,
      foodListingId: foodListingId || null,
      foodName,
      quantity,
      spoilageReason: spoilageReason || 'Past safe consumption window / Expiration',
      regionWard: regionWard || 'Zone 1 - Central Ward',
      address,
      preferredSlot: preferredSlot || 'Morning (8:00 AM - 11:00 AM)',
      status: 'scheduled', // 'requested' | 'scheduled' | 'collected'
      wasteDestination: 'Municipal Organic Composting & Biogas Facility',
      createdAt: new Date().toISOString()
    };

    requests.unshift(newRequest);
    saveStorage(STORAGE_KEYS.WASTE_REQUESTS, requests);

    // If linked to listing, mark listing status
    if (foodListingId) {
      foodService.updateListing(foodListingId, { status: 'waste_collection_requested' });
    }

    return newRequest;
  }
};

// -------------------------------------------------------------
// CHAT & MESSAGING SERVICES
// -------------------------------------------------------------
export const messageService = {
  getMessages(conversationId) {
    const all = loadStorage(STORAGE_KEYS.MESSAGES, []);
    if (!conversationId) return all;
    return all.filter(m => m.conversationId === conversationId);
  },
  sendMessage({ conversationId, senderId, senderName, receiverId, message }) {
    const messages = loadStorage(STORAGE_KEYS.MESSAGES, []);
    const newMsg = {
      id: 'msg_' + Date.now(),
      conversationId: conversationId || 'conv_general',
      senderId,
      senderName,
      receiverId,
      message,
      createdAt: new Date().toISOString(),
      read: false
    };
    messages.push(newMsg);
    saveStorage(STORAGE_KEYS.MESSAGES, messages);
    return newMsg;
  },
  markRead(conversationId, currentUserId) {
    const messages = loadStorage(STORAGE_KEYS.MESSAGES, []);
    let updated = false;
    messages.forEach(m => {
      if (m.conversationId === conversationId && m.receiverId === currentUserId && !m.read) {
        m.read = true;
        updated = true;
      }
    });
    if (updated) saveStorage(STORAGE_KEYS.MESSAGES, messages);
  }
};

// -------------------------------------------------------------
// NOTIFICATIONS SERVICES
// -------------------------------------------------------------
export const notificationService = {
  getNotifications(userId) {
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    if (!userId) return all;
    return all.filter(n => n.userId === userId || n.userId === 'all');
  },
  getUnreadCount(userId) {
    const list = this.getNotifications(userId);
    return list.filter(n => !n.read).length;
  },
  createNotification(notifData) {
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif = {
      id: 'notif_' + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notifData
    };
    all.unshift(newNotif);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    return newNotif;
  },
  markAllAsRead(userId) {
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    all.forEach(n => {
      if (n.userId === userId || n.userId === 'all') n.read = true;
    });
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  }
};
