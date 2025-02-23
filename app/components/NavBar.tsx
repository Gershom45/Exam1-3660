import React, {useState} from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const NavBar = ({ goToTasks, goToHome, signout}: {goToTasks: () => void, goToHome: () => void, signout: () => void, }) => {
  
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  return (
    <View style={styles.navbar}>
      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleDropdown}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>

      {/* Dropdown Options */}
      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={goToHome}>
            <Text style={styles.dropdownText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={goToTasks}>
            <Text style={styles.dropdownText}>Tasks</Text>
          </TouchableOpacity>
          {/* Add more dropdown items here */}
          <TouchableOpacity style={styles.dropdownItem} onPress={signout}>
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
    top: 20,  // Adjust for notch-safe position
    right: 20, // Align to the top-right corner
    zIndex: 1000, // Ensure it stays on top
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
    elevation: 5, // Adding shadow for better dropdown visibility
    zIndex: 2000,
  },
  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 60,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
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
