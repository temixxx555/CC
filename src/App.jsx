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
import Notifications from "./pages/notifications.page";
import ManageBlogs from "./pages/manage-blogs.page";
import TestPage from "./pages/TestPage";
import Leaderboard from "./pages/Leaderboard";
import SocialCircle from "./pages/SocialCircle";
import Ranking from "./pages/Ranking";
import AssignRank from "./pages/AssignRank";
import ChatPage from "./pages/ChatPage";
import { SocketProvider } from "./contexts/SocketContexts";
import AnnonymousPage from "./pages/AnnonymousPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ViewMessage from "./pages/viewMessage";
import {
  onForegroundMessage,
  requestNotificationPermission,
} from "./common/requestNotificationPermission";
import axios from "axios";
import TweetPage from "./pages/TweetPage";
import TweetView from "./pages/TweetView";

export const userContext = createContext({});
export const ThemeContext = createContext({});

const darkThemePreference = () =>
  window.matchMedia("(prefers-color-scheme:dark)").matches;
const App = () => {
  const [userAuth, setUserAuth] = useState({});

  const [theme, setTheme] = useState(() =>
    darkThemePreference() ? "dark" : "light"
  );
  const entryLoader = document.getElementById("entry-loader");
  if (entryLoader) entryLoader.remove();
  useEffect(() => {
    try {
      let userInSession = lookInSession("user");
      let themeInSession = lookInSession("theme");
      if (userInSession) {
        setUserAuth(JSON.parse(userInSession));
      }
      if (themeInSession) {
        setTheme(() => {
          document.body.setAttribute("data-theme", themeInSession);
          return themeInSession;
        });
      } else {
        document.body.setAttribute("data-theme", theme);
      }
    } catch (error) {
      console.error("Error parsing session data:", error);
    }
  }, []);

  //For Push notification
  useEffect(() => {
    // console.log(userAuth, "important");

    if (!userAuth?.access_token) {
      return;
    }
    async function setupFCM() {
      const token = await requestNotificationPermission();
      if (token) {
        await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/save-token",
          {
            token,
          },
          {
            headers: {
              Authorization: `Bearer ${userAuth?.access_token}`,
            },
          }
        );
      }
    }
    setupFCM();
    onForegroundMessage();
  }, [userAuth?.access_token]);
  return (
    <>
      <Toaster position='top-right' reverseOrder={false} />
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <userContext.Provider value={{ userAuth, setUserAuth }}>
          {/* because i think it is the parent provider */}
          {/* socketProvider to connect with the socket io in the backend */}
          <SocketProvider>
            <Routes>
              <Route path='/editor' element={<Editor />} />
              <Route path='/tweet' element={<TweetPage />} />
              <Route path='/editor/:blog_id' element={<Editor />} />
              <Route path='/' element={<Navbar />}>
                {/* index means render the parent path which is / */}
                <Route index element={<Home />} />
                <Route path='/ranking' element={<Ranking />} />
                <Route path='/admin' element={<AssignRank />} />
                <Route path='/dashboard' element={<SideNav />}>
                  <Route path='blogs' element={<ManageBlogs />} />
                  <Route path='notifications' element={<Notifications />} />
                  <Route path='leaderboard' element={<Leaderboard />} />
                  <Route path='social-circle' element={<SocialCircle />} />
                  <Route path='messages' element={<ChatPage />} />
                  <Route
                    path='anonymous-message'
                    element={<AnnonymousPage />}
                  />
                </Route>
                <Route path='/settings' element={<SideNav />}>
                  <Route path='edit-profile' element={<EditProfile />} />
                  <Route path='change-password' element={<ChangePassword />} />
                </Route>
                <Route
                  path='signin'
                  element={<UserAuthForm type='sign-in' />}
                />
                <Route
                  path='signup'
                  element={<UserAuthForm type='sign-up' />}
                />
                <Route path='forgot-password' element={<ForgotPassword />} />
                <Route
                  path='reset-password/:token'
                  element={<ResetPassword />}
                />
                <Route path='search/:query' element={<SearchPage />} />
                <Route path='messages' element={<ChatPage />} />
                <Route path='messages/:id' element={<ChatPage />} />
                <Route path='/anonymous/:id' element={<ViewMessage />} />
                <Route path='user/:id' element={<ProfilePage />} />
                <Route path='blog/:blog_id' element={<BlogPage />} />
                <Route path='tweet/:blog_id' element={<TweetView />} />
                <Route path='test' element={<TestPage />} />
                <Route path='*' element={<PageNotFound />} />
              </Route>
            </Routes>
          </SocketProvider>
        </userContext.Provider>
      </ThemeContext.Provider>
    </>
  );
};

export default App;
