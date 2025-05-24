import { Link } from "react-router-dom";
import lightPageNotFOund from "../imgs/404-light.png";
import darkPageNotFOund from "../imgs/404-dark.png";
import lightFullLogo from "../imgs/full-logo-light.png";
import darkFullLogo from "../imgs/full-logo-dark.png";
import { useContext } from "react";
import {ThemeContext} from "../App";
const PageNotFound = () => {
  let { theme } = useContext(ThemeContext);
  return (
    <section className='h-cover p-10 flex flex-col items-center gap-20 text-center'>
      <img
        src={theme == "light" ? darkPageNotFOund : lightPageNotFOund}
        alt='404 img'
        className='select-none border-2 border-grey w-72 aspect-square object-cover rounded'
      />
      <h className='text-4xl font-gelasio leading-7'>Page not Found</h>
      <p className='text-dark-grey task-grey text-xl leading-7 -mt-8'>
        The page you are looking for dosent exist. Head back to{" "}
        <Link to='/' className='text-black underline'>
          the home page{" "}
        </Link>{" "}
      </p>
      <div className='mt-auto'>
        <img
          src={theme == "light" ? darkFullLogo : lightFullLogo}
          alt='logo'
          className='h-8 object-contain block mx-auto select-none'
        />
        <p className='mt-5 text-dark-grey'>
          Read millions of stories around the world
        </p>
      </div>
    </section>
  );
};

export default PageNotFound;
