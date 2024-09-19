import { StyleSheet, Text, View, ActivityIndicator, FlatList, Image, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

//hooks
import useUserData from "../hooks/useUserData";

function Home({ navigation }) {
  const { user, loading, error, updateUserData } = useUserData();
  const route = useRoute();
  const [crops, setCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [filteredCrops, setFilteredCrops] = useState([]); // State for filtered crops

  useEffect(() => {
    if (route.params?.updatedUser) {
      updateUserData(route.params.updatedUser);
    }
    // Set up real-time listener for crops
    const unsubscribe = onSnapshot(collection(db, 'crops'), (querySnapshot) => {
      const cropsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCrops(cropsData);
      setFilteredCrops(cropsData); // Initially, show all crops
      setCropsLoading(false);
    }, (error) => {
      console.error('Error fetching crops:', error);
      setCropsLoading(false);
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [route.params?.updatedUser]);

  // Function to filter crops based on search query
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredCrops(crops); // If query is empty, show all crops
    } else {
      const filtered = crops.filter(crop =>
        crop.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCrops(filtered); // Update the filtered crops
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cropItem}
      onPress={() => navigation.navigate('CropDetail', { crop: item })}
    >
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.cropImage} />
      ) : (
        <Text style={styles.noImageText}>No Image Available</Text>
      )}
      <View style={styles.cropDetails}>
      {item ? (
        <>
          <Text style={styles.cropName}>{item.name}</Text>
          <Text style={styles.cropPrice}>Price: ₹{item.pricePerUnit}</Text>
          <Text style={styles.cropQuantity}>Available Quantity: {item.availableQuantity}kg</Text>
          <Text style={styles.cropLocation}>Location: {item.location}</Text>
        </>
        ): (
        <></>
      )}

      </View>
    </TouchableOpacity>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const greeting = getGreeting(); 

  if (loading || cropsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00712D" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.homeContainer}>
      <Text style={styles.greet}>{`${greeting}, ${user.name}!`}</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search crops by name"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredCrops} // Use filtered crops for rendering
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.cropList}
      />
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#f5f6f7',
    padding: 20,
  },
  greet: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  cropItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cropImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 15,
  },
  noImageText: {
    width: 80,
    height: 80,
    borderRadius: 5,
    backgroundColor: '#ccc',
    textAlign: 'center',
    lineHeight: 80,
    marginRight: 15,
  },
  cropDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cropPrice: {
    fontSize: 16,
    color: '#00712D',
    marginTop: 5,
  },
  cropQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cropLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;