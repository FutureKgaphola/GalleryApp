import React, { createContext, useState } from "react";
const PhotoContext = createContext();
const PhotoProvider = ({ children }) => {
  const [preview, Setpreview] = useState({});
  const [address,setaddress]=useState('');
  return (
    <PhotoContext.Provider
      value={{
        preview,
         Setpreview,
         address,setaddress
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};

export {PhotoContext,PhotoProvider};
