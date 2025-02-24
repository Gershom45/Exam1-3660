import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useAuth } from "@/context/AuthContext";
import NavBar from './NavBar';


type ProfileProps = {
  goToTasks: () => void;
  goToHome: () => void;
  goToProfile: () => void;
  signout: () => void;
};

const Profile = ({ goToTasks, goToHome, signout, goToProfile }: ProfileProps) => {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <NavBar
          goToTasks={goToTasks}
          goToHome={goToHome}
          signout={signout}
          goToProfile={goToProfile}
        />
        <Image
          source={require("@/assets/images/todo.png")}
          style={styles.headerImage}
        />
      </View>
      <View style={styles.profileContainer}>
        <View style={styles.profileCard}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.info}>{user?.name}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.info}>{user?.email}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    backgroundColor: "#E6E6FA",
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    alignSelf: 'stretch', // Makes header stretch full width
  },
  headerImage: {
    width: "100%",
    height: 500,
    marginTop: 30,
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  info: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default Profile;