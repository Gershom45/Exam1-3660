import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useNavigation, NavigationProp } from "@react-navigation/native";

export default function Profile() {
  const { user, signout } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  const goToHome = () => {
    navigation.navigate("index");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user?.name}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={goToHome}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={signout}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    color: "gray",
  },
  button: {
    backgroundColor: "#8b61c2", // Button color
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    margin: 10,
    width: "80%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});
