import React, { useContext, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { userContext } from "../App";
import { MessageCircle, Trophy,UserCircle,Users } from "lucide-react";

const SideNav = () => {
  const {
    userAuth: { access_token, new_notification_available },
  } = useContext(userContext);
  let pages = location.pathname.split("/")[2];
  let [page, setPageState] = useState(pages.replace("-", " "));
  let [showSideNav, setShowSideNav] = useState(false);
  let activeTabLine = useRef();
  let sideBarIcon = useRef();
  let PageSateTab = useRef();

  const changePageState = (e) => {
    let { offsetWidth, offsetLeft } = e.target;
    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";

    if (e.target == sideBarIcon.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };
  useEffect(() => {
    setShowSideNav(false);
    PageSateTab.current.click();
  }, [page]);
  return access_token === null ? (
    <Navigate to='/signin' />
  ) : (
    <>
      <section className='relative flex gap-7 py-0 m-0 max-md:flex-col'>
        <div className='sticky top-[80px] scrollbar-hide'>
          <div className='md:hidden scrollbar-hide bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto'>
            <button
              ref={sideBarIcon}
              className='p-5 capitalize'
              onClick={changePageState}
            >
              <i className='fi fi-rr-bars-staggered pointer-events-none'></i>{" "}
            </button>
            <button
              ref={PageSateTab}
              className='p-5 capitalize'
              onClick={changePageState}
            >
              {page}
            </button>
            <hr
              ref={activeTabLine}
              className='absolute bottom-0 duration-500'
            />
          </div>
          <div
            className={
              "min-w-[200px] md:w-[250px] scrollbar-hide h-[calc(100vh-80px)] md:h-[calc(100vh-96px)] md:sticky top-[96px] overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+ 80px)] max-md:px-16 max-md:-ml-7 duration-500 " +
              (!showSideNav
                ? "max-md:opacity-0 max-md:pointer-events-none"
                : "opacity-100 ponter-events-auto")
            }
          >
            <h1 className='text-xl text-dark-grey mb-3  '>Dashboard</h1>
            <hr className='border-grey -ml-6 mb-8 mr-6' />

            <NavLink
              to='/dashboard/blogs'
              onClick={(e) => setPageState(e.target.innerText)}
              className='sidebar-link'
            >
              <i className='fi fi-rr-document'></i>
              Blogs
            </NavLink>

            <NavLink
              to='/dashboard/notifications'
              onClick={(e) => setPageState(e.target.innerText)}
              className='sidebar-link'
            >
              <div className="relative">
              <i className='fi fi-rr-bell'></i>

                {new_notification_available ? (
                  <span className='bg-red w-2 h-2 rounded-full absolute z-10 top-0 right-0'></span>
                ) : (
                  ""
                )}
              </div>
              Notifications
            </NavLink>
            <NavLink
              to='/dashboard/leaderboard'
              onClick={(e) => setPageState(e.target.innerText)}
              className='sidebar-link'
            >
              <div className="relative">
              <Trophy className='w-4 h-5 ' />
              </div>
              Leaderboards
            </NavLink>

            <NavLink
              to='/dashboard/social-circle'
              onClick={(e) => setPageState(e.target.innerText)}
              className='sidebar-link -mt-3'
            >
           <Users className='w-4 h-5' />
              Social Circle
            </NavLink>
            <NavLink
              to='/messages'
              onClick={(e) => setPageState(e.target.innerText)}
              className='sidebar-link -mt-3'
            >
           <MessageCircle className='w-4 h-5' />
              Chats
            </NavLink>
            <NavLink
              to='/editor'
              onClick={(e) => setPageState(e.target.innerText)}
              className='sidebar-link -mt-3'
            >
              <i className='fi fi-rr-file-edit'></i>
              Write
            </NavLink>

            <h1 className='text-xl text-dark-grey mt-20 mb-3  '>Settings</h1>
            <hr className='border-grey -ml-6 mb-8 mr-6' />

            <NavLink
              to='/settings/edit-profile'
              onClick={(e) => setPageState(e.target.innerText)}
              className='sidebar-link'
            >
              <i className='fi fi-rr-user'></i>
              Edit Profile
            </NavLink>

            <NavLink
              to='/settings/change-password'
              onClick={(e) => setPageState(e.target.innerText)}
              className='sidebar-link mb-8'
            >
              <i className='fi fi-rr-lock'></i>
              change Password
            </NavLink>
          </div>
        </div>
        <div className='max-md:-mt-8 mt-5 w-full md:hidden '>
          {!showSideNav ? <Outlet /> : ""}
        </div>
        <div className='max-md:-mt-8 mt-5 w-full hidden md:block'>
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default SideNav;
