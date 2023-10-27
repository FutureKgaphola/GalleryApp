import {
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
import { useContext, useEffect, useRef, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { PhotoContext } from "../Manager/PhotoState";
import "react-native-get-random-values";
import { v4 as uuidv4 } from 'uuid';
let moment = require('moment');
import * as SQLite from 'expo-sqlite';

const CamaraView = () => {
  const db=SQLite.openDatabase('Pics.db');
  const [isLoading,Seloading]=useState();
  
  let date = moment().utcOffset('+03:00').format('YYYY-MM-DD');
  const { pictures, SetPictures,setaddress ,address } = useContext(PhotoContext);
  const [location, setLocation] = useState(null);
  let cameraRef = useRef();
  
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
    let options = {
      quality: 1,
      base64: true,
      exif: false,
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    SetPictures([...pictures,{key:uuidv4(),dateTaken:date,location:address,img:"data:images/jpg;base64," + newPhoto.base64 }])
  };
  if (errorMsg!==null || location == null) {
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
        <AntDesign name="camera" size={55} color="black" />
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
