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
} from "lucide-react";
import { userContext } from "../App";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/loader.component";

const Ranking = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  let navigate = useNavigate();
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
      } finally {
        setLoading(false);
      }
    };
    getAllTime();
    getTopRanked();
  }, []);

  // Mock data for rankings
  const topRanked = [
    {
      id: 1,
      name: "Sarah M.",
      votes: 1247,
      image:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.8KMKyFfNAwyrVf3OXuD2qgHaLH%26pid%3DApi&f=1&ipt=0c16a61d96e9a918ea09219d1246b08cd0064f0a9f6bbb70e80cec9ea6852cdd&ipo=images",
    },
    {
      id: 2,
      name: "Alex K.",
      votes: 1156,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Jamie L.",
      votes: 987,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    },
  ];

  const recentSubmissions = [
    {
      id: 4,
      name: "Mike R.",
      votes: 156,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: 5,
      name: "Emma T.",
      votes: 89,
      image:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: 6,
      name: "David H.",
      votes: 67,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
    },
  ];

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
      // Handle submission logic here
      const imageUrl = await UploadImage(selectedFile);
      console.log("Image URL is gotten here:", imageUrl);

      if (!imageUrl) {
        return;
      }
      toast.success("Photo submitted successfully!");
      // Reset the form
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

    // Calculate days until next Monday (1)
    const daysUntilMonday = (8 - day) % 7 || 7;
    const nextMonday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilMonday,
      0,
      0,
      0
    );
    // const timeDiff = nextMonday - now;

    const diffMs = nextMonday - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${diffDays}`;
  };
  if (loading) {
    return <Loader />;
  }
  return (
    <div className='min-h-screen bg-white'>
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4'>
            Weekly Campus Ranking
          </h1>
          <p className='text-lg text-black max-w-2xl mx-auto'>
            Share your best photo and compete with fellow students for the top
            spot on campus!
          </p>
          <div className='flex justify-center items-center gap-6 mt-6 text-sm text-black'>
            <div className='flex items-center gap-2'>
              <Users className='w-4 h-4' />
              <span>20+ participants</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='w-4 h-4' />
              <span> {GetCountDownToMonday()} days left</span>
            </div>
            <div className='flex items-center gap-2'>
              <TrendingUp className='w-4 h-4' />
              <span>Hot competition</span>
            </div>
          </div>
          {isAdmin && (
            <Link to={"/admin"} className='text-red'>
              Admin
            </Link>
          )}
        </div>

        {/* Current Top 3 */}
        <div className='mb-12'>
          <h2 className='text-2xl font-bold text-center mb-8 text-dark-grey'>
            Current Leaders
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
            {winners.map((winner, index) => (
              <Link
                key={winner._id}
                to={`/user/${winner.posted_by?.personal_info?.username}`}
              >
                <div
                  key={winner._id}
                  className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    index === 0 ? "md:scale-110 ring-4 ring-yellow-200" : ""
                  }`}
                >
                  <div className='aspect-square overflow-hidden'>
                    <img
                      src={winner.imageurl}
                      alt={winner.rank}
                      className='w-full h-full object-cover transition-transform duration-300 hover:scale-110'
                    />
                  </div>
                  <div className='absolute top-4 left-4'>
                    {getRankIcon(index + 1)}
                  </div>
                  <div className='p-6 text-center'>
                    <h3 className='font-bold text-lg text-black mb-2'>
                      {winner.posted_by?.personal_info?.fullname}
                    </h3>
                    <div className='flex items-center justify-center gap-2'>
                      <Star className='w-4 h-4 text-yellow-500 fill-current' />
                      <span className='font-semibold text-black'>
                        {winner.rank} votes
                      </span>
                    </div>
                    {index === 0 && (
                      <div className='mt-2 text-sm text-yellow-600 font-medium'>
                        👑 Current Champion
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className='mb-12'>
          <h2 className='text-2xl font-bold text-center mb-8 text-dark-grey'>
            Past Winners
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto'>
            {allTime.map((winner) => (
               <Link
                key={winner._id}
                to={`/user/${winner.posted_by?.personal_info?.username}`}
              >
              <div
                key={winner._id}
                className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300'
              >
                <div className='aspect-square overflow-hidden'>
                  <img
                    src={winner.imageurl}
                    alt={winner.rank}
                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                  />
                </div>
                <div className='p-3 text-center'>
                  <h4 className='font-medium text-sm text-black truncate'>
                   {winner.posted_by?.personal_info?.fullname}
                  </h4>
                  <p className='text-xs text-black'>{winner.rank} votes</p>
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
              {/* File Upload Area */}
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
                        alt='Preview'
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
                        PNG, JPG, GIF up to 10MB
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

              {/* Submit Button */}
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

            {/* Competition Rules */}
            <div className='mt-8 p-4 bg-gray-50 rounded-xl'>
              <h3 className='font-semibold text-gray-800 mb-2'>
                Competition Rules:
              </h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• One submission per week per student</li>
                <li>• Photos must be appropriate for campus community</li>
                <li>• Voting closes every Sunday at midnight</li>
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
