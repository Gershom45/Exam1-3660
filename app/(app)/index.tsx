import React, { useState, useEffect } from "react";
import {
 Text,
 View,
 SafeAreaView,
 StyleSheet,
 TouchableOpacity,
 TextInput,
 FlatList
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import TextCustom from "../components/TextCustom";
import { useNavigation, NavigationProp } from '@react-navigation/native';

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

 // ✅ Corrected addTask function
 const addTask = () => {
   if (inputName.trim() === "") return;
   const newTask: Task = { 
     id: Date.now(), 
     name: inputName, 
     description: inputDescription, 
     location: inputLocation, 
     time: inputTime, 
     completed: false 
   };
   setTasks([...tasks, newTask]);
   setInputName("");
   setInputDescription("");
   setInputLocation("");
   setInputTime("");
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
   if (inputName.trim() === "") return;
   setTasks(tasks.map((task) =>
     task.id === editTaskId ? { 
       ...task, 
       name: inputName, 
       description: inputDescription, 
       location: inputLocation, 
       time: inputTime 
     } : task
   ));
   setInputName("");
   setInputDescription("");
   setInputLocation("");
   setInputTime("");
   setEditTaskId(null); // Reset the edit task ID
   setIsHomeScreen(true); // back to the home screen
 };


 const goToHome = () => {
   setIsHomeScreen(true);  // to Home screen
 };


 const goToTasks = () => {
   setIsHomeScreen(false);  // go to tasks list 
 };


if (isHomeScreen) {
 return (
   <SafeAreaView style={[styles.container, { backgroundColor: "white" }]}>
     <View style={styles.header}>
       <Text style={styles.headerText}>To-Do</Text>
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
     </View>
   </SafeAreaView>
 );
}


 return (
   <SafeAreaView style={styles.container}>
     <Text style={styles.text}>Manage your tasks below:</Text>

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
     <TextInput
       style={styles.input}
       placeholder="Enter task time..."
       value={inputTime}
       onChangeText={setInputTime}
     />


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
   width: "100%",
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
 },
 headerText: {
   color: "black",
   fontSize: 30,
   fontWeight: "bold",
 },
 body: {
   flex: 1,
   justifyContent: "center",
   alignItems: "center",
 },
 taskDescription: {
   fontSize: 14,
   color: "gray",
 },
 taskLocation: {
   fontSize: 14,
   color: "black",
 },
 taskTime: {
   fontSize: 14,
   color: "black",
 },
 taskName: {
   fontSize: 16,
   fontWeight: "bold",
 },
 divider: {
   height: 1,
   backgroundColor: "gray",
   marginVertical: 5,
 },
});

