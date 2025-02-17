import { useContext, createContext, useState, useEffect } from "react";
import { Text, SafeAreaView, Alert } from "react-native";
import { account } from "../lib/appwriteConfig.js";
import TextCustom from "../app/components/TextCustom"; // Fixed import path

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(false); // Session should be a boolean
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null); // Store errors for better UI feedback

    useEffect(() => {
        checkAuth();
    }, []);

    // Check if user is authenticated
    const checkAuth = async () => {
        try {
            const response = await account.get();
            setUser(response);
            setSession(true); // Set session to true if user exists
        } catch (error) {
            console.log("Auth check failed:", error);
            setUser(null);
            setSession(false); // Ensure session is false when not authenticated
        }
        setLoading(false);
    };

    // Sign in function
    const signin = async ({ email, password }) => {
        setLoading(true);
        try {
            await account.createEmailPasswordSession(email, password);
            const responseUser = await account.get();
            setUser(responseUser);
            setSession(true);
            setError(null); // Clear error on successful login
        } catch (error) {
            setError(error.message);
            Alert.alert("Login Failed", error.message);
        }
        setLoading(false);
    };

    // Sign out function
    const signout = async () => {
        setLoading(true);
        try {
            await account.deleteSession("current");
            setUser(null);
            setSession(false);
        } catch (error) {
            console.log("Logout failed:", error);
            setError("Logout failed. Try again.");
        }
        setLoading(false);
    };

    const contextData = { session, user, signin, signout, error };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <SafeAreaView>
                    <TextCustom fontSize={28}>Loading...</TextCustom>
                </SafeAreaView>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthContext, AuthProvider };
