import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, CameraType } from "expo-camera";
import { useContext, useEffect, useRef, useState } from "react";
import * as Sharing from "expo-sharing";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { PhotoContext } from "../Manager/PhotoState";
import { Alert } from "react-native";
import * as Location from "expo-location";
import * as SQLite from 'expo-sqlite';

export default function Gallery({ navigation }) {
  const { Setpreview,setaddress } =
    useContext(PhotoContext);
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermissions] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermissions] = useState();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading,Setloading]=useState(false);
  
  const [image, setImage] = useState([]);
// Function to retrieve and display stored images with dates
const db = SQLite.openDatabase('G_PicsDB.db');
const displayStoredImages = () => {
  
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM images', [], (tx, results) => {
      const images = [];
      for (let i = 0; i < results.rows.length; i++) {
        const item = results.rows.item(i);
        images.push({
          data: item.data,
          capture_date: item.capture_date,
          location:item.location,
          id:item.id
        });
      }
      setImage(images);
    });
  });
};

useEffect(()=>{
  displayStoredImages();
})

  useEffect(() => {
    (async () => {
      const cameraPermissions = await Camera.requestCameraPermissionsAsync();
      const mediaLibrary = await MediaLibrary.requestPermissionsAsync();
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status == undefined || status !== "granted" || status == null) {
          setErrorMsg("Permission to access location was denied");
        }
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        setErrorMsg("Permission to access location was denied");
      }
      setHasCameraPermissions(cameraPermissions.status == "granted");
      setHasMediaLibraryPermissions(mediaLibrary.status == "granted");
    })();
  }, []);
  if (hasCameraPermission === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ alignSelf: "center" }}>
          Requesting permissions...{errorMsg}
        </Text>
      </View>
    );
  } else if (!hasCameraPermission) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Permission for camera not granted. Please allow permissions</Text>
      </View>
    );
  } else if (errorMsg!==null || location == null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{errorMsg}.Please enable or allow then re-lauch the app</Text>
      </View>
    );
  }

  var GetAddress = async(myLat,myLon)=>{
    const reverseGeo= await Location.reverseGeocodeAsync({latitude:myLat,longitude:myLon});
    if(reverseGeo!==null || reverseGeo!==undefined)
    {
      setaddress(reverseGeo[0].country+", "+reverseGeo[0].region+", "+reverseGeo[0].subregion);
    }
  }

  let text = "Waiting..";
  if (errorMsg!==null) {
    text = errorMsg;
  } else if (location) {
    var myLat=null;
    var myLon=null;
    myLat=location.coords.latitude;
    myLon=location.coords.longitude;
    GetAddress(myLat,myLon);
  }

  const OpenCamera = () => {
    navigation.navigate("CamaraView");
  };
  const Visitpreview = (item) => {
    Setpreview(item);
    navigation.navigate("Preview");
  };
  const DeleteImg = (id) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM images WHERE id = ?', [id], (tx, results) => {
        if (results.rowsAffected > 0) {
          Alert.alert('Image deleted successfully!');
          displayStoredImages();
        } else {
          Alert.alert('Image deletion failed.');
        }
      });
    });
    //SetPictures((image) => image.filter((pic) => pic.id !== id));
  };
  if(isLoading==true){
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading images...</Text>
      </View>
    )
  }else{
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          numColumns={3}
          data={image}
          renderItem={({ item }) => (
            <View
              style={{
                flex: 1,
                margin: 2,
                width: Dimensions.get("window").width / 2,
              }}
            >
              <TouchableOpacity
                onPress={() => Visitpreview(item)}
                onLongPress={() =>
                  Alert.alert("Warning", "You are about to delete this image", [
                    {
                      text: "Delete",
                      onPress: () => DeleteImg(item.id),
                    },
                    {
                      text: "Keep",
                      onPress: () => {},
                    },
                  ])
                }
              >
                <Image
                  style={{ width: "100%", height: 250 }}
                  source={{ uri: item.data }}
                />
              </TouchableOpacity>
            </View>
          )}
        />
  
        <FAB icon="camera" style={styles.fab} onPress={() => OpenCamera()} />
      </SafeAreaView>
    );
  }
 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
