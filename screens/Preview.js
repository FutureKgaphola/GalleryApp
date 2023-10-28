import { Camera } from "expo-camera";
import { useContext, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PhotoContext } from "../Manager/PhotoState";
import { Ionicons } from "@expo/vector-icons";
import * as SQLite from 'expo-sqlite';
const Preview = ({ navigation }) => {
  const { preview, Setpreview} =
    useContext(PhotoContext);

  const [ShowDelete, setShowDelete] = useState(false);
  const { id, data, location, capture_date } = preview;
  const db = SQLite.openDatabase('G_PicsDB.db');

  const DeleteImg = (id) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM images WHERE id = ?', [id], (tx, results) => {
        if (results.rowsAffected > 0) {
          
          Setpreview({});
          navigation.navigate("Gallery");
        } else {
          Alert.alert('Image deletion failed.');
        }
      });
    });
    
  };
  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.container}
        onPress={() => setShowDelete(ShowDelete ? false : true)}
      >
        <Image style={styles.container} source={{ uri: data }}></Image>
        {ShowDelete && (
          <Text
            style={{
              backgroundColor: "#fff",
              margin: 3,
              padding: 3,
              borderRadius: 5,
              position: "absolute",
            }}
          >
            📆 {capture_date}
          </Text>
        )}
      </Pressable>
      {ShowDelete && (
        <View
          style={{
            position: "absolute",
            zIndex: 5,
            elevation: 5,
            alignSelf: "center",
            margin: 5,
            bottom: 0,
          }}
        >
          <Text
            style={{
              backgroundColor: "#fff",
              margin: 3,
              padding: 3,
              borderRadius: 5,
            }}
          >
            📍 {location}
          </Text>

          <View style={{ flexDirection: "row", alignSelf: "center" }}>
            <Ionicons
              onPress={() => DeleteImg(id)}
              style={{
                backgroundColor: "white",
                borderRadius: 15,
                padding: 10,
              }}
              name="trash-bin-outline"
              size={24}
              color="black"
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Preview;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "stretch",
    position: "relative",
  },
});
