import { SafeAreaView, View, TextInput, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import TextCustom from '../components/TextCustom'; // Fixed import path

const SignInScreen = () => {
    const { session, signin, error } = useAuth(); // Get session, signin function, and error state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please fill in both fields.");
            return;
        }
        setLoading(true);
        await signin({ email, password });
        setLoading(false);
    };

    if (session) return <Redirect href="/" />;

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <TextCustom style={styles.headline} fontSize={72}>Sign In</TextCustom>

                <TextCustom>Email:</TextCustom>
                <TextInput 
                    placeholder='Enter your email...' 
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextCustom>Password:</TextCustom>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password..."
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    headline: {
        textAlign: 'center',
        marginTop: -100,
        marginBottom: 50,
        fontWeight: '700',
        fontStyle: 'italic'
    },
    input: {
        borderWidth: 1,
        borderRadius: 10, 
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
        borderColor: "grey"
    },
    button: {
        backgroundColor: 'black',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default SignInScreen;
