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
  const { pictures, SetPictures, preview, Setpreview,setaddress } =
    useContext(PhotoContext);
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermissions] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermissions] = useState();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading,Setloading]=useState(false);
  /*const db=SQLite.openDatabase('Pics.db');
 
  const [dummy,SetDummy]=useState([]);

  useEffect(()=>{
    db.transaction(tx=>
      tx.executeSql('CREATE TABLE IF NOT EXISTS mypictures (id INTEGER PRIMARY KEY AUTOINCREMENT,key TEXT,dateTaken TEXT,location TEXT,img TEXT)')
    )
  },[])*/

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
    SetPictures((pictures) => pictures.filter((pic) => pic.key !== id));
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
          data={pictures}
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
                      onPress: () => DeleteImg(item.key),
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
                  source={{ uri: item.img }}
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
