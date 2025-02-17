import { Client, Account } from "react-native-appwrite";
import { Platform } from "react-native";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67accb050038d10e9102');

switch (Platform.OS) {
    case "ios":
        client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_BUNDLE_ID);
        break;
    case "android":
        client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PACKAGE_NAME);
        break;
}

const account = new Account(client);

export { account };