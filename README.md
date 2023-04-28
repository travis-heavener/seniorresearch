# Travis Heavener's Senior Research Project
### Utilizing Entertainment-Based Encouragement Tactics to Promote Physical Activity

## Required React Native Libraries/APIs
The following code snippet shows required libraries and how to install them from a terminal:
```
# Stack Navigation dependencies
npm i @react-navigation/native
npm i @react-navigation/stack

# BlurView for modal backgrounds
npm i @react-native-community/blur

# Swipe Gestures for React native
npm i react-native-swipe-gestures

# Expo Pedometer/Magnetometer
npm i expo-sensors

# Expo Geolocation
npm i expo-location

# AsyncStorage to store user config data
npm i @react-native-async-storage/async-storage

# EventEmitter for functional callbacks between screens
npm i eventemitter3

# EAS CLI (app building)
npm i expo-dev-client
npm i eas-cli

# Deprecated (as of 1/30/2023)
npm i @react-navigation/material-top-tabs react-native-tab-view # swipe screen navigation
npm i react-native-pager-view@6.0.1 # swipe screen depedencies
```

Refer to the following link to set-up EAS: https://docs.expo.dev/build/setup/

Use the following commands in CMD/Powershell to use EAS build and run the development app:
```
npx eas build --profile development --platform android # build app, takes a few minutes
npx expo start --dev-client # start app
```