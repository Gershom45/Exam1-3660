import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons

// ✅ Define the Task type correctly
type Task = {
  id: number;
  name: string;
  description: string;
  location: string;
  time: string;
  completed: boolean;
};

export default function Edit() {
  const { signout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputName, setInputName] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [inputLocation, setInputLocation] = useState("");
  const [inputTime, setInputTime] = useState("");
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("AM");
  const [timeInput, setTimeInput] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

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

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) =>
      task.id === id
        ? { ...task, completed: !task.completed }
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
  };

  const goToHome = () => {
    navigation.navigate("index");
  };

  const openMenu = (id: number) => {
    setSelectedTaskId(id);
    setModalVisible(true);
  };

  const closeMenu = () => {
    setSelectedTaskId(null);
    setModalVisible(false);
  };

  const handleEdit = () => {
    if (selectedTaskId !== null) {
      editTask(selectedTaskId);
    }
    closeMenu();
  };

  const handleDelete = () => {
    if (selectedTaskId !== null) {
      deleteTask(selectedTaskId);
    }
    closeMenu();
  };

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
            <TouchableOpacity onPress={() => openMenu(item.id)}>
              <MaterialIcons name="more-vert" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeMenu}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
              <Text style={styles.modalButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
              <Text style={styles.modalButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  taskLocation: {
    fontSize: 16,
    color: "black",
  },
  taskDescription: {
    fontSize: 14,
    color: "gray",
  },
  taskName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
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
  manageTasksText: {
    color: "#8b61c2", // Changed color to #8b61c2
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalButton: {
    padding: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 18,
    color: "black",
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
  divider: {
    height: 1,
    backgroundColor: 'grey',
    marginVertical: 10,
  },
  taskTime: {
    fontSize: 16,
    color: "black",
  },
  timePickerSeparator: {
    fontSize: 19,
    fontWeight: 'bold',
    paddingHorizontal: 4, 
  },
});