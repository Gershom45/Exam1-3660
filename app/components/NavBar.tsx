import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type NavBarProps = {
  goToTasks: () => void;
  goToHome: () => void;
  signout: () => void;
};

const NavBar = ({ goToTasks, goToHome, signout }: NavBarProps) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible(prev => !prev);
  };

  // This function hides the dropdown and then calls the provided action.
  const handlePress = (action: () => void) => {
    setIsDropdownVisible(false);
    action();
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.menuButton} onPress={toggleDropdown}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>
      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handlePress(goToHome)}
          >
            <Text style={styles.dropdownText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handlePress(goToTasks)}
          >
            <Text style={styles.dropdownText}>Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handlePress(signout)}
          >
            <Text style={styles.dropdownText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  menuButton: {
    backgroundColor: "#E6E6FA",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  menuText: {
    color: "#73D",
    fontSize: 40,
    fontWeight: "bold",
  },
  dropdown: {
    position: "absolute",
    top: -30,
    right: 70,
    backgroundColor: "#73D",
    borderRadius: 5,
    marginTop: 10,
    elevation: 5,
    zIndex: 2000,
  },
  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 100,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default NavBar;
