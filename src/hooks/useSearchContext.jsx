import { useContext } from "react"

import { searchContext } from "../contexts/searchcontext"

const useSearchContext = () => {
    const context = useContext(searchContext)
    if(!context)
    {
        throw new Error('Search context must be used within a search provider');
    }
    return context;
}

export default useSearchContext;