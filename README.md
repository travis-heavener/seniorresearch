# Travis Heavener's Senior Research Project
### Utilizing Entertainment-Based Encouragement Tactics to Promote Physical Activity

## Required React Native Libraries/APIs
The following code snippet shows required libraries and how to install them from a terminal:
```
npm install -g react-navigation # react-navigation
npm install -g react-navigation-stack # react-navigation-stack
npm install -g @react-navigation/material-top-tabs react-native-tab-view # swipe screen navigation
npm install -g react-native-pager-view@6.0.1 # swipe screen depedencies

# Expo Pedometer
npm install -g expo-sensors

# EAS CLI (app building)
npm install -g eas-cli
```

Refer to the following link to set-up EAS: https://docs.expo.dev/build/setup/

Use the following commands in CMD to use EAS build and run the development app:
```
eas build --profile development --platform android # build app, takes a few minutes
expo start --dev-client # start app
```