import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import TextCustom from "../components/TextCustom";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { Picker } from '@react-native-picker/picker';

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
  const { user, session, signout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputName, setInputName] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [inputLocation, setInputLocation] = useState("");
  const [inputTime, setInputTime] = useState("");
  const [isHomeScreen, setIsHomeScreen] = useState(true);  // home screen shows up first
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // State to track selected date
  const [events, setEvents] = useState<{ [key: string]: string[] }>({}); // Store events by date
  const [selectedHour, setSelectedHour] = useState("1");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");
  const [timeInput, setTimeInput] = useState("");

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

  const addTask = () => {
    if (inputName.trim() === "" || !/^\d{1,2}:\d{2}$/.test(timeInput)) return;
    const newTask: Task = {
      id: Date.now(),
      name: inputName,
      description: inputDescription,
      location: inputLocation,
      time: `${timeInput} ${selectedPeriod}`,
      completed: false 
    };
    setTasks([...tasks, newTask]);
    setInputName("");
    setInputDescription("");
    setInputLocation("");
    setTimeInput("");
    setSelectedPeriod("AM");
  };

 // ✅ Fixed toggleTask function
  const toggleTask = (id: number) => {
   setTasks(tasks.map((task) =>
     task.id === id
        ? { ...task, completed: !task.completed }  // ✅ Keeps `text`
       : task
   ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };


  const editTask = (id: number) => {
    setEditTaskId(id);
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setInputName(taskToEdit.name);
      setInputDescription(taskToEdit.description);
      setInputLocation(taskToEdit.location);
      setInputTime(taskToEdit.time);
    }
   setIsHomeScreen(false); // to task editing screen
  };

  const updateTask = () => {
    if (inputName.trim() === "" || !/^\d{1,2}:\d{2}$/.test(timeInput)) return;
   setTasks(tasks.map((task) =>
     task.id === editTaskId ? { 
              ...task,
              name: inputName,
              description: inputDescription,
              location: inputLocation,
              time: `${timeInput} ${selectedPeriod}`
     } : task
   ));
    setInputName("");
    setInputDescription("");
    setInputLocation("");
    setTimeInput("");
    setSelectedPeriod("AM");
    setEditTaskId(null); // Reset the edit task ID
    setIsHomeScreen(true); // back to the home screen
  };


  const goToHome = () => {
    setIsHomeScreen(true);  // to Home screen
  };


    const goToTasks = () => {
    setIsHomeScreen(false); // go to tasks list
  };

  //  to handle adding events on a selected date
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

  // for event rendering on the calendar
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

  // show events for the selected date
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
  

  

  if (isHomeScreen) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "white" }]}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/todo.png')}
            style={styles.headerImage}
          />
        </View>
        <ScrollView contentContainerStyle={styles.body}>
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
        </ScrollView>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.manageTasksText}>Manage your tasks below</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter task name..."
        value={inputName}
        onChangeText={setInputName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter task description..."
        value={inputDescription}
        onChangeText={setInputDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter task location..."
        value={inputLocation}
        onChangeText={setInputLocation}
      />
      <View style={styles.timePickerContainer}>
        <TextInput
          style={styles.timeInput}
          placeholder="HH:MM"
          value={timeInput}
          onChangeText={setTimeInput}
          maxLength={5}
          keyboardType="numeric"
        />
        <Picker
          selectedValue={selectedPeriod}
          style={styles.picker}
          onValueChange={(itemValue: React.SetStateAction<string>) => setSelectedPeriod(itemValue)}
        >
          <Picker.Item label="AM" value="AM" />
          <Picker.Item label="PM" value="PM" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={editTaskId ? updateTask : addTask}>
        <Text style={styles.buttonText}>{editTaskId ? "Update Task" : "Add Task"}</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
             <Text style={[styles.taskName, item.completed && styles.completedTask]}>
                {item.name}
              </Text>
              <Text style={styles.taskDescription}>{item.description}</Text>
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

      <TouchableOpacity style={styles.button} onPress={signout}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>


      <TouchableOpacity style={styles.button} onPress={goToHome}>
        <Text style={styles.buttonText}>Go to Home</Text>
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
  },
  headerImage: {
    width: 900,
    height: 800,
    resizeMode: "contain",
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
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: "80%",
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "60%",
    marginRight: 10,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "30%",
  },
  timePickerSeparator: {
    fontSize: 19,
    fontWeight: 'bold',
    paddingHorizontal: 4, 
  },
  manageTasksText: {
    color: "black",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 40,
  },
});

