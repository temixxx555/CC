import React, { useContext, useEffect, useState } from "react";
import {
  Upload,
  Trophy,
  Medal,
  Award,
  Star,
  Users,
  Clock,
  TrendingUp,
  Camera,
  Sparkles,
  Crown,
} from "lucide-react";
import { userContext } from "../App";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/loader.component";
import lightdefaultBanner from "../imgs/blog banner light.png";
const Ranking = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();
  const { userAuth } = useContext(userContext);
  const { access_token } = userAuth || {};
  const isAdmin = userAuth?.userId === "682c6ce4e7ba63ef44ad05a9";
  const [winners, setWinners] = useState([]);
  const [allTime, setAllTime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTopRanked = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/get-winners`
        );
        setWinners(data.winners || []);
        console.log("winners", data.winners);
      } catch (error) {
        console.error("Error fetching top ranked data:", error);
      } finally {
        setLoading(false);
      }
    };
    const getAllTime = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/all-time-winners`
        );
        setAllTime(data.winners || []);
        console.log("Top all data:", data);
      } catch (error) {
        console.error("Error fetching top ranked data:", error);
      }
    };
    getAllTime();
    getTopRanked();
  }, []);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const UploadImage = async (img) => {
    try {
      const formData = new FormData();
      formData.append("image", img);
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/upload-image-competition`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      return data.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error?.response?.data?.error || "Image upload failed");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!access_token) {
      navigate("/signin");
      toast.error("Please sign in to submit your photo.");
      return;
    }
    if (selectedFile) {
      const toastId = toast.loading("Submitting your photo...");
      const imageUrl = await UploadImage(selectedFile);
      if (!imageUrl) {
        toast.dismiss(toastId);
        return;
      }
      toast.dismiss(toastId);
      toast.success("Photo submitted successfully!");
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className='w-8 h-8 text-yellow-500' />;
      case 2:
        return <Medal className='w-8 h-8 text-gray-400' />;
      case 3:
        return <Award className='w-8 h-8 text-amber-600' />;
      default:
        return <Star className='w-6 h-6 text-blue-500' />;
    }
  };

  const GetCountDownToMonday = () => {
    const now = new Date();
    const day = now.getDay();
    const daysUntilMonday = (8 - day) % 7 || 7;
    const nextMonday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilMonday,
      0,
      0,
      0
    );
    const diffMs = nextMonday - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays}`;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* Header */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center gap-3 mb-6'>
            <div className='p-3 bg-dark-grey rounded-2xl shadow-lg'>
              <Camera className='w-8 h-8 text-white' />
            </div>
            <h1 className='text-[20px] md:text-[50px]  font-black bg-dark-grey bg-clip-text text-transparent'>
              Face of the Week
            </h1>
            <Sparkles className='w-8 h-8 text-yellow-500 animate-pulse' />
          </div>

          <p className='text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mb-8'>
            Are you the{" "}
            <span className='font-bold text-indigo-600'>main character</span> or
            just{" "}
            <span className='font-bold text-slate-400'>background noise</span>?
            Post and find out.
          </p>

          <div className='flex flex-wrap justify-center items-center gap-8 text-slate-600'>
            <div className='hidden md:flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-md'>
              <div className='p-2 bg-indigo-100 rounded-full'>
                <Users className='w-5 h-5 text-indigo-600' />
              </div>
              <span className=' font-semibold'>20+ participants</span>
            </div>
            <div className='flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-md'>
              <div className='p-2 bg-orange-100 rounded-full'>
                <Clock className='w-5 h-5 text-orange-600' />
              </div>
              <span className='font-semibold'>
                {GetCountDownToMonday()} days left
              </span>
            </div>
            <div className='hidden md:flex  items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-md'>
              <div className='p-2 bg-pink-100 rounded-full'>
                <TrendingUp className='w-5 h-5 text-pink-600' />
              </div>
              <span className='font-semibold'>Hot competition</span>
            </div>
          </div>

          {isAdmin && (
            <div className='mt-6'>
              <Link
                to='/admin'
                className='inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-black px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
              >
                <Crown className='w-5 h-5' />
                Admin Panel
              </Link>
            </div>
          )}
        </div>

        {/* Current Leaders */}

        <div className='mb-12'>
          <h2 className='text-2xl font-bold text-center mb-8 text-black'>
            Current Leaders
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
            {winners.length === 0 ? (
              <div className='relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl'>
                <div className='aspect-square overflow-hidden flex items-center justify-center'>
                  <img
                    src={lightdefaultBanner}
                    alt='Default submission placeholder'
                    className='max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-110'
                  />
                </div>
                <div className='absolute top-4 left-4'>
                  {getRankIcon(1)} {/* Default to rank 1 for placeholder */}
                </div>
                <div className='p-6 text-center'>
                  <h3 className='font-bold text-lg text-black mb-2'>
                    No Leaders Yet
                  </h3>
                  <div className='flex items-center justify-center gap-2'>
                    <span className='font-semibold text-black'>
                      Be the first to lead!
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              winners.map(
                (winner, index) =>
                  winner.rank < 4 && (
                    <Link
                    key={winner._id}
                    to={`/user/${winner.posted_by?.personal_info?.username}`}
                  >
                    <div
                      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                        winner.rank === 1
                          ? "md:scale-110 ring-4 ring-yellow-200"
                          : ""
                      }`}
                    >
                      <div className='aspect-square overflow-hidden'>
                        <img
                          src={winner.imageurl}
                          alt={`${winner.posted_by?.personal_info?.fullname}'s submission`}
                          className='w-full h-full object-cover transition-transform duration-300 hover:scale-110'
                        />
                      </div>
                      <div className='absolute top-4 left-4'>
                        {getRankIcon(winner.rank)}
                      </div>
                      <div className='p-6 text-center'>
                        <h3 className='font-bold text-lg text-black mb-2'>
                          {winner.posted_by?.personal_info?.fullname}
                        </h3>
                        <div className='flex items-center justify-center gap-2'>
                          <span className='font-semibold text-black'>
                            #{winner.rank} rank
                          </span>
                        </div>
                        {winner.rank === 1 && (
                          <div className='mt-2 text-sm text-yellow-600 font-medium'>
                            👑 Current Champion
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                  )
              )
            )}
          </div>
        </div>

        {/* Background Noise */}
        <div className='mb-12'>
          <h2 className='text-2xl font-bold text-center mb-8 text-black'>
            Background Noise
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
            {winners.length === 0 ? (
              <div className='relative bg-gray-50 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl '>
                <div className='aspect-square overflow-hidden flex items-center justify-center'>
                  <img
                    src={lightdefaultBanner}
                    alt='Default submission placeholder'
                    className='max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-110'
                  />
                </div>
                <div className='absolute top-4 left-4'>
                  {getRankIcon(8)} {/* Use rank 4 to match Background Noise */}
                </div>
                <div className='p-6 text-center bg-white'>
                  <h3 className='font-bold text-lg text-black mb-2'>
                    No Participants Yet
                  </h3>
                  <div className='flex items-center justify-center gap-2'>
                    <Star className='w-4 h-4 text-yellow-500 fill-current' />
                    <span className='font-semibold text-black'>
                      Be the first! 😂😂
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              winners.map(
                (winner) =>
                  winner.rank === 4 && (
                 <Link
                    key={winner._id}
                    to={`/user/${winner.posted_by?.personal_info?.username}`}
                  >
                    <div className="relative bg-gray-50 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={winner.imageurl  || lightdefaultBanner}
                          alt={`${winner.posted_by?.personal_info?.fullname}'s submission`}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                      <div className="absolute top-4 left-4">
                        {getRankIcon(winner.rank)}
                      </div>
                      <div className="p-6 text-center bg-white">
                        <h3 className="font-bold text-lg text-black mb-2">
                          {winner.posted_by?.personal_info?.fullname}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-black">
                            Majority votes 😂😂
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  )
              )
            )}
          </div>
        </div>

        {/* Past Winners */}
        <div className='mb-12'>
          <h2 className='text-2xl font-bold text-center mb-8 text-black'>
            Past Winners
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto'>
            {allTime.length == 0 && <p>yellow</p>}
            {allTime.map((winner) => (
              <Link
                key={winner._id}
                to={`/user/${winner.posted_by?.personal_info?.username}`}
              >
                <div className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300'>
                  <div className='aspect-square overflow-hidden'>
                    <img
                      src={winner.imageurl}
                      alt={`${winner.posted_by?.personal_info?.fullname}'s past winning submission`}
                      className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                    />
                  </div>
                  <div className='p-3 text-center'>
                    <h4 className='font-medium text-sm text-black truncate'>
                      {winner.posted_by?.personal_info?.fullname}
                    </h4>
                    <p className='text-xs text-black'>{winner.votes} votes</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Photo Submission */}
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold mb-6 text-center text-black'>
              Submit Your Photo
            </h2>
            <div className='space-y-6'>
              <div
                className={`relative border-3 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : previewUrl
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {previewUrl ? (
                  <div className='space-y-4'>
                    <div className='mx-auto w-32 h-32 rounded-xl overflow-hidden'>
                      <img
                        src={previewUrl}
                        alt='Preview of your submission'
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <p className='text-green-600 font-medium'>
                      Ready to submit!
                    </p>
                    <button
                      type='button'
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className='text-sm text-gray-500 hover:text-gray-700 underline'
                    >
                      Choose different photo
                    </button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <Upload className='w-12 h-12 text-gray-400 mx-auto' />
                    <div>
                      <p className='text-gray-600 mb-2'>
                        <span className='font-semibold'>Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className='text-sm text-gray-500'>
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                )}
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />
              </div>
              <button
                type='submit'
                onClick={handleSubmit}
                disabled={!selectedFile}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                  selectedFile
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {selectedFile
                  ? "Submit to Competition"
                  : "Select a photo first"}
              </button>
            </div>
            <div className='mt-8 p-4 bg-gray-50 rounded-xl'>
              <h3 className='font-semibold text-gray-800 mb-2'>
                Competition Rules:
              </h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• One submission per week per student</li>
                <li>• Photos must be appropriate for campus community</li>
                <li>
                  • Background noise is a playful suggestion to be the best
                </li>
                <li>• Ai and admins rank the pictures to be fair </li>
                <li>• Winners announced every Monday</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
