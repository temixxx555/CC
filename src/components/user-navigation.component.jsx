import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { userContext } from "../App";
import { removeFromSession } from "../common/session";

const UserNavigationPanel = () => {
  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(userContext);
  const SignOutUser = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
  };
  return (
    <AnimationWrapper
      transition={{ duration: 0.2 }}
      className='absolute right-0 z-50 '
    >
      <div className='bg-white absolute right-0 border border-grey w-60 duration-200'>
        <Link to='/editor' className='flex gap-2 link md:hidden pl-8 py-4'>
          <i className='fi fi-rr-file-edit'></i>
          <p>Write</p>
        </Link>
        <Link className='link pl-8 py-4 ' to={`/user/${username}`}>
          Profile
        </Link>
        <Link to='/tweet' className='gap-2 link hidden md:flex pl-8 py-4'>
          <p>Tweet</p>
        </Link>
        <Link className='link pl-8 py-4 ' to='/dashboard/blogs'>
          Dashboard
        </Link>
        <Link className='link pl-8 py-4 ' to={`/messages`}>
          Chats
        </Link>
        <Link className='link pl-8 py-4 ' to='/settings/edit-profile'>
          Settings
        </Link>
        <span className='absolute border-t border-grey w-[100%]'></span>

        <button
          className='text-left p-4 hover:bg-grey w-full pl-8 py-4'
          onClick={SignOutUser}
        >
          <h1 className='font-bold text-xl mg-1'>Sign Out</h1>
          <p className='text-dark-grey'>@{username}</p>
        </button>
      </div>
    </AnimationWrapper>
  );
};
export default UserNavigationPanel;
