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
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/context/AuthContext";
import TextCustom from "../components/TextCustom";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import NavBar from "../components/NavBar";
import Profile from "../components/Profile";

type Task = {
  id: number;
  name: string;
  description: string;
  location: string;
  time: string; // e.g. "10:30 AM"
  completed: boolean;
};

// Configure notifications so that they show alerts when received.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Index() {
  const { user, signout } = useAuth();

  // TASK STATE
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputName, setInputName] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [inputLocation, setInputLocation] = useState("");
  const [timeInput, setTimeInput] = useState(""); // e.g. "10:30"
  const [selectedPeriod, setSelectedPeriod] = useState("AM"); // Toggle AM/PM

  // Editing logic
  const [editTaskId, setEditTaskId] = useState<number | null>(null);

  // SCREEN STATE
  const [isHomeScreen, setIsHomeScreen] = useState(true);


  const [isProfileScreen, setIsProfileScreen] = useState(false);

  // EVENT STATE
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<{ [key: string]: string[] }>({});

  // NAVIGATION
  const navigation = useNavigation<NavigationProp<any>>();

  // LOAD & SAVE
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

  // Auto-format time input: inserts a colon after two digits
  const handleTimeInput = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length > 2) {
      cleaned = cleaned.substring(0, 2) + ":" + cleaned.substring(2, 4);
    }
    setTimeInput(cleaned);
  };

  // Schedules a notification at the task's scheduled time.
  const scheduleTaskNotification = async (task: Task) => {
    if (Platform.OS === 'web') {
      console.log('Notifications are not supported on web platform');
      return;
    }
    // Parse the task's time (e.g., "10:30 AM")
    const [timePart, period] = task.time.split(" ");
    let [hour, minute] = timePart.split(":").map(Number);
    if (period === "PM" && hour < 12) {
      hour += 12;
    }
    if (period === "AM" && hour === 12) {
      hour = 0;
    }
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0
    );
    // If the scheduled time is in the past, schedule for tomorrow.
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    const diffSeconds = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: `Reminder: ${task.name} is scheduled for ${task.time}`,
      },
      trigger: {
        seconds: diffSeconds,
        repeats: false,
        type: "timeInterval",
      } as Notifications.TimeIntervalTriggerInput,
    });
  };

  // TASK FUNCTIONS
  const addTask = () => {
    if (inputName.trim() === "" || !/^\d{1,2}:\d{2}$/.test(timeInput)) return;
    const newTask: Task = {
      id: Date.now(),
      name: inputName,
      description: inputDescription,
      location: inputLocation,
      time: `${timeInput} ${selectedPeriod}`,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    resetTaskForm();
    // Schedule notification for the new task
    scheduleTaskNotification(newTask);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const editTask = (id: number) => {
    setEditTaskId(id);
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setInputName(taskToEdit.name);
      setInputDescription(taskToEdit.description);
      setInputLocation(taskToEdit.location);
      const [timePart, period] = taskToEdit.time.split(" ");
      setTimeInput(timePart);
      setSelectedPeriod(period);
    }
    setIsHomeScreen(false);
  };

  const updateTask = () => {
    if (inputName.trim() === "" || !/^\d{1,2}:\d{2}$/.test(timeInput)) return;
    const updatedTaskList = tasks.map((task) =>
      task.id === editTaskId
        ? {
            ...task,
            name: inputName,
            description: inputDescription,
            location: inputLocation,
            time: `${timeInput} ${selectedPeriod}`,
          }
        : task
    );
    setTasks(updatedTaskList);
    resetTaskForm();
    setEditTaskId(null);
    setIsHomeScreen(true);
    // Re-schedule notification for the updated task (if needed)
    const updatedTask = updatedTaskList.find((task) => task.id === editTaskId);
    if (updatedTask) {
      scheduleTaskNotification(updatedTask);
    }
  };

  const resetTaskForm = () => {
    setInputName("");
    setInputDescription("");
    setInputLocation("");
    setTimeInput("");
    setSelectedPeriod("AM");
  };

  // NAVIGATION BUTTONS
  const handleGoToTasks = () => {
    setIsHomeScreen(false);
    setIsProfileScreen(false);
  };
  const handleGoToHome = () => {
    setIsHomeScreen(true);
    setIsProfileScreen(false);
  };

  const handleGoToProfile = () => {
    setIsHomeScreen(false);
    setIsProfileScreen(true);
  };

  

  // EVENT FUNCTIONS
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
    setInputName("");
  };

  const deleteEventFromDate = (date: string, index: number) => {
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents[date] ? [...prevEvents[date]] : [];
      updatedEvents.splice(index, 1);
      return {
        ...prevEvents,
        [date]: updatedEvents,
      };
    });
  };

  // CALENDAR MARKING
  const renderMarkedDates = () => {
    const markedDates: any = {};
    if (selectedDate) {
      markedDates[selectedDate] = {
        selected: true,
        selectedColor: "purple",
        selectedTextColor: "white",
      };
    }
    for (const date in events) {
      markedDates[date] = { marked: true, dotColor: "purple" };
    }
    return markedDates;
  };

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  // RENDER EVENTS LIST
  const renderEventsForSelectedDate = () => {
    if (!selectedDate || !Array.isArray(events[selectedDate])) return null;
    return (
      <View style={styles.eventList}>
        <Text style={styles.eventTitle}>Events for {selectedDate}:</Text>
        {events[selectedDate].map((event, index) => (
          <View key={index} style={styles.eventItemContainer}>
            <Text style={styles.eventItemText}>{event}</Text>
            <TouchableOpacity
              onPress={() => deleteEventFromDate(selectedDate, index)}
              style={styles.eventDeleteButton}
            >
              <Text style={styles.eventDeleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // TOGGLE AM/PM FUNCTION
  const togglePeriod = () => {
    setSelectedPeriod((prev) => (prev === "AM" ? "PM" : "AM"));
  };

  // -------------------- NOTIFICATIONS --------------------
  useEffect(() => {
    if (Platform.OS !== 'web') {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission for notifications was not granted!");
      }
    })();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification tapped:", response);
      }
    );
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }
  }, []);

  if (isProfileScreen) {
    return (
      <Profile 
        goToTasks={handleGoToTasks}
        goToHome={handleGoToHome}
        signout={signout}
        goToProfile={handleGoToProfile}
      />
    );
  }
  // ---------------------------------------------------------

  // ================= SCREEN RENDER =================
  if (isHomeScreen) {
    // HOME SCREEN: Using FlatList as the container to avoid nesting VirtualizedLists
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
        >
          <FlatList
            data={[]}
            renderItem={() => null}
            contentContainerStyle={{ width: '100%', maxWidth: '100%' }}
            ListHeaderComponent={
              <>
                {/* HEADER */}
                <View style={styles.header}>
                  <NavBar
                    goToTasks={handleGoToTasks}
                    goToHome={handleGoToHome}
                    goToProfile={handleGoToProfile}
                    signout={signout}
                  />
                  <Image
                    source={require("@/assets/images/todo.png")}
                    style={styles.headerImage}
                  />
                </View>
                {/* BODY */}
                <View style={styles.body}>
                  <TextCustom fontSize={22}>Hello, {user?.name}!</TextCustom>
                  <Text style={styles.text}>Welcome to your To-Do app!</Text>
                  <FlatList
                    data={tasks.filter((task) => !task.completed)}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.taskItem}>
                        <View>
                          <Text style={styles.taskName}>{item.name}</Text>
                          <Text style={styles.taskDescription}>
                            {item.description}
                          </Text>
                          <View style={styles.divider} />
                          <Text style={styles.taskLocation}>{item.location}</Text>
                          <Text style={styles.taskTime}>{item.time}</Text>
                        </View>
                        <TouchableOpacity onPress={() => toggleTask(item.id)}>
                          <Text style={styles.checkMark}>✔️</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  <Calendar
                    onDayPress={onDayPress}
                    markedDates={renderMarkedDates()}
                    theme={{
                      todayTextColor: "purple",
                      arrowColor: "purple",
                      selectedDayBackgroundColor: "purple",
                      selectedDayTextColor: "white",
                    }}
                  />
                  {renderEventsForSelectedDate()}
                  {selectedDate && (
                    <View style={styles.eventInputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter event name..."
                        placeholderTextColor="#999"
                        value={inputName}
                        onChangeText={setInputName}
                      />
                      <TouchableOpacity
                        style={styles.button}
                        onPress={addEventToDate}
                      >
                        <Text style={styles.buttonText}>Add Event</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {/* TEST NOTIFICATION BUTTON */}
                  <TouchableOpacity
                    style={styles.button}
                    onPress={async () => await scheduleTaskNotification({
                      id: Date.now(),
                      name: "Test Task",
                      description: "Test Description",
                      location: "Test Location",
                      time: `${timeInput || "00:00"} ${selectedPeriod}`,
                      completed: false,
                    })}
                  >
                    <Text style={styles.buttonText}>Test Notification</Text>
                  </TouchableOpacity>
                </View>
              </>
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // TASK MANAGEMENT SCREEN
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
      >
        <FlatList
          data={[]}
          renderItem={() => null}
          contentContainerStyle={{ width: '100%', maxWidth: '100%' }}
          ListHeaderComponent={
            <>
              {/* HEADER */}
              <View style={styles.header}>
                <NavBar
                  goToTasks={handleGoToTasks}
                  goToHome={handleGoToHome}
                  goToProfile={handleGoToProfile}
                  signout={signout}
                />
                <Image
                  source={require("@/assets/images/todo.png")}
                  style={styles.headerImage}
                />
              </View>

              {/* TITLE */}
              <View style={styles.formWrapper}>
              <Text style={styles.manageTasksText}>
                {editTaskId ? "Update your task below" : "Manage your tasks below"}
              </Text>
              {/* FORM */}
              <TextInput
                style={styles.input}
                placeholder="Enter task name..."
                placeholderTextColor="#999"
                value={inputName}
                onChangeText={setInputName}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter task description..."
                placeholderTextColor="#999"
                value={inputDescription}
                onChangeText={setInputDescription}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter task location..."
                placeholderTextColor="#999"
                value={inputLocation}
                onChangeText={setInputLocation}
              />
              {/* TIME + TOGGLE AM/PM */}
              <View style={styles.timePickerContainer}>
                <TextInput
                  style={styles.timeInput}
                  placeholder="HH:MM"
                  placeholderTextColor="#999"
                  value={timeInput}
                  onChangeText={handleTimeInput}
                  maxLength={5}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={togglePeriod}
                >
                  <Text style={styles.toggleButtonText}>{selectedPeriod}</Text>
                </TouchableOpacity>
              </View>
              {/* ADD/UPDATE BUTTON */}
              <TouchableOpacity
                style={styles.button}
                onPress={editTaskId ? updateTask : addTask}
              >
                <Text style={styles.buttonText}>
                  {editTaskId ? "Update Task" : "Add Task"}
                </Text>
              </TouchableOpacity>
              {/* ALL TASKS LIST */}
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.taskItem}>
                    <TouchableOpacity onPress={() => toggleTask(item.id)}>
                      <Text
                        style={[
                          styles.taskName,
                          item.completed && styles.completedTask,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.taskDescription}>
                        {item.description}
                      </Text>
                      <View style={styles.divider} />
                      <Text style={styles.taskLocation}>{item.location}</Text>
                      <Text style={styles.taskTime}>{item.time}</Text>
                    </TouchableOpacity>
                    <View style={styles.taskActions}>
                      <TouchableOpacity onPress={() => editTask(item.id)}>
                        <Text style={styles.editButton}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteTask(item.id)}>
                        <Text style={styles.deleteButton}>❌</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
              </View>
            </>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  body: {
    flex: 1,
    width: '100%',
    alignItems: "center",
    padding: Platform.OS === 'web' ? 20 : 10,
  },
  manageTasksText: {
    color: "black",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 40,
  },
  text: {
    color: "black",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderColor: "grey",
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    margin: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 6,
    marginVertical: 5,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
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
  completedTask: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
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
  deleteButton: {
    fontSize: 20,
    color: "red",
  },
  checkMark: {
    fontSize: 24,
    color: "gray",
  },
  formWrapper: {
    width: '100%',
    alignItems: "center",
    paddingHorizontal: Platform.OS === 'web' ? '5%' : 10,
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    alignSelf: 'center',
  },
  listContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  // TIME PICKER TOGGLE STYLES
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
  },
  timeInput: {
    flex: 0.7,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginRight: 10,
    borderColor: "grey",
    backgroundColor: "white",
  },
  toggleButton: {
    flex: 0.3,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "black",
  },
  toggleButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // EVENTS STYLES
  eventInputContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  eventList: {
    marginTop: 20,
    width: "100%",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  eventItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    marginBottom: 5,
  },
  eventItemText: {
    fontSize: 16,
    flex: 1,
  },
  eventDeleteButton: {
    backgroundColor: "red",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  eventDeleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});