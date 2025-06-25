import React, { useContext, useEffect, useRef, useState } from "react";
import { userContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import InputBox from "../components/input.component";
import toast from "react-hot-toast";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  const {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(userContext);
  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState();
  const [updatedProfileImage, setUpdatedProfileImage] = useState(null);
  let editProfile = useRef();
  let profileImg = useRef();
  let {
    personal_info: {
      fullname,
      username: profile_username,
      profile_img,
      email,
      bio,
    },
    social_links,
  } = profile;
  let bioLimit = 150;
  useEffect(() => {
    if (access_token) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setProfile(data);
          setCharactersLeft(bioLimit - (data.personal_info.bio?.length || 0));
          setLoading(false);
        })
        .catch((err) => console.error("Profile fetch error:", err));
    }
  }, [access_token]);
  const handleCharactersChange = (e) => {
    setCharactersLeft(bioLimit - e.target.value.length);
  };
  const handleImagePreview = (e) => {
    let img = e.target.files[0];

    profileImg.current.src = URL.createObjectURL(img);
    setUpdatedProfileImage(img);
  };

  const UploadImage = async (img) => {
    try {
      const formData = new FormData();
      formData.append("image", img);

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // console.log("Upload image response:", data);
      if (!data.imageUrl) {
        throw new Error("No imageUrl in response");
      }

      setProfile({
        ...profile,
        personal_info: {
          ...profile.personal_info,
          profile_img: data.imageUrl,
        },
      });

      return data.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (updatedProfileImage) {
      const loadingToast = toast.loading("Uploading...");
      e.target.setAttribute("disabled", true);

      const imageUrl = await UploadImage(updatedProfileImage);

      if (imageUrl) {
        // console.log("Sending imageUrl to /update-profile-img:", imageUrl);
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/update-profile-img`,
            { profile_img: imageUrl },
            {
              headers: { Authorization: `Bearer ${access_token}` },
            }
          );

          // console.log("Update profile image response:", data);
          const newUserAuth = { ...userAuth, profile_img: data.profile_img };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);

          const { data: profileData } = await axios.post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`,
            { username: userAuth.username }
          );
          setProfile(profileData);

          setUpdatedProfileImage(null);
          toast.dismiss(loadingToast);
          e.target.removeAttribute("disabled");
          toast.success("Profile picture updated");
        } catch ({ response }) {
          toast.dismiss(loadingToast);
          e.target.removeAttribute("disabled");
          toast.error(
            response?.data?.error || "Failed to update profile picture"
          );
          console.error("Profile image update error:", response?.data);
        }
      } else {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error("Image upload failed");
      }
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    let form = new FormData(editProfile.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    let {
      username,
      bio,
      youtube,
      facebook,
      twitter,
      github,
      instagram,
      website,
    } = formData;
    if (username.length < 3) {
      return toast.error("usrname must at least be up to 3 characters");
    }
    if (bio.length > bioLimit) {
      return toast.error(`Bio should not be more than ${bioLimit} `);
    }
    let loadingToast = toast.loading("Updating...");
    e.target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
        {
          username,
          bio,
          social_links: {
            youtube,
            facebook,
            twitter,
            github,
            instagram,
            website,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        if (userAuth.username != data.username) {
          let newUserAuth = { ...userAuth, username: data.username };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile Updated");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfile}>
          <h1 className='max-md:hidden '>Edit Profile</h1>

          <div className='flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10'>
            <div className='max-lg:center mb-5'>
              <label
                htmlFor='uploader'
                id='profileImgLabel'
                className='relative block w-48 h-48 bg-grey rounded-full overflow-hidden'
              >
                <div className='w-full h-full absolute left-0 flex items-center justify-center text-white bg-black/40 opacity-0 hover:opacity-100 cursor-pointer'>
                  Upload image
                </div>
                <img src={profile_img} ref={profileImg} />
              </label>

              <input
                type='file'
                id='uploader'
                accept='.jpeg,.png,.jpg'
                hidden
                onChange={handleImagePreview}
              />
              <button
                className='btn-light mt-5 max-lg:center lg:w-full px-10'
                onClick={handleImageUpload}
              >
                Upload
              </button>
            </div>
            <div className='w-full'>
              <div className='grid grid-cols-1 md:grid-cols-2 md:gap-5'>
                <InputBox
                  name='fullname '
                  type='text'
                  value={fullname}
                  placeholder={"Fullname"}
                  disable={true}
                  icon='fi-rr-user'
                />
                <InputBox
                  name='Email'
                  type='email'
                  value={email}
                  placeholder={"Email"}
                  disable={true}
                  icon='fi-rr-envelope'
                />
              </div>
              <InputBox
                name='username'
                type='text'
                value={profile_username}
                placeholder={"Username"}
                icon='fi-rr-at'
              />
              <p>
                Username will use to search user and be visible to all users
              </p>

              <textarea
                onChange={handleCharactersChange}
                name='bio'
                maxLength={bioLimit}
                defaultValue={bio}
                className='input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5 '
                placeholder='Bio'
              ></textarea>
              <p className='mt-1 text-dark-grey'>
                {charactersLeft} characters Left
              </p>
              <p className='my-6 text-dark-grey'>Add social handles below</p>

              <div className='md:grid md:grid-cols-2 gap-x-6'>
                {Object.keys(social_links).map((key, i) => {
                  let link = social_links[key];

                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type={"text"}
                      value={link}
                      placeholder={"https://"}
                      icon={
                        "fi " +
                        (key != "website"
                          ? "fi-brands-" + key
                          : "fi-rr-globe") +
                        " text-2xl hover:text-black"
                      }
                    />
                  );
                })}
              </div>

              <button
                className='btn-dark w-auto px-10'
                type='submit'
                onClick={handleSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
