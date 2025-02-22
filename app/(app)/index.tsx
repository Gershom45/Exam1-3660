import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import TextCustom from "../components/TextCustom";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons
import { Entypo } from '@expo/vector-icons'; // Import Entypo for menu icon

// ✅ Define the Task type correctly
type Task = {
  id: number;
  name: string;
  description: string;
  location: string;
  time: string;
  completed: boolean;
};

export default function Index() {
  const { user, signout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputName, setInputName] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // State to track selected date
  const [events, setEvents] = useState<{ [key: string]: string[] }>({}); // Store events by date
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); // State to track menu visibility
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    loadTasks();
    loadEvents();
  }, []);

  useEffect(() => {
    saveTasks();
    saveEvents();
  }, [tasks, events]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.log("Error loading tasks:", error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.log("Error saving tasks:", error);
    }
  };

  const loadEvents = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem("events");
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      console.log("Error loading events:", error);
    }
  };

  const saveEvents = async () => {
    try {
      await AsyncStorage.setItem("events", JSON.stringify(events));
    } catch (error) {
      console.log("Error saving events:", error);
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const addEventToDate = () => {
    if (!selectedDate || inputName.trim() === "") return;

    const newEvent = inputName;
    setEvents((prevEvents) => {
      const updatedEvents = { ...prevEvents };
      if (updatedEvents[selectedDate]) {
        updatedEvents[selectedDate].push(newEvent);
      } else {
        updatedEvents[selectedDate] = [newEvent];
      }
      return updatedEvents;
    });

    // Clear input fields
    setInputName("");
  };

  const renderMarkedDates = () => {
    const markedDates: any = {};

    // to mark the selected date
    if (selectedDate) {
      markedDates[selectedDate] = {
        selected: true,
        selectedColor: 'purple', // selected date's background color
        selectedTextColor: 'white', //  the text color to white for contrast
      };
    }

    // mark dates for an event
    for (const date in events) {
      markedDates[date] = { marked: true, dotColor: "purple" };
    }

    return markedDates;
  };

  const onDayPress = (day: { dateString: string; day: number; month: number; year: number }) => {
    setSelectedDate(day.dateString); // to update the selected date
  };

  const renderEventsForSelectedDate = () => {
    if (!selectedDate || !Array.isArray(events[selectedDate])) return null;

    return (
      <View style={styles.eventList}>
        <Text style={styles.eventTitle}>Events for {selectedDate}:</Text>
        {events[selectedDate].map((event, index) => (
          <Text key={index} style={styles.eventItem}>
            {event}
          </Text>
        ))}
      </View>
    );
  };

  const goToTasks = () => {
    navigation.navigate("edit"); // Ensure the route name matches the one defined in your navigation setup
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const goToProfile = () => {
    setMenuVisible(false);
    navigation.navigate("profile"); // Ensure the route name matches the one defined in your navigation setup
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Image
                source={require('@/assets/images/todo.png')}
                style={styles.headerImage}
              />
              <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
                <Entypo name="menu" size={24} color="black" />
              </TouchableOpacity>
              {menuVisible && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity style={styles.dropdownItem} onPress={goToProfile}>
                    <Text style={styles.dropdownText}>Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>About</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.body}>
              <TextCustom fontSize={22}>Hello, {user?.name}!</TextCustom>
              <Text style={styles.text}>Welcome to your To-Do app!</Text>
              <FlatList
                data={tasks.filter((task) => !task.completed)} // showing uncompleted tasks
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.taskItem}>
                    <View>
                      <Text style={styles.taskName}>{item.name}</Text>
                      <Text style={styles.taskDescription}>{item.description}</Text>
                      <View style={styles.divider} />
                      <Text style={styles.taskLocation}>{item.location}</Text>
                      <Text style={styles.taskTime}>{item.time}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleTask(item.id)}>
                      <Text style={styles.checkMark}>✔️</Text> {/* show a checkmark to mark as completed */}
                    </TouchableOpacity>
                  </View>
                )}
              />
              <TouchableOpacity style={styles.button} onPress={goToTasks}>
                <Text style={styles.buttonText}>Go to Tasks</Text>
              </TouchableOpacity>
              {/* Calendar component */}
              <Calendar
                onDayPress={onDayPress} // to select a date
                markedDates={renderMarkedDates()} // to display events on selected dates
                theme={{
                  todayTextColor: "purple",
                  arrowColor: "purple",
                  selectedDayBackgroundColor: "purple", // the days background color
                  selectedDayTextColor: "white", // Selected day text color
                }}
              />
              {/* Render events for the selected date */}
              {renderEventsForSelectedDate()}
              {/* input for adding events */}
              {selectedDate && (
                <View style={styles.eventInputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter event name..."
                    value={inputName}
                    onChangeText={setInputName}
                  />
                  <TouchableOpacity style={styles.button} onPress={addEventToDate}>
                    <Text style={styles.buttonText}>Add Event</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        }
      />
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
  button: {
    backgroundColor: "#8b61c2", // Changed color to #8b61c2
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    margin: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  text: {
    color: "black",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "80%",
    borderColor: "grey",
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 6,
    marginVertical: 5,
    width: "100%",
  },
  taskText: {
    fontSize: 16,
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  deleteButton: {
    fontSize: 20,
    color: "red",
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    fontSize: 20,
    color: "blue",
    marginRight: 10,
  },
  checkMark: {
    fontSize: 24,
    color: "gray",
  },
  header: {
    backgroundColor: "#E6E6FA",
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    position: "relative",
  },
  headerImage: {
    width: 900,
    height: 800,
    resizeMode: "contain",
  },
  menuButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  dropdownMenu: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "white",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
  },
  body: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  taskName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskDescription: {
    fontSize: 14,
    color: "#555",
  },
  taskLocation: {
    fontSize: 12,
    color: "#555",
  },
  taskTime: {
    fontSize: 14,
    color: "#555",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  eventInputContainer: {
    marginVertical: 20,
  },
  eventList: {
    marginTop: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  eventItem: {
    fontSize: 16,
    marginBottom: 5,
  },
});

