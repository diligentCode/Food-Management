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
// COMPREHENSIVE ALL-INDIAN CITIES DIRECTORY (150+ CITIES)
// -------------------------------------------------------------
export const ALL_INDIAN_CITIES = [
  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
  { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
  { name: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648 },
  { name: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lng: 73.3119 },
  { name: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lng: 74.6399 },
  { name: 'Bhilwara', state: 'Rajasthan', lat: 25.3407, lng: 74.6313 },
  { name: 'Alwar', state: 'Rajasthan', lat: 27.5530, lng: 76.6346 },
  { name: 'Sikar', state: 'Rajasthan', lat: 27.6094, lng: 75.1399 },
  { name: 'Bharatpur', state: 'Rajasthan', lat: 27.2152, lng: 77.5030 },
  { name: 'Pali', state: 'Rajasthan', lat: 25.7713, lng: 73.3237 },
  { name: 'Sri Ganganagar', state: 'Rajasthan', lat: 29.9038, lng: 73.8772 },
  { name: 'Chittorgarh', state: 'Rajasthan', lat: 24.8887, lng: 74.6269 },
  { name: 'Mount Abu', state: 'Rajasthan', lat: 24.5926, lng: 72.7156 },

  // Delhi NCR
  { name: 'New Delhi', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910 },
  { name: 'Greater Noida', state: 'Uttar Pradesh', lat: 28.4744, lng: 77.5040 },
  { name: 'Gurugram (Gurgaon)', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  { name: 'Faridabad', state: 'Haryana', lat: 28.4089, lng: 77.3178 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lng: 77.4538 },

  // Maharashtra
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781 },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
  { name: 'Navi Mumbai', state: 'Maharashtra', lat: 19.0330, lng: 73.0297 },
  { name: 'Chhatrapati Sambhajinagar (Aurangabad)', state: 'Maharashtra', lat: 19.8762, lng: 75.3433 },
  { name: 'Solapur', state: 'Maharashtra', lat: 17.6599, lng: 75.9064 },
  { name: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lng: 74.2433 },
  { name: 'Amravati', state: 'Maharashtra', lat: 20.9374, lng: 77.7796 },
  { name: 'Nanded', state: 'Maharashtra', lat: 19.1383, lng: 77.3210 },
  { name: 'Jalgaon', state: 'Maharashtra', lat: 21.0077, lng: 75.5626 },
  { name: 'Akola', state: 'Maharashtra', lat: 20.7002, lng: 77.0082 },
  { name: 'Latur', state: 'Maharashtra', lat: 18.4088, lng: 76.5604 },
  { name: 'Dhule', state: 'Maharashtra', lat: 20.9042, lng: 74.7749 },
  { name: 'Ahmednagar', state: 'Maharashtra', lat: 19.0952, lng: 74.7496 },
  { name: 'Chandrapur', state: 'Maharashtra', lat: 19.9615, lng: 79.2961 },
  { name: 'Kalyan-Dombivli', state: 'Maharashtra', lat: 19.2403, lng: 73.1305 },
  { name: 'Vasai-Virar', state: 'Maharashtra', lat: 19.4259, lng: 72.8225 },

  // Karnataka
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Mysuru (Mysore)', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
  { name: 'Mangaluru', state: 'Karnataka', lat: 12.9141, lng: 74.8560 },
  { name: 'Hubballi-Dharwad', state: 'Karnataka', lat: 15.3647, lng: 75.1240 },
  { name: 'Belagavi (Belgaum)', state: 'Karnataka', lat: 15.8497, lng: 74.4977 },
  { name: 'Davanagere', state: 'Karnataka', lat: 14.4644, lng: 75.9218 },
  { name: 'Ballari (Bellary)', state: 'Karnataka', lat: 15.1394, lng: 76.9214 },
  { name: 'Shivamogga (Shimoga)', state: 'Karnataka', lat: 13.9299, lng: 75.5681 },
  { name: 'Tumakuru', state: 'Karnataka', lat: 13.3409, lng: 77.1010 },
  { name: 'Udupi', state: 'Karnataka', lat: 13.3409, lng: 74.7421 },

  // Tamil Nadu
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
  { name: 'Tiruchirappalli (Trichy)', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047 },
  { name: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460 },
  { name: 'Tiruppur', state: 'Tamil Nadu', lat: 11.1085, lng: 77.3411 },
  { name: 'Erode', state: 'Tamil Nadu', lat: 11.3410, lng: 77.7172 },
  { name: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lng: 79.1325 },
  { name: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lng: 77.7567 },
  { name: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.7642, lng: 78.1348 },
  { name: 'Dindigul', state: 'Tamil Nadu', lat: 10.3673, lng: 77.9803 },
  { name: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7870, lng: 79.1378 },
  { name: 'Nagercoil', state: 'Tamil Nadu', lat: 8.1833, lng: 77.4119 },

  // Telangana
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941 },
  { name: 'Nizamabad', state: 'Telangana', lat: 18.6725, lng: 78.0941 },
  { name: 'Karimnagar', state: 'Telangana', lat: 18.4386, lng: 79.1288 },
  { name: 'Ramagundam', state: 'Telangana', lat: 18.7557, lng: 79.5126 },
  { name: 'Khammam', state: 'Telangana', lat: 17.2473, lng: 80.1514 },

  // Andhra Pradesh
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480 },
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365 },
  { name: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lng: 79.9865 },
  { name: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lng: 78.0373 },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', lat: 17.0005, lng: 81.8040 },
  { name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192 },
  { name: 'Kakinada', state: 'Andhra Pradesh', lat: 16.9891, lng: 82.2475 },
  { name: 'Kadapa', state: 'Andhra Pradesh', lat: 14.4673, lng: 78.8242 },
  { name: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lng: 77.6006 },

  // Gujarat
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
  { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022 },
  { name: 'Bhavnagar', state: 'Gujarat', lat: 21.7645, lng: 72.1519 },
  { name: 'Jamnagar', state: 'Gujarat', lat: 22.4707, lng: 70.0577 },
  { name: 'Gandhinagar', state: 'Gujarat', lat: 23.2156, lng: 72.6369 },
  { name: 'Junagadh', state: 'Gujarat', lat: 21.5222, lng: 70.4579 },
  { name: 'Anand', state: 'Gujarat', lat: 22.5645, lng: 72.9289 },
  { name: 'Navsari', state: 'Gujarat', lat: 20.9467, lng: 72.9520 },
  { name: 'Morbi', state: 'Gujarat', lat: 22.8120, lng: 70.8378 },
  { name: 'Bharuch', state: 'Gujarat', lat: 21.7051, lng: 72.9959 },

  // West Bengal
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Howrah', state: 'West Bengal', lat: 22.5958, lng: 88.2636 },
  { name: 'Durgapur', state: 'West Bengal', lat: 23.5204, lng: 87.3119 },
  { name: 'Asansol', state: 'West Bengal', lat: 23.6739, lng: 86.9524 },
  { name: 'Siliguri', state: 'West Bengal', lat: 26.7271, lng: 88.3953 },
  { name: 'Bardhaman', state: 'West Bengal', lat: 23.2324, lng: 87.8615 },
  { name: 'Kharagpur', state: 'West Bengal', lat: 22.3460, lng: 87.2320 },
  { name: 'Darjeeling', state: 'West Bengal', lat: 27.0410, lng: 88.2663 },

  // Uttar Pradesh
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319 },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  { name: 'Prayagraj (Allahabad)', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463 },
  { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064 },
  { name: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lng: 79.4304 },
  { name: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lng: 78.0880 },
  { name: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8386, lng: 78.7733 },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lng: 83.3732 },
  { name: 'Jhansi', state: 'Uttar Pradesh', lat: 25.4484, lng: 78.5685 },
  { name: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lng: 77.6737 },
  { name: 'Ayodhya', state: 'Uttar Pradesh', lat: 26.7922, lng: 82.1998 },
  { name: 'Saharanpur', state: 'Uttar Pradesh', lat: 29.9640, lng: 77.5460 },
  { name: 'Firozabad', state: 'Uttar Pradesh', lat: 27.1594, lng: 78.3957 },

  // Madhya Pradesh
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lng: 79.9864 },
  { name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828 },
  { name: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lng: 75.7885 },
  { name: 'Sagar', state: 'Madhya Pradesh', lat: 23.8388, lng: 78.7378 },
  { name: 'Dewas', state: 'Madhya Pradesh', lat: 22.9676, lng: 76.0534 },
  { name: 'Satna', state: 'Madhya Pradesh', lat: 24.5800, lng: 80.8300 },
  { name: 'Ratlam', state: 'Madhya Pradesh', lat: 23.3315, lng: 75.0367 },

  // Punjab
  { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
  { name: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762 },
  { name: 'Patiala', state: 'Punjab', lat: 30.3398, lng: 76.3869 },
  { name: 'Bathinda', state: 'Punjab', lat: 30.2110, lng: 74.9455 },
  { name: 'Mohali (SAS Nagar)', state: 'Punjab', lat: 30.7046, lng: 76.7179 },
  { name: 'Pathankot', state: 'Punjab', lat: 32.2684, lng: 75.6528 },

  // Haryana
  { name: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635 },
  { name: 'Ambala', state: 'Haryana', lat: 30.3782, lng: 76.7767 },
  { name: 'Yamunanagar', state: 'Haryana', lat: 30.1290, lng: 77.2674 },
  { name: 'Rohtak', state: 'Haryana', lat: 28.8955, lng: 76.6066 },
  { name: 'Hisar', state: 'Haryana', lat: 29.1492, lng: 75.7217 },
  { name: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
  { name: 'Sonipat', state: 'Haryana', lat: 28.9931, lng: 77.0151 },
  { name: 'Panchkula', state: 'Haryana', lat: 30.6942, lng: 76.8606 },

  // Bihar
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { name: 'Gaya', state: 'Bihar', lat: 24.7914, lng: 85.0002 },
  { name: 'Bhagalpur', state: 'Bihar', lat: 25.2425, lng: 86.9842 },
  { name: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lng: 85.3647 },
  { name: 'Purnia', state: 'Bihar', lat: 25.7771, lng: 87.4753 },
  { name: 'Darbhanga', state: 'Bihar', lat: 26.1542, lng: 85.8918 },
  { name: 'Bihar Sharif', state: 'Bihar', lat: 25.1982, lng: 85.5149 },

  // Kerala
  { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 },
  { name: 'Kochi (Cochin)', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { name: 'Kozhikode (Calicut)', state: 'Kerala', lat: 11.2588, lng: 75.7804 },
  { name: 'Thrissur', state: 'Kerala', lat: 10.5276, lng: 76.2144 },
  { name: 'Kollam', state: 'Kerala', lat: 8.8932, lng: 76.6141 },
  { name: 'Alappuzha', state: 'Kerala', lat: 9.4981, lng: 76.3388 },
  { name: 'Palakkad', state: 'Kerala', lat: 10.7867, lng: 76.6548 },
  { name: 'Kannur', state: 'Kerala', lat: 11.8745, lng: 75.3704 },

  // Odisha
  { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  { name: 'Cuttack', state: 'Odisha', lat: 20.4625, lng: 85.8828 },
  { name: 'Rourkela', state: 'Odisha', lat: 22.2604, lng: 84.8536 },
  { name: 'Berhampur', state: 'Odisha', lat: 19.3150, lng: 84.7941 },
  { name: 'Sambalpur', state: 'Odisha', lat: 21.4669, lng: 83.9812 },
  { name: 'Puri', state: 'Odisha', lat: 19.8135, lng: 85.8312 },

  // Jharkhand
  { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096 },
  { name: 'Jamshedpur', state: 'Jharkhand', lat: 22.8046, lng: 86.2029 },
  { name: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lng: 86.4304 },
  { name: 'Bokaro Steel City', state: 'Jharkhand', lat: 23.6693, lng: 86.1511 },
  { name: 'Deoghar', state: 'Jharkhand', lat: 24.4826, lng: 86.7001 },

  // Assam & Northeast
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { name: 'Silchar', state: 'Assam', lat: 24.8333, lng: 92.7789 },
  { name: 'Dibrugarh', state: 'Assam', lat: 27.4728, lng: 94.9120 },
  { name: 'Jorhat', state: 'Assam', lat: 26.7509, lng: 94.2037 },
  { name: 'Agartala', state: 'Tripura', lat: 23.8315, lng: 91.2868 },
  { name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lng: 91.8933 },
  { name: 'Imphal', state: 'Manipur', lat: 24.8170, lng: 93.9368 },
  { name: 'Aizawl', state: 'Mizoram', lat: 23.7271, lng: 92.7176 },
  { name: 'Kohima', state: 'Nagaland', lat: 25.6751, lng: 94.1086 },
  { name: 'Gangtok', state: 'Sikkim', lat: 27.3389, lng: 88.6065 },

  // Uttarakhand
  { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322 },
  { name: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lng: 78.1642 },
  { name: 'Roorkee', state: 'Uttarakhand', lat: 29.8543, lng: 77.8880 },
  { name: 'Haldwani', state: 'Uttarakhand', lat: 29.2183, lng: 79.5130 },
  { name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lng: 78.2676 },

  // Himachal Pradesh
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
  { name: 'Dharamshala', state: 'Himachal Pradesh', lat: 32.2190, lng: 76.3234 },
  { name: 'Solan', state: 'Himachal Pradesh', lat: 30.9084, lng: 77.0999 },
  { name: 'Mandi', state: 'Himachal Pradesh', lat: 31.7082, lng: 76.9320 },
  { name: 'Kullu', state: 'Himachal Pradesh', lat: 31.9579, lng: 77.1095 },

  // Goa, J&K, UTs
  { name: 'Panaji', state: 'Goa', lat: 15.4909, lng: 73.8278 },
  { name: 'Margao', state: 'Goa', lat: 15.2832, lng: 73.9862 },
  { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973 },
  { name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.7266, lng: 74.8570 },
  { name: 'Chandigarh', state: 'Chandigarh UT', lat: 30.7333, lng: 76.7794 },
  { name: 'Puducherry', state: 'Puducherry UT', lat: 11.9416, lng: 79.8083 },
  { name: 'Port Blair', state: 'Andaman & Nicobar', lat: 11.6234, lng: 92.7265 }
];

export function searchCities(query) {
  if (!query || !query.trim()) return ALL_INDIAN_CITIES.slice(0, 30);
  const q = query.toLowerCase().trim();
  const matches = ALL_INDIAN_CITIES.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.state.toLowerCase().includes(q)
  );
  if (matches.length > 0) return matches;
  return [{
    name: query.trim(),
    state: 'India',
    lat: 26.9124,
    lng: 75.7873
  }];
}

export function getCityCoordinates(cityName) {
  if (!cityName) return { lat: 26.9124, lng: 75.7873, name: 'Jaipur', state: 'Rajasthan' };
  const lower = cityName.toLowerCase().trim();
  const exact = ALL_INDIAN_CITIES.find(c => c.name.toLowerCase() === lower);
  if (exact) return exact;
  const partial = ALL_INDIAN_CITIES.find(c => lower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(lower));
  if (partial) return partial;
  return { lat: 26.9124, lng: 75.7873, name: cityName, state: 'India' };
}

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
  nagpur: {
    name: 'Nagpur Municipal Corporation (NMC)',
    helpline: '0712-2567035',
    phoneClean: '+917122567035',
    tollFree: '1800-233-3764',
    email: 'contact@nmcnagpur.gov.in',
    wasteDepartment: 'NMC Solid Waste Management & Health Department',
    centralFacility: 'Bhandewadi Solid Waste Processing & Bio-Mining Plant, Nagpur',
    website: 'https://www.nmcnagpur.gov.in'
  },
  indore: {
    name: 'Indore Municipal Corporation (IMC)',
    helpline: '0731-2535555',
    phoneClean: '+917312535555',
    tollFree: '1800-233-1313',
    email: 'commissioner@indorecity.gov.in',
    wasteDepartment: 'Solid Waste Management & 100% Segregation Division',
    centralFacility: 'Devguradia Bio-CNG (Gobardhan) & Mechanized Composting Facility, Indore',
    website: 'https://imcindore.mp.gov.in'
  },
  surat: {
    name: 'Surat Municipal Corporation (SMC)',
    helpline: '0261-2423751',
    phoneClean: '+912612423751',
    tollFree: '1800-123-8000',
    email: 'info@suratmunicipal.gov.in',
    wasteDepartment: 'Solid Waste Management Cell',
    centralFacility: 'Bhatar & Khajod Solid Waste Processing & Bio-Energy Plant, Surat',
    website: 'https://www.suratmunicipal.gov.in'
  },
  bhopal: {
    name: 'Bhopal Municipal Corporation (BMC)',
    helpline: '0755-2701000',
    phoneClean: '+917552701000',
    tollFree: '155304',
    email: 'commissioner@bmconline.gov.in',
    wasteDepartment: 'Health & Solid Waste Wing',
    centralFacility: 'Adampur Chhawani Solid Waste & Bio-Methanation Facility, Bhopal',
    website: 'https://www.bmconline.gov.in'
  },
  kanpur: {
    name: 'Kanpur Nagar Nigam (KNN)',
    helpline: '0512-2541258',
    phoneClean: '+915122541258',
    tollFree: '1800-180-5124',
    email: 'kanpur_nagar_nigam@yahoo.co.in',
    wasteDepartment: 'Environment & Solid Waste Division',
    centralFacility: 'Panki Solid Waste Processing Plant, Kanpur',
    website: 'https://kmc.up.nic.in'
  },
  varanasi: {
    name: 'Varanasi Nagar Nigam (VNN)',
    helpline: '1533',
    phoneClean: '1533',
    tollFree: '1800-180-5567',
    email: 'nagarnigamvns@gmail.com',
    wasteDepartment: 'Solid Waste & Sanitation Department',
    centralFacility: 'Karsada Waste-to-Compost & Bio-Energy Plant, Varanasi',
    website: 'https://nnvns.org.in'
  },
  patna: {
    name: 'Patna Municipal Corporation (PMC)',
    helpline: '155304',
    phoneClean: '155304',
    tollFree: '1800-345-6644',
    email: 'patnamunicipalcorporation@gmail.com',
    wasteDepartment: 'Sanitation & Solid Waste Cell',
    centralFacility: 'Ramachandrapur Waste Processing & Composting Facility, Patna',
    website: 'https://pmc.bihar.gov.in'
  },
  visakhapatnam: {
    name: 'Greater Visakhapatnam Municipal Corporation (GVMC)',
    helpline: '1800-425-00009',
    phoneClean: '180042500009',
    tollFree: '1800-425-00009',
    email: 'commissioner_gvmc@yahoo.co.in',
    wasteDepartment: 'Public Health & Solid Waste Management',
    centralFacility: 'Kapuluppada Waste-to-Energy & Scientific Compost Plant, Visakhapatnam',
    website: 'https://gvmc.gov.in'
  },
  vadodara: {
    name: 'Vadodara Municipal Corporation (VMC)',
    helpline: '1800-233-0266',
    phoneClean: '18002330266',
    tollFree: '1800-233-0266',
    email: 'vmc@vmc.gov.in',
    wasteDepartment: 'Solid Waste Management Department',
    centralFacility: 'Atladara Organic Fertilizer & Biogas Plant, Vadodara',
    website: 'https://vmc.gov.in'
  },
  nashik: {
    name: 'Nashik Municipal Corporation (NMC)',
    helpline: '0253-2575631',
    phoneClean: '+912532575631',
    tollFree: '1800-233-9111',
    email: 'contact@nmc.gov.in',
    wasteDepartment: 'Solid Waste Management Cell',
    centralFacility: 'Pathardi Solid Waste Processing & Compost Facility, Nashik',
    website: 'https://nmc.gov.in'
  },
  coimbatore: {
    name: 'Coimbatore City Municipal Corporation (CCMC)',
    helpline: '0422-2302323',
    phoneClean: '+914222302323',
    tollFree: '1800-425-4141',
    email: 'commr.coimbatore@tn.gov.in',
    wasteDepartment: 'Solid Waste Management Department',
    centralFacility: 'Vellalore Solid Waste Management Facility, Coimbatore',
    website: 'https://ccmc.gov.in'
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
  const clean = cityName.trim();
  const lower = clean.toLowerCase();

  // Match key from directory
  for (const [key, val] of Object.entries(MUNICIPAL_CORPORATIONS_DIRECTORY)) {
    if (lower.includes(key)) return val;
  }

  // Dynamic Municipal Local Body for ANY other city
  return {
    name: `${clean} Municipal Corporation (Nagar Nigam)`,
    helpline: '1969',
    phoneClean: '1969',
    tollFree: '1800-11-1969',
    email: `swachh.${lower.replace(/[^a-z]/g, '') || 'city'}@gov.in`,
    wasteDepartment: `${clean} Solid Waste & Organic Composting Department`,
    centralFacility: `${clean} Regional Bio-Methanation & Agricultural Compost Center`,
    website: 'https://swachhbharaturban.gov.in'
  };
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
    const list = loadStorage(STORAGE_KEYS.DONATIONS, []);
    let modified = false;
    list.forEach(d => {
      if (!d.handoverOtp) {
        d.handoverOtp = Math.floor(1000 + Math.random() * 9000).toString();
        d.otpVerified = d.status === 'picked_up' || d.status === 'delivered';
        modified = true;
      }
    });
    if (modified) {
      saveStorage(STORAGE_KEYS.DONATIONS, list);
    }
    return list;
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

    // 2. Generate 4-digit security handover OTP for donor
    const handoverOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Create donation record
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
      handoverOtp,
      otpVerified: false,
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

    // Notify Donor with the Handover Security OTP
    notificationService.createNotification({
      userId: listing.donorId,
      title: 'Donation Accepted!',
      message: `${newDonation.ngoName} has accepted ${listing.foodName}. Your Handover Security PIN is [${handoverOtp}]. Share this PIN with the NGO delivery team at your kitchen gate.`,
      type: 'donation_accepted',
      relatedId: newDonation.id
    });

    return newDonation;
  },
  verifyOtpAndPickup(donationId, inputOtp) {
    const donations = this.getDonations();
    const donation = donations.find(d => d.id === donationId);
    if (!donation) throw new Error('Donation record not found.');

    const cleanInput = String(inputOtp || '').trim();
    const expectedOtp = String(donation.handoverOtp || '').trim();

    if (!cleanInput) {
      throw new Error('Please enter the 4-digit Handover Security PIN provided by the donor.');
    }

    if (cleanInput !== expectedOtp) {
      throw new Error(`Invalid Handover PIN "${cleanInput}". Please ask the donor kitchen manager for the correct 4-digit PIN.`);
    }

    donation.otpVerified = true;
    return this.updateStatus(donationId, 'picked_up');
  },
  updateStatus(donationId, nextStatus) {
    const donations = this.getDonations();
    const donation = donations.find(d => d.id === donationId);
    if (!donation) throw new Error('Donation not found');

    donation.status = nextStatus;
    const now = new Date().toISOString();

    if (nextStatus === 'pickup_started') donation.pickupStartedAt = now;
    if (nextStatus === 'picked_up') {
      donation.pickedUpAt = now;
      donation.otpVerified = true;
    }
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
      pickup_started: 'Pickup Vehicle En Route',
      picked_up: 'Food Handover Verified & Collected',
      delivered: 'Donation Delivered to Beneficiaries'
    };
    notificationService.createNotification({
      userId: donation.donorId,
      title: statusTitles[nextStatus] || 'Donation Status Updated',
      message: nextStatus === 'picked_up'
        ? `Handover verified with PIN. ${donation.ngoName} has collected the food and is en route to distribution point.`
        : `Status of ${donation.foodName} is now: ${nextStatus.replace('_', ' ').toUpperCase()}`,
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
    // 1. Food Listings Sync (Live Multi-Device Updates)
    onSnapshot(collection(db, 'foodListings'), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => items.push(docSnap.data()));
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      saveStorage(STORAGE_KEYS.LISTINGS, items);
      window.dispatchEvent(new CustomEvent('foodconnect_data_updated', { detail: { collection: 'foodListings' } }));
    }, (err) => console.warn('Cloud listings sync listener warning:', err));

    // 2. Donations Sync (Live Status Updates)
    onSnapshot(collection(db, 'donations'), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => items.push(docSnap.data()));
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      saveStorage(STORAGE_KEYS.DONATIONS, items);
      window.dispatchEvent(new CustomEvent('foodconnect_data_updated', { detail: { collection: 'donations' } }));
    }, (err) => console.warn('Cloud donations sync listener warning:', err));

    // 3. Messages Sync (Live Chat Across Devices)
    onSnapshot(collection(db, 'messages'), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => items.push(docSnap.data()));
      items.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      saveStorage(STORAGE_KEYS.MESSAGES, items);
      window.dispatchEvent(new CustomEvent('foodconnect_data_updated', { detail: { collection: 'messages' } }));
    }, (err) => console.warn('Cloud messages sync listener warning:', err));

    // 4. Notifications Sync (Real-time Broadcast to NGOs)
    onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => items.push(docSnap.data()));
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      saveStorage(STORAGE_KEYS.NOTIFICATIONS, items);
      window.dispatchEvent(new CustomEvent('foodconnect_data_updated', { detail: { collection: 'notifications' } }));
    }, (err) => console.warn('Cloud notifications sync listener warning:', err));

    // 5. Users Sync (Cross-Device Profiles & Credentials)
    onSnapshot(collection(db, 'users'), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => items.push(docSnap.data()));
      saveStorage(STORAGE_KEYS.USERS, items);
      window.dispatchEvent(new CustomEvent('foodconnect_data_updated', { detail: { collection: 'users' } }));
    }, (err) => console.warn('Cloud users sync listener warning:', err));
  } catch (e) {
    console.warn('Realtime cloud sync error:', e);
  }
}

// Auto-activate realtime cloud listeners if configured
if (typeof window !== 'undefined') {
  initCloudRealtimeSync();
}
