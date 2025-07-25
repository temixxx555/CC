import { useContext, useState, useRef } from "react";
import lightlogo from "../imgs/logo-light.png";
import darklogo from "../imgs/logo-dark.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ThemeContext, userContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import { useEffect } from "react";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { storeInSession } from "../common/session";
import FooterNav from "./Footer";
const Navbar = () => {
  let { theme, setTheme } = useContext(ThemeContext);
  const [searchBoxVisibility, setSarchBoxVisibility] = useState(false);
  const [userNavPanel, setuserNavPanel] = useState(false);
  const { userAuth, setUserAuth } = useContext(userContext);
  const overlayRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [streaks, setStreaks] = useState({});
  const { access_token, profile_img, new_notification_available } =
    userAuth || {};
  let navigate = useNavigate();

  const handleUserNavPanel = () => {
    setuserNavPanel((currentval) => !currentval);
  };
  const handleBLur = () => {
    setTimeout(() => {
      setuserNavPanel(false);
    }, 300);
  };
  const HandleSearchFunction = (e) => {
    let query = e.target.value;


    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
      setSarchBoxVisibility(false);
    }
  };
  useEffect(() => {
    if (access_token) {
      axios
        .get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notification", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleFlameClick = () => {
    setShowOverlay((prev) => !prev);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
  };
  // Handle click outside overlay
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setShowOverlay(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Esc key to close overlay
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowOverlay(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  //get the streak
  useEffect(() => {
    const fetchStreaks = async () => {
      try {
        const { data } = await axios.get(
          import.meta.env.VITE_SERVER_DOMAIN + "/streaks",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        setStreaks(data);
      } catch (error) {
        console.log("Error fetching streaks:", error.message);
      }
    };

    fetchStreaks();
  }, [access_token]); // Run once on mount

  const ChangeTheme = () => {
    let newTheme = theme == "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    storeInSession("theme", newTheme);
  };

  //pwa
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);
  const handleLogoClick = async () => {
    console.log("clicked logo");
    
  navigate('/'); // navigate home

  if (deferredPrompt) {
    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null); // only once
  }
};


  return (
    <>
      <nav className='navbar z-50'>
        <div >
          {/* link tag dosent reload the page like the <A> tag</A> */}
          <img
            src={theme == "light" ? darklogo : lightlogo}
            className='flex-none w-10'
            onClick={handleLogoClick} // Handle PWA install prompt
            alt='logo'
          />
        </div>
        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
            (searchBoxVisibility ? "show" : "hide")
          }
        >
          <input
            type='text'
            placeholder='Search'
            className='w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey
          md:pl-12
          '
            onKeyDown={HandleSearchFunction}
          />
          <i className='fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey '></i>
        </div>

        <div className='flex items-center gap-3 md:gap-6 ml-auto  '>
          <button
            className='md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center '
            onClick={() => setSarchBoxVisibility((currentval) => !currentval)}
          >
            <i className='fi fi-rr-search text-xl '></i>
          </button>
          <Link to='/editor' className='hidden md:flex gap-2 link'>
            <i className='fi fi-rr-file-edit'></i>
            <p>Write</p>
          </Link>
          <button
            className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10'
            onClick={ChangeTheme}
          >
            <i
              className={
                "fi fi-rr-" +
                (theme == "light" ? "moon-stars" : "sun") +
                " text-2xl block mt-1 "
              }
            ></i>
          </button>

          {access_token ? (
            <>
              <button
                className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10'
                onClick={handleFlameClick}
              >
                {/* Flame Animation */}
                <DotLottieReact
                  src='https://lottie.host/02271725-b11e-42f9-b1a5-f6b8a94cd6c1/Oq8GFbPfmB.lottie'
                  loop
                  autoplay
                  className='w-full h-full object-contain'
                />

                {/* Notification Badge */}
                <span className='absolute -top-1 -right-1 bg-dark-grey text-white text-xs font-bold px-1 min-w-[1.25rem]  h-5 flex items-center justify-center rounded-full shadow-md'>
                  {streaks?.streak?.count || 0}
                </span>
              </button>
              <Link to='/dashboard/notifications'>
                <button className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 hidden md:block'>
                  <i className='fi fi-rr-bell text-2xl block mt-1'></i>
                  {new_notification_available ? (
                    <span className='bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2'></span>
                  ) : (
                    ""
                  )}
                </button>
              </Link>
              <div
                className='relative'
                onClick={handleUserNavPanel}
                onBlur={handleBLur}
              >
                <button className='w-12 h-12 mt-1'>
                  <img
                    src={profile_img}
                    className='w-full  h-full object-cover rounded-full'
                  />
                </button>
                {userNavPanel ? <UserNavigationPanel /> : ""}
              </div>
            </>
          ) : (
            <>
              {" "}
              <Link className='btn-dark py-2 ' to='/signin'>
                Sign In
              </Link>
              <Link className='btn-light py-2 hidden md:block ' to='/signup'>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
      {/* Overlay */}
      {showOverlay && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
          onClick={handleCloseOverlay}
        >
          <div
            ref={overlayRef}
            className={`w-full max-w-xl mx-4 p-6 md:p-8 rounded-2xl shadow-2xl transition-all duration-300 ${
              theme === "light"
                ? "bg-white text-black"
                : "bg-dark-grey text-white"
            } border border-gray-300`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex justify-between items-center mb-6'>
              <div>
                <h2 className='text-xl font-bold mb-1'>
                  🔥 {streaks?.streak?.count || 0} Streak Counted
                </h2>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  You're building a winning habit, one day at a time,and become the highest ranker in the School.
                </p>
              </div>
              <button
                className='w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors'
                onClick={handleFlameClick}
              >
                <DotLottieReact
                  src='https://lottie.host/02271725-b11e-42f9-b1a5-f6b8a94cd6c1/Oq8GFbPfmB.lottie'
                  loop
                  autoplay
                  className='w-full h-full object-contain'
                />
              </button>
            </div>

            {/* Body Content */}
            <div className='space-y-5 text-sm md:text-base'>
              <p className='font-semibold text-lg text-green-600 dark:text-green-400'>
                {streaks?.message || "Keep it going!"}
              </p>

              <p className='text-gray-700 dark:text-gray-300'>
                Remember your streaks are your daily achievements. Each day
                counts, and every effort matters. Keep pushing forward to crush your goals
              </p>

              <div className='space-y-2'>
                <Link
                  to='/dashboard/leaderboard'
                  onClick={() => setShowOverlay(false)}
                  className='inline-block underline hover:text-blue-600 transition-colors'
                >
                  🏆 Check your rank on the leaderboard
                </Link>
              </div>
            </div>

            {/* Optional Footer CTA */}
            <div className='mt-6'>
              <p className='text-xs text-gray-400 text-center'>
                Note  : streaks are updated based on your last post , miss a day and it restarts.,sucks right?🥲
              </p>
            </div>
          </div>
        </div>
      )}

      <Outlet />

<div className="h-20 md:hidden"></div>


      <FooterNav />
    </>
  );
};

export default Navbar;
