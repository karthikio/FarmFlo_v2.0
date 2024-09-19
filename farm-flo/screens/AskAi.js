import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { API_KEY } from '@env';
import axios from 'axios';
import Markdown from 'react-native-markdown-display'; // For rendering markdown

const AskAI = () => {
    const [data, setData] = useState([]);
    const [textInput, setTextInput] = useState('');
    const [loading, setLoading] = useState(false); // Loading state

    const apiUrl = 'https://api.openai.com/v1/chat/completions'; // GPT-4 API endpoint

    const handleSend = async () => {
        const prompt = textInput;
        setLoading(true); // Start loading
        try {
            const response = await axios.post(apiUrl, {
                model: 'gpt-4o-mini', // Using GPT-4
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1024,
                temperature: 0.7,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                }
            });

            const text = response.data.choices[0].message.content;
            setData([...data, { type: 'user', text: textInput }, { type: 'bot', text }]);
            setTextInput('');
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false); // Stop loading
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()}
                style={styles.body}
                renderItem={({ item }) => (
                    <View style={item.type === 'user' ? styles.userMessage : styles.botMessage}>
                        <Text style={{ fontWeight: 'bold', color: item.type === 'user' ? 'green' : 'red' }}>
                            {item.type === 'user' ? 'User: ' : 'Bot: '}
                        </Text>
                        <Markdown style={styles.markdown}>
                            {item.text}
                        </Markdown>
                    </View>
                )}
            />

            <TextInput
                style={styles.input}
                value={textInput}
                onChangeText={(text) => setTextInput(text)}
                placeholder='Ask me anything...'
            />

            {loading ? (
                <ActivityIndicator size="large" color="#28a745" style={styles.loader} /> // Loading spinner
            ) : (
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSend}
                >
                    <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default AskAI;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5", // Light grey background for a clean look
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        width: '100%',
    },
    text: {
        fontSize: 28, // Larger text for the title
        fontWeight: 'bold',
        color: '#333', // Darker shade for the title
        marginBottom: 20,
    },
    body: {
        flex: 1,
        width: '100%', // Full-width body
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 20,
        marginBottom: 10, // To avoid overlapping with the input area
    },
    input: {
        height: 50,
        width: '90%', // Takes most of the screen width
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    button: {
        height: 50,
        backgroundColor: '#28a745', // Green button for "Send"
        borderRadius: 25,
        marginTop: 10,
        width: "90%",
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userMessage: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 10,
        backgroundColor: '#d4edda', // Light green for user messages
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: '90%', // Prevent messages from going full width
        alignSelf: 'flex-start', // Align user messages on the left
    },
    botMessage: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 10,
        backgroundColor: '#f8d7da', // Light red for bot messages
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: '90%', // Prevent messages from going full width
        alignSelf: 'flex-start', // Align bot messages on the left
    },
    loader: {
        marginTop: 10, // Spinner margin
    },
    markdown: {
        body: {
            fontSize: 16,
            color: '#333',
            flexShrink: 1, // Ensure text wraps inside the container
        },
        heading1: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#333',
        },
        strong: {
            fontWeight: 'bold',
            color: '#333',
        },
        codeInline: {
            fontFamily: 'monospace',
            backgroundColor: '#eee',
            padding: 2,
        },
    },
});