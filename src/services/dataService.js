// ===================================================================
// FOODCONNECT - DATA SERVICE LAYER (CLOUD FIRESTORE & DYNAMIC NOTIFICATIONS)
// Provides dual-mode data persistence:
// - Cloud Firestore when Firebase config is active (enabling multi-device real-time sync)
// - Resilient local persistence with zero mock data
// - Real Municipal Corporation directory for waste collection
// ===================================================================

import { 
  db, 
  isCloudFirebaseActive, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from './firebase';

const STORAGE_KEYS = {
  USERS: 'foodconnect_users_v2',
  LISTINGS: 'foodconnect_listings_v2',
  DONATIONS: 'foodconnect_donations_v2',
  MESSAGES: 'foodconnect_messages_v2',
  NOTIFICATIONS: 'foodconnect_notifications_v2',
  WASTE_REQUESTS: 'foodconnect_waste_requests_v2'
};

// Safe storage utilities
function loadStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
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

// Check if a listing is expired
export function isListingExpired(listing) {
  if (!listing) return false;
  if (listing.status === 'expired') return true;
  if (!listing.expiresAt) return false;
  const expireDate = new Date(listing.expiresAt);
  return !isNaN(expireDate.getTime()) && Date.now() > expireDate.getTime();
}

// -------------------------------------------------------------
// MAJOR CITIES GPS COORDINATES REFERENCE
// -------------------------------------------------------------
export const MAJOR_CITIES_COORDINATES = {
  jaipur: { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  delhi: { name: 'New Delhi / NCR', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  mumbai: { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  bengaluru: { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  hyderabad: { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  chennai: { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  pune: { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  kolkata: { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  ahmedabad: { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  lucknow: { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  chandigarh: { name: 'Chandigarh', state: 'Punjab/Haryana', lat: 30.7333, lng: 76.7794 },
  other: { name: 'Other Indian City', state: 'India', lat: 26.9124, lng: 75.7873 }
};

// -------------------------------------------------------------
// REAL MUNICIPAL CORPORATION DIRECTORY
// Official helpline numbers, emails, and solid waste departments
// -------------------------------------------------------------
export const MUNICIPAL_CORPORATIONS_DIRECTORY = {
  jaipur: {
    name: 'Jaipur Municipal Corporation (Greater & Heritage)',
    helpline: '0141-2742823',
    phoneClean: '+911412742823',
    tollFree: '1800-180-6127',
    email: 'nnj.helpline@rajasthan.gov.in',
    wasteDepartment: 'Solid Waste & Bio-Methanation Division',
    centralFacility: 'Sewapura Composting & Bio-Gas Energy Plant, Jaipur',
    website: 'https://jaipurmc.org'
  },
  delhi: {
    name: 'Municipal Corporation of Delhi (MCD)',
    helpline: '155304',
    phoneClean: '155304',
    tollFree: '011-23225902',
    email: 'mcd-waste@mcd.nic.in',
    wasteDepartment: 'Department of Environment Management Services (DEMS)',
    centralFacility: 'Okhla Bio-Methanation & Waste-to-Energy Plant, New Delhi',
    website: 'https://mcdonline.nic.in'
  },
  mumbai: {
    name: 'Brihanmumbai Municipal Corporation (BMC)',
    helpline: '1916',
    phoneClean: '1916',
    tollFree: '022-22694727',
    email: 'swm.mcgm@mcgm.gov.in',
    wasteDepartment: 'Solid Waste Management (SWM) Department',
    centralFacility: 'Deonar Organic Processing & Compost Facility, Mumbai',
    website: 'https://portal.mcgm.gov.in'
  },
  bengaluru: {
    name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    helpline: '1533',
    phoneClean: '1533',
    tollFree: '080-22660000',
    email: 'comm@bbmp.gov.in',
    wasteDepartment: 'Solid Waste Management Special Cell',
    centralFacility: 'Kannahalli Wet Waste & Bio-Energy Processing Plant',
    website: 'https://bbmp.gov.in'
  },
  hyderabad: {
    name: 'Greater Hyderabad Municipal Corporation (GHMC)',
    helpline: '040-21111111',
    phoneClean: '+914021111111',
    tollFree: '1800-425-0004',
    email: 'commissioner-ghmc@telangana.gov.in',
    wasteDepartment: 'Sanitation & Solid Waste Wing',
    centralFacility: 'Jawaharnagar Integrated Waste Management Facility',
    website: 'https://ghmc.gov.in'
  },
  chennai: {
    name: 'Greater Chennai Corporation (GCC)',
    helpline: '1913',
    phoneClean: '1913',
    tollFree: '044-25619206',
    email: 'commissioner@chennaicorporation.gov.in',
    wasteDepartment: 'Solid Waste Management Department',
    centralFacility: 'Kodungaiyur Bio-CNG & Composting Plant, Chennai',
    website: 'https://chennaicorporation.gov.in'
  },
  pune: {
    name: 'Pune Municipal Corporation (PMC)',
    helpline: '1800-1030-222',
    phoneClean: '18001030222',
    tollFree: '020-25501000',
    email: 'solidwaste@punecorporation.org',
    wasteDepartment: 'Solid Waste Management Department',
    centralFacility: 'Uruli Devachi Bio-Gas & Organic Fertilizer Plant, Pune',
    website: 'https://pmc.gov.in'
  },
  ahmedabad: {
    name: 'Ahmedabad Municipal Corporation (AMC)',
    helpline: '155303',
    phoneClean: '155303',
    tollFree: '1800-233-2330',
    email: 'solidwaste@ahmedabadcity.gov.in',
    wasteDepartment: 'Solid Waste Management Department',
    centralFacility: 'Pirana Composting & Biogas Energy Plant, Ahmedabad',
    website: 'https://ahmedabadcity.gov.in'
  },
  kolkata: {
    name: 'Kolkata Municipal Corporation (KMC)',
    helpline: '033-22861212',
    phoneClean: '+913322861212',
    tollFree: '1800-345-3375',
    email: 'feedback@kmcgov.in',
    wasteDepartment: 'Solid Waste Management Department (SWM)',
    centralFacility: 'Dhapa Bio-Degradable Waste Processing Plant, Kolkata',
    website: 'https://www.kmcgov.in'
  },
  lucknow: {
    name: 'Lucknow Municipal Corporation (LMC)',
    helpline: '1533',
    phoneClean: '1533',
    tollFree: '0522-2307782',
    email: 'nnlko@nic.in',
    wasteDepartment: 'Environment & Solid Waste Cell',
    centralFacility: 'Shivri Solid Waste & Organic Fertilizer Plant, Lucknow',
    website: 'https://lmc.up.nic.in'
  },
  chandigarh: {
    name: 'Municipal Corporation Chandigarh (MCC)',
    helpline: '0172-2787200',
    phoneClean: '+911722787200',
    tollFree: '1800-180-2130',
    email: 'comm-mcc-chd@nic.in',
    wasteDepartment: 'Medical Officer of Health & SWM Division',
    centralFacility: 'Dadumajra Integrated Solid Waste Processing Plant',
    website: 'https://mcchandigarh.gov.in'
  },
  national: {
    name: 'Swachh Bharat Urban Mission & Central Municipal Helpline',
    helpline: '1969',
    phoneClean: '1969',
    tollFree: '1800-11-1969',
    email: 'swachhbharat@gov.in',
    wasteDepartment: 'Ministry of Housing and Urban Affairs (MoHUA)',
    centralFacility: 'Designated Regional Organic Biogas & Composting Center',
    website: 'https://swachhbharaturban.gov.in'
  }
};

export function getMunicipalContactForCity(cityName) {
  if (!cityName) return MUNICIPAL_CORPORATIONS_DIRECTORY.national;
  const lower = cityName.toLowerCase();
  for (const [key, val] of Object.entries(MUNICIPAL_CORPORATIONS_DIRECTORY)) {
    if (lower.includes(key)) return val;
  }
  return MUNICIPAL_CORPORATIONS_DIRECTORY.national;
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
      id: userData.id || 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: userData.name || userData.organizationName,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role, // 'donor' | 'ngo' | 'admin'
      organizationName: userData.organizationName || userData.name,
      address: userData.address || '',
      city: userData.city || 'Jaipur',
      location: userData.location || { lat: 26.9124, lng: 75.7873 },
      isVerified: userData.role === 'admin' ? true : false,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveStorage(STORAGE_KEYS.USERS, users);

    // Sync to Cloud Firestore if connected
    if (isCloudFirebaseActive() && db) {
      setDoc(doc(db, 'users', newUser.id), newUser).catch(e => console.warn('Firestore sync error:', e));
    }

    return newUser;
  },
  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      saveStorage(STORAGE_KEYS.USERS, users);

      if (isCloudFirebaseActive() && db) {
        updateDoc(doc(db, 'users', id), updates).catch(e => console.warn('Firestore update error:', e));
      }
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
      if (isCloudFirebaseActive() && db) {
        updateDoc(doc(db, 'users', id), { isVerified: user.isVerified }).catch(e => console.warn('Firestore verify sync:', e));
      }
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

    let expiresAt = listingData.expiresAt;
    if (!expiresAt) {
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
      latitude: Number(listingData.latitude) || 26.8520,
      longitude: Number(listingData.longitude) || 75.8050,
      listingType: listingData.listingType || 'free',
      price: listingData.listingType === 'paid' ? Number(listingData.price || 0) : 0,
      qualityScore: listingData.qualityScore || 88,
      qualityStatus: listingData.qualityStatus || 'Good Quality',
      qualityAnalysis: listingData.qualityAnalysis || null,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    listings.unshift(newListing);
    saveStorage(STORAGE_KEYS.LISTINGS, listings);

    // Sync to Cloud Firestore if configured
    if (isCloudFirebaseActive() && db) {
      setDoc(doc(db, 'foodListings', newListing.id), newListing).catch(e => console.warn('Firestore listing sync:', e));
    }

    // Trigger real notification for all registered NGOs
    const allUsers = userService.getUsers();
    const ngos = allUsers.filter(u => u.role === 'ngo');
    ngos.forEach(ngo => {
      notificationService.createNotification({
        userId: ngo.id,
        title: 'New Food Listing Available Nearby',
        message: `${newListing.donorName} posted ${newListing.quantity} ${newListing.unit} of ${newListing.foodName} (${newListing.listingType === 'paid' ? `₹${newListing.price}` : 'FREE'}).`,
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

      if (isCloudFirebaseActive() && db) {
        updateDoc(doc(db, 'foodListings', id), updates).catch(e => console.warn('Firestore listing update:', e));
      }
      return listings[index];
    }
    return null;
  },
  deleteListing(id) {
    let listings = loadStorage(STORAGE_KEYS.LISTINGS, []);
    listings = listings.filter(l => l.id !== id);
    saveStorage(STORAGE_KEYS.LISTINGS, listings);

    if (isCloudFirebaseActive() && db) {
      deleteDoc(doc(db, 'foodListings', id)).catch(e => console.warn('Firestore listing delete:', e));
    }
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
    
    if (isListingExpired(listing)) {
      foodService.updateListing(foodListingId, { status: 'expired' });
      throw new Error('This surplus food listing has expired and can no longer be accepted.');
    }

    if (listing.status !== 'available') {
      throw new Error('This food listing has already been accepted or is no longer available.');
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
      latitude: listing.latitude || 26.8520,
      longitude: listing.longitude || 75.8050,
      pickupLatitude: listing.latitude || 26.8520,
      pickupLongitude: listing.longitude || 75.8050,
      dropAddress: ngoUser.address || `${ngoUser.organizationName || ngoUser.name || 'NGO'} Headquarters`,
      dropLatitude: ngoUser.location?.lat || ngoUser.latitude || 26.8920,
      dropLongitude: ngoUser.location?.lng || ngoUser.longitude || 75.8250,
      distanceKm: calculateDistanceKm(
        listing.latitude || 26.8520,
        listing.longitude || 75.8050,
        ngoUser.location?.lat || ngoUser.latitude || 26.8920,
        ngoUser.location?.lng || ngoUser.longitude || 75.8250
      ),
      listingType: listing.listingType,
      price: listing.price,
      paymentMethod: paymentDetails?.method || (listing.listingType === 'paid' ? 'pickup_cash' : 'free'),
      paymentStatus: paymentDetails?.status || (listing.listingType === 'paid' ? 'pending' : 'completed'),
      transactionRef: paymentDetails?.transactionRef || null,
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      pickupStartedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    donations.unshift(newDonation);
    saveStorage(STORAGE_KEYS.DONATIONS, donations);

    // Sync to Cloud Firestore if connected
    if (isCloudFirebaseActive() && db) {
      setDoc(doc(db, 'donations', newDonation.id), newDonation).catch(e => console.warn('Firestore donation sync:', e));
    }

    // Notify Donor
    notificationService.createNotification({
      userId: listing.donorId,
      title: 'Donation Accepted!',
      message: `${newDonation.ngoName} has accepted your listing: ${listing.foodName}.${listing.listingType === 'paid' ? ` (${newDonation.paymentMethod === 'direct_upi' ? 'Paid via UPI' : 'Payment at pickup'})` : ''}`,
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

    if (donation.foodListingId) {
      foodService.updateListing(donation.foodListingId, { status: nextStatus });
    }

    if (isCloudFirebaseActive() && db) {
      updateDoc(doc(db, 'donations', donationId), donation).catch(e => console.warn('Firestore donation update:', e));
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
// MUNICIPAL WASTE MANAGEMENT SERVICES
// -------------------------------------------------------------
export const wasteService = {
  getRequests() {
    return loadStorage(STORAGE_KEYS.WASTE_REQUESTS, []);
  },
  getDonorRequests(donorId) {
    const all = this.getRequests();
    return all.filter(r => r.donorId === donorId);
  },
  createWasteRequest({ donorId, donorName, foodListingId, foodName, quantity, spoilageReason, regionWard, address, preferredSlot, municipalContact }) {
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
      regionWard: regionWard || 'Zonal Municipal Ward',
      address,
      preferredSlot: preferredSlot || 'Morning (8:00 AM - 11:00 AM)',
      municipalContact: municipalContact || MUNICIPAL_CORPORATIONS_DIRECTORY.national,
      status: 'scheduled',
      wasteDestination: municipalContact?.centralFacility || 'Municipal Organic Composting & Biogas Facility',
      createdAt: new Date().toISOString()
    };

    requests.unshift(newRequest);
    saveStorage(STORAGE_KEYS.WASTE_REQUESTS, requests);

    if (foodListingId) {
      foodService.updateListing(foodListingId, { status: 'waste_collection_requested' });
    }

    if (isCloudFirebaseActive() && db) {
      setDoc(doc(db, 'wasteRequests', newRequest.id), newRequest).catch(e => console.warn('Firestore waste sync:', e));
    }

    return newRequest;
  }
};

// -------------------------------------------------------------
// CHAT & MESSAGING SERVICES (REAL UNREAD COUNTS)
// -------------------------------------------------------------
export const messageService = {
  getMessages(conversationId) {
    const all = loadStorage(STORAGE_KEYS.MESSAGES, []);
    if (!conversationId) return all;
    return all.filter(m => m.conversationId === conversationId);
  },
  getUnreadCount(userId) {
    if (!userId) return 0;
    const all = loadStorage(STORAGE_KEYS.MESSAGES, []);
    return all.filter(m => m.receiverId === userId && !m.read).length;
  },
  sendMessage({ conversationId, senderId, senderName, receiverId, message }) {
    const messages = loadStorage(STORAGE_KEYS.MESSAGES, []);
    const newMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
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

    // Sync to Firestore
    if (isCloudFirebaseActive() && db) {
      setDoc(doc(db, 'messages', newMsg.id), newMsg).catch(e => console.warn('Firestore msg sync:', e));
    }

    // Also notify receiver
    notificationService.createNotification({
      userId: receiverId,
      title: 'New Message Received',
      message: `${senderName}: "${message.substring(0, 45)}${message.length > 45 ? '...' : ''}"`,
      type: 'chat_message',
      relatedId: newMsg.id
    });

    return newMsg;
  },
  markRead(conversationId, currentUserId) {
    const messages = loadStorage(STORAGE_KEYS.MESSAGES, []);
    let updated = false;
    messages.forEach(m => {
      if ((!conversationId || m.conversationId === conversationId) && m.receiverId === currentUserId && !m.read) {
        m.read = true;
        updated = true;
      }
    });
    if (updated) {
      saveStorage(STORAGE_KEYS.MESSAGES, messages);
    }
  }
};

// -------------------------------------------------------------
// NOTIFICATIONS SERVICES (REAL DYNAMIC UNREAD COUNTS)
// -------------------------------------------------------------
export const notificationService = {
  getNotifications(userId) {
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    if (!userId) return all;
    return all.filter(n => n.userId === userId || n.userId === 'all');
  },
  getUnreadCount(userId) {
    if (!userId) return 0;
    const list = this.getNotifications(userId);
    return list.filter(n => !n.read).length;
  },
  createNotification(notifData) {
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      read: false,
      createdAt: new Date().toISOString(),
      ...notifData
    };
    all.unshift(newNotif);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, all);

    if (isCloudFirebaseActive() && db) {
      setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(e => console.warn('Firestore notif sync:', e));
    }

    return newNotif;
  },
  markAsRead(id) {
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const notif = all.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      saveStorage(STORAGE_KEYS.NOTIFICATIONS, all);
      if (isCloudFirebaseActive() && db) {
        updateDoc(doc(db, 'notifications', id), { read: true }).catch(e => console.warn('Firestore read sync:', e));
      }
    }
  },
  markAllAsRead(userId) {
    const all = loadStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    all.forEach(n => {
      if (n.userId === userId || n.userId === 'all') n.read = true;
    });
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  }
};

// -------------------------------------------------------------
// REAL-TIME CLOUD FIRESTORE SYNCHRONIZATION (CROSS-DEVICE)
// Automatically keeps multiple devices & browser windows in sync
// -------------------------------------------------------------
export function initCloudRealtimeSync() {
  if (!isCloudFirebaseActive() || !db) return;

  try {
    // 1. Food Listings Sync
    onSnapshot(collection(db, 'foodListings'), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => items.push(docSnap.data()));
      if (items.length > 0) {
        saveStorage(STORAGE_KEYS.LISTINGS, items);
        window.dispatchEvent(new CustomEvent('foodconnect_data_updated', { detail: { collection: 'foodListings' } }));
      }
    }, (err) => console.warn('Cloud listings sync listener warning:', err));

    // 2. Donations Sync
    onSnapshot(collection(db, 'donations'), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => items.push(docSnap.data()));
      if (items.length > 0) {
        saveStorage(STORAGE_KEYS.DONATIONS, items);
        window.dispatchEvent(new CustomEvent('foodconnect_data_updated', { detail: { collection: 'donations' } }));
      }
    }, (err) => console.warn('Cloud donations sync listener warning:', err));

    // 3. Messages Sync (Live Chat Across Devices)
    onSnapshot(collection(db, 'messages'), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => items.push(docSnap.data()));
      if (items.length > 0) {
        saveStorage(STORAGE_KEYS.MESSAGES, items);
        window.dispatchEvent(new CustomEvent('foodconnect_data_updated', { detail: { collection: 'messages' } }));
      }
    }, (err) => console.warn('Cloud messages sync listener warning:', err));

    // 4. Notifications Sync
    onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => items.push(docSnap.data()));
      if (items.length > 0) {
        saveStorage(STORAGE_KEYS.NOTIFICATIONS, items);
        window.dispatchEvent(new CustomEvent('foodconnect_data_updated', { detail: { collection: 'notifications' } }));
      }
    }, (err) => console.warn('Cloud notifications sync listener warning:', err));

    // 5. Users Sync
    onSnapshot(collection(db, 'users'), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => items.push(docSnap.data()));
      if (items.length > 0) {
        saveStorage(STORAGE_KEYS.USERS, items);
        window.dispatchEvent(new CustomEvent('foodconnect_data_updated', { detail: { collection: 'users' } }));
      }
    }, (err) => console.warn('Cloud users sync listener warning:', err));
  } catch (e) {
    console.warn('Realtime cloud sync error:', e);
  }
}

// Auto-activate realtime cloud listeners if configured
if (typeof window !== 'undefined') {
  initCloudRealtimeSync();
}
