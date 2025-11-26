import React, { useContext, useState } from "react";
import {
  ArrowLeft,
  Image,
  FileImage,
  BarChart2,
  Smile,
  Calendar,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { userContext } from "../App";
import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import axios from "axios";

export default function TweetComposer() {
  const [tweetText, setTweetText] = useState("");
  const {
    userAuth: { access_token, profile_img },
  } = useContext(userContext);
  const [replyPermission, setReplyPermission] = useState("Everyone");
  const [showReplyMenu, setShowReplyMenu] = useState(false);
  const [imageurl, setImageUrl] = useState("");
  const [posting, setPosting] = useState(false);

  const maxChars = 300;
  const progress = (tweetText.length / maxChars) * 100;
  const charsRemaining = maxChars - tweetText.length;

  const navigate = useNavigate();

  const getProgressColor = () => {
    if (charsRemaining <= 0) return "#f91880";
    if (charsRemaining <= 20) return "#ffd400";
    return "#1d9bf0";
  };
  const handlePicUpload = async (e) => {
    const toastId = toast.loading("Submitting your photo...");

    try {
      let img = e.target.files[0];
      if (!img) {
        console.log("No file selected");
        return;
      }
      const formData = new FormData();
      formData.append("image", img);

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setImageUrl(data.imageUrl);
      toast.dismiss(toastId);
      toast.success("Uploaded");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.dismiss(toastId);
      toast.error("Image upload failed:");
    }
  };
  // Post Tweet
  const handlePostTweet = async () => {
    if (!tweetText.trim() && !imageurl) return;

    setPosting(true);
    const toastId = toast.loading("Posting tweet...");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/create-tweet`,
        {
          text: tweetText.trim(),
          images: imageurl ? [imageurl] : [],
          draft: false,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      toast.dismiss(toastId);
      toast.success("Tweet posted!");
      navigate("/");
      // Reset
      setTweetText("");
      setImageUrl("");
    } catch (err) {
      console.error("Tweet post failed:", err);
      toast.dismiss(toastId);
      toast.error("Failed to post tweet");
    } finally {
      setPosting(false);
    }
  };
  return (
    <div className='min-h-screen bg-white text-black flex flex-col max-w-2xl mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200'>
        <Link to='/'>
          <button className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
            <ArrowLeft size={20} className='text-black' />
          </button>
        </Link>
        <button className='text-black font-bold text-sm transition-colors'>
          Drafts
        </button>
      </div>
      {/* Main Content */}
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='flex gap-3'>
          <img
            src={profile_img}
            alt='Your avatar'
            className='w-12 h-12 rounded-full flex-shrink-0'
          />
          {/* Text Area + Image Preview */}
          <div className='flex-1 min-w-0'>
            {/* Reply Permission Button */}
            <button
              onClick={() => setShowReplyMenu(!showReplyMenu)}
              className='flex items-center gap-1 text-black text-sm font-bold mb-3 hover:bg-blue-50 px-2 py-1 rounded-full transition-colors relative'
            >
              <span>{replyPermission}</span>
              <ChevronDown size={14} />
            </button>

            {/* Text Area */}
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              placeholder="What's happening?"
              className='w-full bg-transparent h-fit text-xl outline-none resize-none placeholder-gray-500 text-black'
              style={{ minHeight: "100px" }}
              maxLength={300}
            />

            {/* Image Preview */}
            {imageurl && (
              <div className='mt-3 relative w-full max-h-80 rounded-xl overflow-hidden'>
                <img
                  src={imageurl}
                  alt='Tweet preview'
                  className='w-full h-full object-cover rounded-xl'
                />
                {/* Optional: Add a remove button */}
                <button
                  onClick={() => setImageUrl("")}
                  className='absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70'
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Toolbar */}
      <div className='border-t border-gray-200 px-4 py-2'>
        <div className='flex items-center justify-between'>
          {/* Media Buttons */}
          <div className='flex items-center gap-1'>
            <label className='p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors'>
              <Image size={20} strokeWidth={2} />
              <input
                type='file'
                id='uploadBanner'
                accept='.png,.jpg,.jpeg'
                hidden
                onChange={handlePicUpload}
              />
            </label>
            {/* <button className="p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors">
              <FileImage size={20} strokeWidth={2} />
            </button> */}
            <button className='p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors'>
              <BarChart2 size={20} strokeWidth={2} />
            </button>
            <button className='p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors'>
              <Calendar size={20} strokeWidth={2} />
            </button>
            <button className='p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors'>
              <MapPin size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Character Count and Post Button */}
          <div className='flex items-center gap-3'>
            {tweetText.length > 0 && (
              <div className='flex items-center gap-2'>
                {charsRemaining >= 0 ? (
                  <>
                    <svg
                      width='20'
                      height='20'
                      className='transform -rotate-90'
                    >
                      <circle
                        cx='10'
                        cy='10'
                        r='8'
                        stroke='#e1e8ed'
                        strokeWidth='2'
                        fill='none'
                      />
                      <circle
                        cx='10'
                        cy='10'
                        r='8'
                        stroke={getProgressColor()}
                        strokeWidth='2'
                        fill='none'
                        strokeDasharray={`${2 * Math.PI * 8}`}
                        strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress / 100)}`}
                        strokeLinecap='round'
                      />
                    </svg>
                    {charsRemaining <= 20 && (
                      <span
                        className={`text-xs font-semibold ${charsRemaining <= 0 ? "text-red-500" : "text-gray-600"}`}
                      >
                        {charsRemaining}
                      </span>
                    )}
                  </>
                ) : (
                  <span className='text-xs text-red-500 font-bold'>
                    {charsRemaining}
                  </span>
                )}
              </div>
            )}

            <button
              disabled={
                (tweetText.trim().length === 0 && !imageurl) ||
                posting ||
                charsRemaining < 0
              }
              onClick={handlePostTweet}
              className='bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed font-bold px-5 py-2 rounded-full text-white transition-colors text-sm'
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
