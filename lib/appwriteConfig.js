import { Client, Account } from "react-native-appwrite";
import { Platform } from "react-native";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67accb050038d10e9102');

switch (Platform.OS) {
    case "ios":
        client.setPlatform('com.yourcompany.exam1');
        break;
    case "android":
        client.setPlatform('To-Do-List-App');
        break;
}

const account = new Account(client);

export { account };