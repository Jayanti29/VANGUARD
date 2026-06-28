import { db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export async function seedOfficials() {
  try {
    // 1. Check if officials collection is empty
    const officialsRef = collection(db, 'officials');
    const officialsSnap = await getDocs(officialsRef);

    if (officialsSnap.empty) {
      console.log("Seeding default officials data into Firestore...");
      const sampleOfficials = [
        { name: "Ramesh Kumar", role: "Ward Member", department: "Ward Office",
          phone: "+91-9876543210", email: "ward6@bangalore.gov.in",
          ward: "6", village: "Rajajinagar", district: "Bangalore", lat: 12.9716, lng: 77.5946 },
        { name: "Suresh Patil", role: "Station House Officer", 
          department: "Police", phone: "100",
          email: "sho.rajaji@ksp.gov.in",
          ward: "6", village: "Rajajinagar", district: "Bangalore", lat: 12.9726, lng: 77.5956 },
        { name: "Meena Sharma", role: "Junior Engineer",
          department: "Electricity Board - BESCOM",
          phone: "1912", email: "je.bescom@karnataka.gov.in",
          ward: "6", village: "Rajajinagar", district: "Bangalore", lat: 12.9706, lng: 77.5936 },
        { name: "Dr. Anand Rao", role: "Medical Officer",
          department: "Primary Health Centre",
          phone: "108", email: "phc.rajaji@health.kar.nic.in",
          ward: "6", village: "Rajajinagar", district: "Bangalore", lat: 12.9736, lng: 77.5966 },
        { name: "Kavitha Nair", role: "Sanitation Officer",
          department: "BBMP Municipality",
          phone: "+91-8765432109", email: "sanitation@bbmp.gov.in",
          ward: "6", village: "Rajajinagar", district: "Bangalore", lat: 12.9696, lng: 77.5926 }
      ];

      for (let i = 0; i < sampleOfficials.length; i++) {
        const offId = `official_${i + 1}`;
        await setDoc(doc(db, 'officials', offId), sampleOfficials[i]);
      }
      console.log("Seeding officials complete!");
    } else {
      console.log("Officials database already seeded.");
    }

    // 2. Check if workers collection is empty
    const workersRef = collection(db, 'workers');
    const workersSnap = await getDocs(workersRef);

    if (workersSnap.empty) {
      console.log("Seeding default workers data into Firestore...");
      const sampleWorkers = [
        { userId: "worker_raju", name: "Raju Electrician", skills: ["electrician"],
          experienceYears: 8, dailyRate: 800, rating: 4.5,
          reviewCount: 23, isAvailable: true,
          village: "Rajajinagar", district: "Bangalore", lat: 12.9719, lng: 77.5941 },
        { userId: "worker_sunil", name: "Sunil Plumber", skills: ["plumber"],
          experienceYears: 5, dailyRate: 600, rating: 4.2,
          reviewCount: 15, isAvailable: true,
          village: "Rajajinagar", district: "Bangalore", lat: 12.9729, lng: 77.5951 },
        { userId: "worker_krishna", name: "Krishna Constructions", 
          skills: ["construction", "labor"],
          experienceYears: 12, dailyRate: 500, rating: 4.7,
          reviewCount: 41, isAvailable: true,
          village: "Rajajinagar", district: "Bangalore", lat: 12.9709, lng: 77.5931 }
      ];

      for (let i = 0; i < sampleWorkers.length; i++) {
        const workId = `worker_${i + 1}`;
        await setDoc(doc(db, 'workers', workId), sampleWorkers[i]);
      }
      console.log("Seeding workers complete!");
    } else {
      console.log("Workers database already seeded.");
    }

  } catch (err) {
    console.error("Error seeding default Firestore resources:", err);
  }
}
