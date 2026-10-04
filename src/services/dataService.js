// ===================================================================
// FOODCONNECT - DATA SERVICE LAYER
// Handles all data operations for:
// - Users
// - Food Listings
// - Donations & Status Tracking
// - Messages
// - Notifications
// Uses LocalStorage persistence with seeded initial data from reference images.
// ===================================================================

const STORAGE_KEYS = {
  USERS: 'foodconnect_users',
  LISTINGS: 'foodconnect_listings',
  DONATIONS: 'foodconnect_donations',
  MESSAGES: 'foodconnect_messages',
  NOTIFICATIONS: 'foodconnect_notifications'
};

// Seed initial users matching reference images
const INITIAL_USERS = [
  {
    id: 'user_donor_1',
    name: 'Hotel Green Valley',
    email: 'hotel.greenvalley@example.com',
    role: 'donor',
    organizationName: 'Hotel Green Valley Resort & Dining',
    address: 'Near Tonk Road, Jaipur, Rajasthan',
    location: { lat: 26.8520, lng: 75.8050 },
    profileImage: '/images/FoodBridge Donation Dashboard.png',
    phone: '+91 98290 12345',
    isVerified: true,
    totalDonatedTons: 2.6,
    ngosReached: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_ngo_1',
    name: 'Hope Foundation',
    email: 'hope.foundation@ngo.org',
    role: 'ngo',
    organizationName: 'Hope Foundation for Hunger Relief',
    address: 'Adarsh Nagar, Jaipur, Rajasthan',
    location: { lat: 26.8920, lng: 75.8250 },
    profileImage: '/images/FoodBridge NGO Donation Dashboard.png',
    phone: '+91 98765 43210',
    isVerified: true,
    mealsDistributed: 125,
    foodSavedTons: 8.5,
    peopleFed: 350,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_admin_1',
    name: 'FoodConnect Admin',
    email: 'admin@foodconnect.org',
    role: 'admin',
    organizationName: 'FoodConnect Central Administration',
    address: 'National HQ, New Delhi',
    location: { lat: 28.6139, lng: 77.2090 },
    phone: '+91 11 2345 6789',
    isVerified: true,
    createdAt: new Date().toISOString()
  }
];

