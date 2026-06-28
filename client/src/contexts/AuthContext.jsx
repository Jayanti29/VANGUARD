import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged,
  signOut,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Sign out helper
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setDbUser(null);
      localStorage.removeItem('vanguard_session_user');
      localStorage.removeItem('vanguard_session_dbuser');
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Google sign in helper
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (auth.isMock) {
        const res = await auth.signInWithGoogle();
        setUser(res.user);
        await syncUserWithFirestore(res.user);
        return res.user;
      } else {
        // Standard Firebase Google Auth (client redirect or popup)
        const provider = new GoogleAuthProvider();
        // Since we may run inside custom IDE view, popup is best
        const { signInWithPopup } = await import('firebase/auth');
        const res = await signInWithPopup(auth, provider);
        setUser(res.user);
        await syncUserWithFirestore(res.user);
        return res.user;
      }
    } catch (err) {
      console.error("Google sign in failed: ", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Phone Authentication: Send OTP
  const loginWithPhone = async (phoneNumber, recaptchaVerifier) => {
    setLoading(true);
    try {
      // Format number if not prefixed
      let formattedPhone = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhone = '+91' + phoneNumber;
      }

      if (auth.isMock) {
        const mockResult = await auth.signInWithPhoneNumber(formattedPhone, recaptchaVerifier);
        setConfirmationResult(mockResult);
        return mockResult;
      } else {
        const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
        setConfirmationResult(result);
        return result;
      }
    } catch (error) {
      console.error("Phone verification failed: ", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Phone Authentication: Verify OTP
  const confirmOTP = async (otpCode) => {
    setLoading(true);
    try {
      if (!confirmationResult) {
        throw new Error("No pending verification. Request OTP first.");
      }
      const result = await confirmationResult.confirm(otpCode);
      const authenticatedUser = result.user;
      setUser(authenticatedUser);
      await syncUserWithFirestore(authenticatedUser);
      return authenticatedUser;
    } catch (error) {
      console.error("OTP Confirmation failed: ", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sync / create user profile document in Firestore
  const syncUserWithFirestore = async (firebaseUser, forceData = {}) => {
    if (!firebaseUser) return;
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      
      let existingProfile = null;
      if (db.isMock) {
        const snap = await db.getDoc(userRef);
        if (snap.exists()) existingProfile = snap.data();
      } else {
        const snap = await getDoc(userRef);
        if (snap.exists()) existingProfile = snap.data();
      }

      const defaultProfile = {
        name: firebaseUser.displayName || existingProfile?.name || 'Citizen',
        phone: firebaseUser.phoneNumber || existingProfile?.phone || '',
        role: existingProfile?.role || 'Citizen', // default role
        language: localStorage.getItem('vanguard_language') || existingProfile?.language || 'en',
        state: existingProfile?.state || '',
        district: existingProfile?.district || '',
        village: existingProfile?.village || '',
        ward: existingProfile?.ward || '',
        houseNo: existingProfile?.houseNo || '',
        lat: existingProfile?.lat || 12.9716, // fallback Bangalore lat
        lng: existingProfile?.lng || 77.5946, // fallback Bangalore lng
        profileImageUrl: firebaseUser.photoURL || existingProfile?.profileImageUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + firebaseUser.uid,
        fcmToken: existingProfile?.fcmToken || '',
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        ...forceData
      };

      if (db.isMock) {
        await db.setDoc(userRef, defaultProfile);
      } else {
        await setDoc(userRef, defaultProfile);
      }
      
      setDbUser(defaultProfile);
      localStorage.setItem('vanguard_session_user', JSON.stringify(firebaseUser));
      localStorage.setItem('vanguard_session_dbuser', JSON.stringify(defaultProfile));
    } catch (error) {
      console.error("Failed to sync user with Firestore: ", error);
    }
  };

  // Update user profile properties
  const updateProfile = async (profileData) => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedData = { ...dbUser, ...profileData, updatedAt: new Date().toISOString() };
      
      if (db.isMock) {
        await db.setDoc(userRef, updatedData);
      } else {
        await setDoc(userRef, updatedData);
      }
      
      setDbUser(updatedData);
      localStorage.setItem('vanguard_session_dbuser', JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error updating profile: ", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if session exists in storage for faster loads
    const cachedUser = localStorage.getItem('vanguard_session_user');
    const cachedDbUser = localStorage.getItem('vanguard_session_dbuser');
    if (cachedUser && cachedDbUser) {
      setUser(JSON.parse(cachedUser));
      setDbUser(JSON.parse(cachedDbUser));
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncUserWithFirestore(firebaseUser);
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Guest Sign In (completely bypasses Firebase Auth)
  const loginAsGuest = async (role = 'Citizen') => {
    setLoading(true);
    try {
      const guestId = `guest_${Date.now()}`;
      const guestUser = {
        uid: guestId,
        displayName: `Guest ${role}`,
        phoneNumber: '+91-9999999999',
        email: 'guest@vanguard.org',
        isAnonymous: true
      };

      const guestDbUser = {
        uid: guestId,
        name: `Guest ${role}`,
        phone: '+91-9999999999',
        language: 'en',
        role: role,
        state: 'Karnataka',
        district: 'Bangalore',
        village: 'Rajajinagar',
        ward: '6',
        houseNo: 'Flat 101',
        lat: 12.9716,
        lng: 77.5946,
        profileImageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
        createdAt: new Date().toISOString()
      };

      // Set user document in Firestore so that any queries targeting the user document don't throw missing doc errors
      try {
        await setDoc(doc(db, 'users', guestId), guestDbUser);
      } catch (err) {
        console.warn("Could not save guest to Firestore. Bypassing silently:", err);
      }

      setUser(guestUser);
      setDbUser(guestDbUser);
      localStorage.setItem('vanguard_session_user', JSON.stringify(guestUser));
      localStorage.setItem('vanguard_session_dbuser', JSON.stringify(guestDbUser));
      return guestUser;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      dbUser,
      loading,
      loginWithPhone,
      confirmOTP,
      loginWithGoogle,
      loginAsGuest,
      logout,
      updateProfile,
      syncUserWithFirestore
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
