import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { db } from '../firebaseConfig'; // Import Firestore and Auth
import { doc, addDoc, collection } from 'firebase/firestore';


//hooks
import useUserData from "../hooks/useUserData";

const CropDetail = ({ route, navigation }) => {
  const { crop } = route.params;
  const { user, loading, error, updateUserData } = useUserData();
  

  const handleNotifySeller = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to notify the seller.');
        return;
      }

      const notificationData = {
        userName: user.name || 'Anonymous',
        userId: user.uid,
        userNumber: user.phoneNumber,
        cropName: crop.name,
        cropId: crop.id,
        sellerUid: crop.userId, 
        timestamp: new Date(),
      };

      // Add the document to Firestore
      await addDoc(collection(db, 'notifications'), notificationData);

      Alert.alert('Success', 'Seller has been notified successfully!');
    } catch (error) {
      console.error('Error notifying seller: ', error);
      Alert.alert('Error', 'There was an error notifying the seller.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sellerCard}>
        <Text style={styles.sellerTitle}>Seller Information</Text>
        <Text style={styles.sellerName}>{crop.sellerName}</Text>
        <Text style={styles.sellerContact}>Contact: {crop.sellerContact}</Text>
      </View>

      {crop.photo ? (
        <Image source={{ uri: crop.photo }} style={styles.cropImage} />
      ) : (
        <Text style={styles.noImageText}>No Image Available</Text>
      )}
      <View style={styles.cropDetails}>
        <Text style={styles.cropName}>{crop.name}</Text>
        <Text style={styles.cropPrice}>Price: ₹{crop.pricePerUnit}</Text>
        <Text style={styles.cropQuantity}>Available Quantity: {crop.availableQuantity}kg</Text>
        <Text style={styles.cropLocation}>Location: {crop.location}</Text>
        <Text style={styles.cropDescription}>Description: {crop.description}</Text>
      <Text style={styles.notificationText}>
        Harvested On: {new Date(crop.harvestedDate.toDate()).toLocaleDateString()}
      </Text>        
      </View>

      {/* Notify Seller Button */}
      <TouchableOpacity style={styles.notifyButton} onPress={handleNotifySeller}>
        <Text style={styles.notifyButtonText}>Notify Seller</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6f7',
  },
  cropImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 15,
  },
  noImageText: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    backgroundColor: '#ccc',
    textAlign: 'center',
    lineHeight: 200,
    marginBottom: 15,
  },
  cropDetails: {
    flex: 1,
    marginBottom: 15,
  },
  cropName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  cropPrice: {
    fontSize: 18,
    color: '#00712D',
    marginTop: 5,
  },
  cropQuantity: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  cropLocation: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  cropDescription: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  sellerCard: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 15,
    marginBottom: 20,
  },
  sellerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00712D',
    marginBottom: 10,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sellerContact: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  notifyButton: {
    backgroundColor: '#00712D',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  notifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CropDetail;