// Seed initial listings matching the user's reference images
const INITIAL_LISTINGS = [
  {
    id: 'food_1',
    donorId: 'user_donor_1',
    donorName: 'Hotel Green Valley',
    foodName: 'Veg Biryani',
    category: 'Rice',
    description: 'Freshly prepared aromatic basmati vegetable biryani with fresh mint, paneer and spices.',
    quantity: 25,
    unit: 'kg',
    foodType: 'Vegetarian',
    preparedAt: '11 May, 10:00 AM',
    pickupDeadline: 'Today, 6:00 PM',
    expiresInText: 'Expires in 4h 15m',
    imageURL: '/images/1.jpg',
    pickupAddress: 'Hotel Green Valley, Tonk Road, Jaipur',
    latitude: 26.8520,
    longitude: 75.8050,
    listingType: 'free',
    price: 0,
    qualityScore: 88,
    qualityStatus: 'Good Quality',
    status: 'available', // available | accepted | pickup_started | picked_up | delivered | cancelled
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_2',
    donorId: 'user_donor_1',
    donorName: 'Hotel Royal Palace',
    foodName: 'Paneer Curry',
    category: 'Curry',
    description: 'Rich tomato-cashew gravy with cottage cheese cubes. Packaged in sanitized food containers.',
    quantity: 15,
    unit: 'kg',
    foodType: 'Vegetarian',
    preparedAt: '11 May, 09:30 AM',
    pickupDeadline: 'Today, 7:30 PM',
    expiresInText: 'Expires in 6h 20m',
    imageURL: '/images/2.jpg',
    pickupAddress: 'Royal Palace Banquet, C-Scheme, Jaipur',
    latitude: 26.9050,
    longitude: 75.8000,
    listingType: 'free',
    price: 0,
    qualityScore: 85,
    qualityStatus: 'Good Quality',
    status: 'available',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_3',
    donorId: 'user_donor_1',
    donorName: 'Hotel Sunrise',
    foodName: 'Dal Tadka',
    category: 'Curry',
    description: 'Traditional yellow lentils tempered with cumin, garlic and clarified butter. Hot and fresh.',
    quantity: 20,
    unit: 'kg',
    foodType: 'Vegetarian',
    preparedAt: '11 May, 09:00 AM',
    pickupDeadline: 'Today, 8:00 PM',
    expiresInText: 'Expires in 7h 10m',
    imageURL: '/images/4.jpg',
    pickupAddress: 'Hotel Sunrise, MI Road, Jaipur',
    latitude: 26.9180,
    longitude: 75.8150,
    listingType: 'free',
    price: 0,
    qualityScore: 90,
    qualityStatus: 'Excellent Quality',
    status: 'available',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_4',
    donorId: 'user_donor_1',
    donorName: 'Hotel Modern Stay',
    foodName: 'Fresh Salad',
    category: 'Vegetables',
    description: 'Crisp garden vegetables including cucumber, carrots, cherry tomatoes, and sweet corn.',
    quantity: 10,
    unit: 'kg',
    foodType: 'Vegetarian',
    preparedAt: '11 May, 11:00 AM',
    pickupDeadline: 'Today, 9:00 PM',
    expiresInText: 'Expires in 8h 45m',
    imageURL: '/images/3.jpg',
    pickupAddress: 'Hotel Modern Stay, Mansarovar, Jaipur',
    latitude: 26.8600,
    longitude: 75.7600,
    listingType: 'free',
    price: 0,
    qualityScore: 92,
    qualityStatus: 'Excellent Quality',
    status: 'available',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_5',
    donorId: 'user_donor_1',
    donorName: 'Hotel Grand Plaza',
    foodName: 'Gulab Jamun',
    category: 'Desserts',
    description: 'Delicious warm sweet dumplings in rose-scented cardamom syrup from lunch banquet.',
    quantity: 8,
    unit: 'kg',
    foodType: 'Vegetarian',
    preparedAt: '11 May, 10:30 AM',
    pickupDeadline: 'Today, 10:00 PM',
    expiresInText: 'Expires in 9h 30m',
    imageURL: '/images/5.jpg',
    pickupAddress: 'Hotel Grand Plaza, Malviya Nagar, Jaipur',
    latitude: 26.8500,
    longitude: 75.8200,
    listingType: 'free',
    price: 0,
    qualityScore: 94,
    qualityStatus: 'Excellent Quality',
    status: 'available',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Seed initial active donations
const INITIAL_DONATIONS = [
  {
    id: 'donation_1',
    foodListingId: 'food_sample_accepted',
    foodName: 'Special Thali Meals',
    donorId: 'user_donor_1',
    donorName: 'Hotel Green Valley',
    ngoId: 'user_ngo_1',
    ngoName: 'Hope Foundation',
    quantity: '30 Meals',
    imageURL: '/images/6.jpg',
    status: 'accepted', // POSTED -> ACCEPTED -> PICKUP STARTED -> PICKED UP -> DELIVERED
    pickupAddress: 'Hotel Green Valley, Tonk Road, Jaipur',
    acceptedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    pickupStartedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Seed initial messages
const INITIAL_MESSAGES = [
  {
    id: 'msg_1',
    conversationId: 'conv_donor1_ngo1',
    senderId: 'user_donor_1',
    senderName: 'Hotel Green Valley',
    receiverId: 'user_ngo_1',
    message: 'Hello Hope Foundation! The Veg Biryani is packed in insulated containers and ready at the back kitchen entrance.',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: 'msg_2',
    conversationId: 'conv_donor1_ngo1',
    senderId: 'user_ngo_1',
    senderName: 'Hope Foundation',
    receiverId: 'user_donor_1',
    message: 'Thank you! Our volunteer van has started towards your location and will arrive in 20 minutes.',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: 'msg_3',
    conversationId: 'conv_donor1_ngo1',
    senderId: 'user_donor_1',
    senderName: 'Hotel Green Valley',
    receiverId: 'user_ngo_1',
    message: 'Understood. Please call Mr. Ramesh at the kitchen gate when you arrive.',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: false
  }
];

// Seed initial notifications
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'user_ngo_1',
    title: 'New Food Available Nearby',
    message: 'Hotel Green Valley has listed 25 kg Veg Biryani (2.4 km away).',
    type: 'new_food',
    relatedId: 'food_1',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif_2',
    userId: 'user_donor_1',
    title: 'Listing Accepted!',
    message: 'Hope Foundation accepted your Special Thali Meals donation.',
    type: 'donation_accepted',
    relatedId: 'donation_1',
    read: false,
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif_3',
    userId: 'user_ngo_1',
    title: 'Pickup Status Update',
    message: 'Special Thali Meals is ready for pickup at Tonk Road.',
    type: 'pickup_status',
    relatedId: 'donation_1',
    read: false,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  }
];

// LocalStorage helpers
function loadStorage(key, fallback) {
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

// Distance Calculation (Haversine formula in kilometers)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 2.5; // default fallback
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Number(dist.toFixed(1));
}

// -------------------------------------------------------------
// USER SERVICES
// -------------------------------------------------------------
export const userService = {
  getUsers() {
    return loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  },
  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: 'user_' + Date.now(),
      isVerified: false,
      createdAt: new Date().toISOString(),
      ...userData
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
    return loadStorage(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
  },
  getListingById(id) {
    const listings = this.getListings();
    return listings.find(l => l.id === id) || null;
  },
  getAvailableListings() {
    const listings = this.getListings();
    return listings.filter(l => l.status === 'available');
  },
  getDonorListings(donorId) {
    const listings = this.getListings();
    return listings.filter(l => l.donorId === donorId);
  },
  createListing(listingData) {
    const listings = this.getListings();
    const newListing = {
      id: 'food_' + Date.now(),
      status: 'available',
      qualityScore: listingData.qualityScore || Math.floor(Math.random() * 12) + 85,
      qualityStatus: 'Good Quality',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...listingData
    };
    listings.unshift(newListing);
    saveStorage(STORAGE_KEYS.LISTINGS, listings);

    // Create notification for NGOs
    notificationService.createNotification({
      userId: 'user_ngo_1',
      title: 'New Food Listing Available Nearby',
      message: `${newListing.donorName || 'A local donor'} listed ${newListing.quantity} ${newListing.unit} of ${newListing.foodName}.`,
      type: 'new_food',
      relatedId: newListing.id
    });

    return newListing;
  },
  updateListing(id, updates) {
    const listings = this.getListings();
    const index = listings.findIndex(l => l.id === id);
    if (index !== -1) {
      listings[index] = { ...listings[index], ...updates, updatedAt: new Date().toISOString() };
      saveStorage(STORAGE_KEYS.LISTINGS, listings);
      return listings[index];
    }
    return null;
  },
  deleteListing(id) {
    let listings = this.getListings();
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
    return loadStorage(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
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
  acceptDonation(foodListingId, ngoUser) {
    const listing = foodService.getListingById(foodListingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.status !== 'available') throw new Error('This food listing is no longer available.');

    // 1. Mark listing as accepted
    foodService.updateListing(foodListingId, { status: 'accepted' });

    // 2. Create donation record
    const donations = this.getDonations();
    const newDonation = {
      id: 'donation_' + Date.now(),
      foodListingId: listing.id,
      foodName: listing.foodName,
      donorId: listing.donorId,
      donorName: listing.donorName || 'Hotel Green Valley',
      ngoId: ngoUser.id,
      ngoName: ngoUser.organizationName || ngoUser.name || 'Hope Foundation',
      quantity: `${listing.quantity} ${listing.unit}`,
      imageURL: listing.imageURL,
      pickupAddress: listing.pickupAddress,
      latitude: listing.latitude,
      longitude: listing.longitude,
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

    // 3. Create notification for donor
    notificationService.createNotification({
      userId: listing.donorId,
      title: 'Donation Accepted!',
      message: `${newDonation.ngoName} has accepted your listing: ${listing.foodName}.`,
      type: 'donation_accepted',
      relatedId: newDonation.id
    });

    return newDonation;
  },
  updateStatus(donationId, nextStatus) {
    const donations = this.getDonations();
    const donation = donations.find(d => d.id === donationId);
    if (!donation) throw new Error('Donation not found');

    donation.status = nextStatus;
    const now = new Date().toISOString();

    if (nextStatus === 'pickup_started') donation.pickupStartedAt = now;
    if (nextStatus === 'picked_up') donation.pickedUpAt = now;
    if (nextStatus === 'delivered') donation.deliveredAt = now;
    donation.updatedAt = now;

    saveStorage(STORAGE_KEYS.DONATIONS, donations);

    // Update listing status correspondingly
    if (donation.foodListingId) {
      foodService.updateListing(donation.foodListingId, { status: nextStatus });
    }

    // Notify donor & NGO
    const statusTitles = {
      pickup_started: 'Pickup Has Started',
      picked_up: 'Food Picked Up Successfully',
      delivered: 'Donation Delivered to Beneficiaries'
    };
    notificationService.createNotification({
      userId: donation.donorId,
      title: statusTitles[nextStatus] || 'Donation Status Updated',
      message: `Status of ${donation.foodName} changed to: ${nextStatus.replace('_', ' ').toUpperCase()}`,
      type: 'status_update',
      relatedId: donation.id
    });

    return donation;
  }
};

// -------------------------------------------------------------
// CHAT & MESSAGING SERVICES
// -------------------------------------------------------------
export const messageService = {
  getMessages(conversationId) {
    const all = loadStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    if (!conversationId) return all;
    return all.filter(m => m.conversationId === conversationId);
  },
  sendMessage({ conversationId, senderId, senderName, receiverId, message }) {
    const messages = loadStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const newMsg = {
      id: 'msg_' + Date.now(),
      conversationId: conversationId || 'conv_donor1_ngo1',
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
    const messages = loadStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
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
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId) return all;
    return all.filter(n => n.userId === userId || n.userId === 'all');
  },
  getUnreadCount(userId) {
    const list = this.getNotifications(userId);
    return list.filter(n => !n.read).length;
  },
  createNotification(notifData) {
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
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
  markAsRead(id) {
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const notif = all.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      saveStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  },
  markAllAsRead(userId) {
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    all.forEach(n => {
      if (n.userId === userId || n.userId === 'all') n.read = true;
    });
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  }
};
