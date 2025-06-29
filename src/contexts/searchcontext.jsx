import { createContext, useState } from "react";

export const searchContext = createContext({});

// this component provides the user with the searchBoxVisibility state

export const SearchContextProvider = ({children}) => {
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
    return (
        <searchContext.Provider value={{searchBoxVisibility, setSearchBoxVisibility}}>
            {children}
        </searchContext.Provider>
    )
}