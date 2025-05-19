import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { Toaster } from "react-hot-toast";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import Home from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";

export const userContext = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    try {
      let userInSession = lookInSession("user");
      if (userInSession) {
        setUserAuth(JSON.parse(userInSession));
      }
    } catch (error) {
      console.error("Error parsing session data:", error);
    }
  }, []);
  return (
    <>
      <Toaster position='top-right' reverseOrder={false} />
      <userContext.Provider value={{ userAuth, setUserAuth }}>
        {/* because i think it is the parent provider */}
        <Routes>
          <Route path='/editor' element={<Editor />} />
          <Route path='/editor/:blog_id' element={<Editor />} />
          <Route path='/' element={<Navbar />}>
            {/* index means render the parent path which is / */}
            <Route index element={<Home />} />
            <Route path="/settings" element={<SideNav />}>
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
            <Route path='signin' element={<UserAuthForm type='sign-in' />} />
            <Route path='signup' element={<UserAuthForm type='sign-up' />} />
            <Route path='search/:query' element={<SearchPage />} />
            <Route path='user/:id' element={<ProfilePage />} />
            <Route path='blog/:blog_id' element={<BlogPage /> } />
            <Route path='*' element={<PageNotFound />} />
          </Route>
        </Routes>
      </userContext.Provider>
    </>
  );
};

export default App;
