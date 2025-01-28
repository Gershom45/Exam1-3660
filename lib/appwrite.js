import { Client, Databases } from "react-native-appwrite";
import { Platform } from "react-native";

// console.log("process.env:", process.env.APPWRITE_PROJECT_ID);

// const {
//     APPWRITE_ENDPOINT,
//     APPWRITE_PROJECT_ID,
//     APPWRITE_DB_ID,
//     APPWRITE_COL_TASKS_ID,
// } = process.env;

const config = {
    endpoint: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT_ID,
    db: process.env.APPWRITE_DB_ID,
    col: {
        tasks: process.env.APPWRITE_COL_TASKS_ID,
    },
};

console.log(config);

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

switch (Platform.OS) {
    case "ios":
        client.setPlatform("com.dennis.todo");
        break;
    // case 'android':
}

const database = new Databases(client);

export { database, config, client };
