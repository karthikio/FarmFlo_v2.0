import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, Platform, Image, ActivityIndicator, ScrollView, TouchableOpacity, KeyboardAvoidingView, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import useUserData from '../hooks/useUserData'; // Import useUserData hook

const AddCrop = ({ navigation }) => {
  const { user } = useUserData(); // Get current user details
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [harvestedDate, setHarvestedDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || harvestedDate;
    setShowDatePicker(Platform.OS === 'ios');
    setHarvestedDate(currentDate);
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Sorry, we need permission to access your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setPhoto(uri); // Store the URI
    }
  };

  const handleSave = async () => {
    if (!name || !photo || !pricePerUnit || !availableQuantity || !description || !location) {
      Alert.alert('Validation Error', 'Please fill in all fields and select an image.');
      return;
    }

    setLoading(true);

    try {
      // Upload image to Firebase Storage
      const response = await fetch(photo);
      const blob = await response.blob();
      const storageRef = ref(storage, `images/${Date.now()}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Save crop data to Firestore
      await addDoc(collection(db, 'crops'), { 
        userId: user?.uid,
        name,
        photo: downloadURL, // Save the download URL
        pricePerUnit: parseFloat(pricePerUnit),
        availableQuantity: parseInt(availableQuantity, 10),
        description,
        harvestedDate,
        location,
        sellerName: user?.name, // Add sellerName from user data
        sellerContact: user?.phoneNumber, // Add sellerContact from user data
      });

      Alert.alert('Success', 'Crop added successfully');
      navigation.goBack(); // Go back to previous screen after saving
    } catch (error) {
      Alert.alert('Error', 'Failed to add crop');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        
        <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
          <Text style={styles.imagePickerText}>Select Image</Text>
        </TouchableOpacity>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

        <TextInput
          placeholder="Price Per Unit"
          value={pricePerUnit}
          onChangeText={setPricePerUnit}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Available Quantity"
          value={availableQuantity}
          onChangeText={setAvailableQuantity}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline={true}
          numberOfLines={4}
        />
        <TextInput
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />

        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>Harvested Date:</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datePickerText}>{harvestedDate.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={harvestedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#00712D" />
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f7',
  },
  scrollContainer: {
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  imagePicker: {
    backgroundColor: '#00712D',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  dateContainer: {
    marginVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  dateText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#00712D',
  },
  datePickerText: {
    fontSize: 16,
    color: '#00712D',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#00712D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddCrop;