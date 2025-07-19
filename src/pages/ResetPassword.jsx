import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import InputBox from "../components/input.component"; // adjust path if needed
import AnimationWrapper from "../common/page-animation"; // optional wrapper

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  //   const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let form = new FormData(e.target);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    let { password } = formData;
    if (!password) return toast.error("Password is required");

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/reset-password/${token}`,
        { password }
      );

      toast.success(res.data.message || "Password reset successful");
      navigate("/signin"); // redirect to login page
    } catch (err) {
        console.log(err);
        
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimationWrapper keyValue='reset-password'>
      <section className='h-cover flex items-center justify-center'>
        <form onSubmit={handleSubmit} className='w-[80%] max-w-[400px]'>
          <h1 className='text-4xl font-gelasio capitalize text-center mb-24'>
            Reset Password
          </h1>

          <InputBox
            name='password'
            type='password'
            placeholder='Enter new password'
            icon='fi-rr-key'
            // value={password}
            // onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className='btn-dark mt-10 w-full'
            type='submit'
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default ResetPassword;
