import { createContext, useContext, useState } from "react";

export const GlobalContext = createContext();

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context)
    {
        throw new Error('Global context must be used within its provider');
    }
    return context;
}

export const GlobalContextProvider = ({children}) => {
    const [cachedBlog, setCachedBlog] = useState(null);
    
    return (
        <GlobalContext.Provider value={{cachedBlog, setCachedBlog}}>
            {children}
        </GlobalContext.Provider>   
    )
}