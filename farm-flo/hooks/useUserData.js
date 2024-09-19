// useUserData.js
import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig'; 
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const useUserData = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid);
  
          // Use Firestore's real-time listener
          const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setUser(docSnap.data()); // Update state with real-time data
            } else {
              console.log("No such document!");
            }
          });
  
          // Clean up the listener when the component unmounts
          return () => unsubscribe();
        }
      } catch (error) {
        setError(error.message);
        console.error("Error fetching user data: ", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);

   // Function to update user data
   const updateUserData = async (updatedData) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        await updateDoc(docRef, updatedData);
        setUser(prevUser => ({ ...prevUser, ...updatedData })); // Update the state with the new data
      }
    } catch (error) {
      setError(error.message);
      console.error('Error updating user data: ', error);
    }
  };

  // Function to add new details like phone number and location
  const addUserDetails = async (details) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        await setDoc(docRef, details, { merge: true }); // Use merge: true to avoid overwriting existing data
        setUser(prevUser => ({ ...prevUser, ...details }));
      }
    } catch (error) {
      setError(error.message);
      console.error('Error adding user details: ', error);
    }
  };

  return { user, loading, error, updateUserData, addUserDetails };

};

export default useUserData;