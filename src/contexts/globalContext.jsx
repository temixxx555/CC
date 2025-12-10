import { createContext, useState, useContext } from "react";

export const useCachedBlog = () => {
    const context = useContext(cachedBlogContext);
    if(!context)
    {
        throw new Error('cached blog context not used within the appropriate provider');
    }
    return context;
}

export const cachedBlogContext = createContext(null);

export const CachedBlogProvider = ({children}) => {
    const [cachedBlog, setCachedBlog] = useState(null)
    return <cachedBlogContext.Provider value={{cachedBlog, setCachedBlog}}>
        {children}
    </cachedBlogContext.Provider>
}
