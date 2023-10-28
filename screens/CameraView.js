import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import { useContext, useEffect, useRef, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { PhotoContext } from "../Manager/PhotoState";
import "react-native-get-random-values";
import { v4 as uuidv4 } from 'uuid';
let moment = require('moment');

import { ActivityIndicator, MD2Colors } from 'react-native-paper';

const CamaraView = () => {
  let cameraRef = useRef();
  const db = SQLite.openDatabase('G_PicsDB.db');
  
  // Create a table to store images with date if it doesn't exist
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, data BLOB, capture_date TEXT, location TEXT);'
    );
  });

  const [isLoading,Setloading]=useState(false);
  
  let date = moment().utcOffset('+03:00').format('YYYY-MM-DD');
  const { pictures, SetPictures,setaddress ,address } = useContext(PhotoContext);
  const [location, setLocation] = useState(null);
  
  const [errorMsg, setErrorMsg] = useState(null);
  useEffect(()=>{
    ( async()=>{
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
    })()
  },[])
  var GetAddress = async(myLat,myLon)=>{
    const reverseGeo= await Location.reverseGeocodeAsync({latitude:myLat,longitude:myLon});
    if(reverseGeo!==null || reverseGeo!==undefined)
    {
      //console.log(reverseGeo);
      setaddress(reverseGeo[0].country+", "+reverseGeo[0].region+", "+reverseGeo[0].subregion);
    }
  }

  if(location) {
    var myLat=null;
    var myLon=null;
    myLat=location.coords.latitude;
    myLon=location.coords.longitude;
    GetAddress(myLat,myLon);
  }
  const TakePicture = async () => {
    if (cameraRef) {
      Setloading(true);
      const photo = await cameraRef.current.takePictureAsync();
      const data = photo.uri;
      const captureDate = new Date().toJSON();
      try {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO images (data, capture_date, location) VALUES (?, ?, ?)',
            [data, captureDate, address],
            (tx, results) => {
              if (results.rowsAffected > 0) {
                Setloading(false);
                Alert.alert('Image captured and stored successfully!');
              } else {
                Setloading(false);
                Alert.alert('Image capture and storage failed.');
              }
            }
          );
        });
      } catch (error) {
        console.log(error);
        Setloading(false);
      }
    }
  };


  if (errorMsg!==null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{errorMsg}.Please enable or allow then re-lauch the app</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <Camera style={styles.camstyle} ref={cameraRef}></Camera>
      <TouchableOpacity
        style={{ alignSelf: "center" }}
        onPress={() => TakePicture()}
      >
        <View style={{flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
        <AntDesign name="camera" size={55} color="black" />
        {isLoading && <ActivityIndicator animating={true} color={MD2Colors.red800} />}
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CamaraView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  camstyle: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
