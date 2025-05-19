import { Link } from "react-router-dom";
import PageNotFOund from "../imgs/404.png";
import FullLogo from "../imgs/full-logo.png"
const PageNotFound = () => {
  return (
    <section className='h-cover p-10 flex flex-col items-center gap-20 text-center'>
      <img
        src={PageNotFOund}
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
        <img src={FullLogo} alt="logo" className="h-8 object-contain block mx-auto select-none" />
        <p className="mt-5 text-dark-grey">Read millions of stories around the world</p>
      </div>
    </section>
  );
};

export default PageNotFound;
