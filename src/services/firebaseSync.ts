import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { MaintenanceData } from '../types';

export const saveToFirebase = async (uid: string, data: MaintenanceData) => {
  const userDocRef = doc(db, 'users', uid);
  const updatedAt = new Date().toISOString();
  await setDoc(userDocRef, {
    ...data,
    updatedAt
  });
  return updatedAt;
};

export const subscribeToFirebaseData = (uid: string, callback: (data: MaintenanceData) => void) => {
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as MaintenanceData);
    }
  });
};

export const getFirebaseData = async (uid: string): Promise<MaintenanceData | null> => {
  const userDocRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as MaintenanceData;
  }
  return null;
};
