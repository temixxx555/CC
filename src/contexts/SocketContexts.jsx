import { Children, createContext, useContext, useEffect, useRef } from "react";
import { userContext } from "../App";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const {
    userAuth: { access_token,userId },
  } = useContext(userContext);

  useEffect(() => {
    if (access_token) {
      socket.current = io("http://localhost:3000" ,{
        withCredentials: true,
        query: {userId},
      });
      socket.current.on("connect",()=>{
        console.log("Connected to socket server");
        
      })
      return ()=>{
        socket.current.disconnect();
      }
    }
  }, [access_token]);

   return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
