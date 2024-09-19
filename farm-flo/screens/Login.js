import { StyleSheet, Text, View, TextInput, Keyboard, TouchableWithoutFeedback, Alert, TouchableOpacity } from 'react-native';
import {useState} from "react";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';


function Login({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and password are required.');
      return false;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', error.message);
    }
  };


  return(
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.loginContainer}>
      <Text style={styles.heading}>Welcome Back</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false} 
        textContentType="emailAddress"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false} 
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={{ color: '#333333', marginTop: 20 }}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
    loginContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "#FFFBE6",
    padding: 10,
    display: 'flex',
  },
  heading: {
    color: "#333333",
    fontSize: 20,
    fontWeight: "900", 
    paddingBottom: 30,
  }, 
  input: {
    height: 40,
    width: "100%",
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
    btn: {
    height: 40,
    width: "80%",
    borderRadius: 4,
    backgroundColor: "#FF9100", 
    borderRadius: 10,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnText:{
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  forgetPwd: {
    color: "#D5ED9F",
    fontSize: 10, 
  },
})

export default Login;
