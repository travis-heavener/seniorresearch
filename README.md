# Travis Heavener's Senior Research Project
### Utilizing Entertainment-Based Encouragement Tactics to Promote Physical Activity

## Required React Native Libraries/APIs
The following code snippet shows required libraries and how to install them from a terminal:
```
# stack navigation dependencies
npm i @react-navigation/native
npm i @react-navigation/stack

# Expo Pedometer/Magnetometer
npm i expo-sensors

# Expo Geolocation
npm i expo-location

# EAS CLI (app building)
npm i expo-dev-client
npm i eas-cli

# Deprecated (as of 1/30/2023)
npm i @react-navigation/material-top-tabs react-native-tab-view # swipe screen navigation
npm i react-native-pager-view@6.0.1 # swipe screen depedencies
```

Refer to the following link to set-up EAS: https://docs.expo.dev/build/setup/

Use the following commands in CMD to use EAS build and run the development app:
```
eas build --profile development --platform android # build app, takes a few minutes
expo start --dev-client # start app
```