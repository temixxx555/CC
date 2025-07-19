import  { useRef, useState } from "react";
import InputBox from "../components/input.component";
import { toast } from "react-hot-toast";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const handleForgotPassword = async (e) => {
    e.preventDefault();

      //formdata
    let form = new FormData(e.target);
    let formData = {};
    for (let [key, value] of form.entries()) {
      // to get the data
      formData[key] = value;
    }

    // form validation
    const { email } = formData;
    console.log(email);
    

    if (!email) return toast.error("Email is required");

    // Optional: Simple email regex validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) return toast.error("Email is invalid");

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/forgot-password`,
        { email }
      );

      toast.success(res.data.message || "Reset link sent to your email");
      navigate("/signin")
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimationWrapper keyValue="forgot-password">
      <section className='h-cover flex items-center justify-center'>
        <form onSubmit={handleForgotPassword}  className='w-[80%] max-w-[400px]'>
          <h1 className='text-4xl font-gelasio capitalize text-center mb-24'>
            Forgot Password
          </h1>

          <InputBox
            name='email'
            type='email'
            placeholder='Enter your email'
            icon='fi-rr-envelope'
            // value={email}
            // onChange={(e) => setEmail(e.target.value)}
          />

          <button className='btn-dark mt-10 w-full' type='submit' disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default ForgotPassword;
