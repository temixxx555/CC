import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useSearchContext from "../hooks/useSearchContext";

const RouteChangeHandler = () => {
    const location = useLocation();
    const {setSearchBoxVisibility} = useSearchContext();

    useEffect(() => {
        // automatically hide search bar when route changes
        setSearchBoxVisibility(false);
    }, [location.pathname]);

    return null; // this component does not render anything.
}

export default RouteChangeHandler;