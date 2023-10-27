import { StyleSheet, Text, View } from "react-native";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Gallery from "./screens/Gallery";
import CamaraView from "./screens/CameraView";
import { PhotoProvider } from "./Manager/PhotoState";
import Preview from "./screens/Preview";

const Stack = createNativeStackNavigator();
const op = { title: "", headerShown: false };
export default function App() {
  return (
    <View style={styles.container}>
      <PhotoProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Gallery">
            <Stack.Screen name="Gallery" component={Gallery} options={op} />
            <Stack.Screen
              name="CamaraView"
              component={CamaraView}
              options={op}
            />
            <Stack.Screen
              name="Preview"
              component={Preview}
              options={op}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PhotoProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
