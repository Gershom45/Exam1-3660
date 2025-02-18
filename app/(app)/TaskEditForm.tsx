import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TaskEditForm() {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params as { taskId: number };
  const [task, setTask] = useState({ id: 0, text: "", completed: false });

  useEffect(() => {
    loadTask();
  }, []);

  const loadTask = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        const taskToEdit = tasks.find((t: any) => t.id === taskId);
        if (taskToEdit) {
          setTask(taskToEdit);
        }
      }
    } catch (error) {
      console.log("Error loading task:", error);
    }
  };

  const saveTask = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        let tasks = JSON.parse(storedTasks);
        tasks = tasks.map((t: any) => (t.id === task.id ? task : t));
        await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
        navigation.goBack();
      }
    } catch (error) {
      console.log("Error saving task:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={task.text}
        onChangeText={(text) => setTask({ ...task, text })}
      />
      <Button title="Save" onPress={saveTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "100%",
    borderColor: "grey",
  },
});
