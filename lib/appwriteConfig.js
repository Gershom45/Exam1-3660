import { Client, Account, Databases } from "react-native-appwrite";
import { Platform } from "react-native";

// ✅ Load environment variables properly
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const APPWRITE_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID; // ✅ Add this

// ✅ Ensure all variables exist
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_ID) {
    throw new Error("Missing Appwrite environment variables. Check your .env file.");
}

// ✅ Initialize Appwrite Client
const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);

switch (Platform.OS) {
    case "ios":
        client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_BUNDLE_ID);
        break;
    case "android":
        client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PACKAGE_NAME);
        break;
}

const account = new Account(client);
const database = new Databases(client);

// ✅ Export instances + collection ID for use
export { account, database, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID };

