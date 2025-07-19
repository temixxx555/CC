import React, { useState, useContext, useRef } from "react";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { userContext } from "../App";
import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
  const [loading, setLoading] = useState(false);
  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(userContext);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)

      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };
  const handleSubmitFunction = (e) => {
    e.preventDefault();

    let serverRoute = type == "sign-in" ? "/signin" : "/signup";
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
    //formdata
    let form = new FormData(formElement);
    let formData = {};
    for (let [key, value] of form.entries()) {
      // to get the data
      formData[key] = value;
    }

    // form validation
    const { fullname, email, password } = formData;
    if (type !== "sign-in") {
      if (fullname.length < 3 || fullname.length > 20) {
        return toast.error("Fullname must be at least 3 letters long");
      }
    }
    if (!email) {
      return toast.error("Email is required");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }
    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password should be 6 to 20 letters long with a numeric,1 lowercase and 1 uppercase letters "
      );
    }
    userAuthThroughServer(serverRoute, formData);
    console.log(import.meta.env.VITE_SERVER_DOMAIN + serverRoute);
  };
  if (access_token) {
    return <Navigate to='/' />;
  }
  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple clicks

    setLoading(true);
    try {
      const { user, idToken } = await authWithGoogle();
      let serverRoute = "/google-auth";
      let formData = { access_token: idToken };
      userAuthThroughServer(serverRoute, formData);
    } catch (err) {
      toast.error("Trouble logging in through Google");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimationWrapper keyValue={type}>
        <section className='h-cover flex items-center justify-center'>
          <form id='formElement' className='w-[80%] max-w-[400px] '>
            <h1 className='text-4xl font-gelasio capitalize text-center mb-24 '>
              {type == "sign-in" ? "Welcome Back" : "Join Us Today"}
            </h1>
            {type != "sign-in" ? (
              <InputBox
                name='fullname'
                type='text'
                placeholder='full Name'
                icon='fi-rr-user'
              />
            ) : (
              ""
            )}

            <InputBox
              name='email'
              type='email'
              placeholder='Email'
              icon='fi-rr-envelope'
            />
            <InputBox
              name='password'
              type='password'
              placeholder='Password'
              icon='fi-rr-key'
            />

            {type === "sign-in" && (
              <p>
                {" "}
                <Link
                  className='underline text-black text-xl ml-1'
                  to='/forgot-password'
                >
                  Forgot Your Password?
                </Link>
              </p>
            )}

            <button
              className='btn-dark mt-10 '
              type='submit'
              onClick={handleSubmitFunction}
            >
              {type == "sign-in" ? "Sign In" : "Sign Up"}
            </button>
            <div className='relative w-full items-center gap-2 my-10 opacity-10 uppercase text-black font-bold'>
              <hr className='w-1/2 border-black' />
              <p>or</p>
              <hr className='w-1/2 border-black' />
            </div>
            <button
              className='btn-dark flex items-center justify-center gap-4 w-[90%] center'
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <img src={googleIcon} className='w-5' />
              {loading ? "Loading..." : "Continue with Google"}
            </button>
            {type === "sign-in" ? (
              <p className='mt-6 text-dark-rey text-xl text-center'>
                Don't have an account?
                <Link
                  className='underline text-black text-xl ml-1'
                  to='/signup'
                >
                  Join us today
                </Link>
              </p>
            ) : (
              <p className='mt-6 text-dark-rey text-xl text-center'>
                Already have an account?
                <Link
                  className='underline text-black text-xl ml-1'
                  to='/signin'
                >
                  Sign in here
                </Link>
              </p>
            )}
          </form>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default UserAuthForm;
