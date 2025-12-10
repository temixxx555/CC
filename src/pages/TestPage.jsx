import React, { useContext, useState } from "react";
import {
  ArrowLeft,
  Image,
  BarChart2,
  Calendar,
  MapPin,
  X,
  Plus,
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
  const [imageurl, setImageUrl] = useState("");
  const [posting, setPosting] = useState(false);

  // Poll state
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState(1440); // in minutes (default 1 day)

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

  // Poll functions
  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleRemovePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const togglePoll = () => {
    if (showPoll) {
      // Remove poll
      setShowPoll(false);
      setPollOptions(["", ""]);
      setPollDuration(1440);
    } else {
      // Add poll (disable image)
      setShowPoll(true);
      setImageUrl("");
    }
  };

  // Validate poll before posting
  const isPollValid = () => {
    if (!showPoll) return true;
    
    const filledOptions = pollOptions.filter(opt => opt.trim().length > 0);
    return filledOptions.length >= 2;
  };

  // Post Tweet
  const handlePostTweet = async () => {
    if (tweetText.trim().length === 0) {
      return toast.error("Write a text before posting");
    }

    if (showPoll && !isPollValid()) {
      return toast.error("Please add at least 2 poll options");
    }

    setPosting(true);
    const toastId = toast.loading("Posting tweet...");

    try {
      const payload = {
        text: tweetText.trim(),
        images: imageurl ? [imageurl] : [],
        draft: false,
      };

      // Add poll data if present
      if (showPoll && isPollValid()) {
        payload.poll = {
          options: pollOptions.filter(opt => opt.trim().length > 0),
          duration: pollDuration, // in minutes
        };
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/create-tweet`,
        payload,
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
      setShowPoll(false);
      setPollOptions(["", ""]);
      setPollDuration(1440);
    } catch (err) {
      console.error("Tweet post failed:", err);
      toast.dismiss(toastId);
      toast.error("Failed to post tweet");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className='min-h-screen bg-white text-black flex flex-col max-w-2xl mx-auto border-l border-r border-grey'>
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
          
          <div className='flex-1 min-w-0'>
            {/* Text Area */}
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              placeholder="What's happening?"
              className='w-full bg-transparent text-xl outline-none resize-none placeholder-gray-500 text-black mb-3'
              style={{ minHeight: "100px" }}
              maxLength={300}
            />

            {/* Image Preview */}
            {imageurl && !showPoll && (
              <div className='mt-3 relative w-full max-h-80 rounded-xl overflow-hidden border border-gray-200'>
                <img
                  src={imageurl}
                  alt='Tweet preview'
                  className='w-full h-full object-cover rounded-xl'
                />
                <button
                  onClick={() => setImageUrl("")}
                  className='absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition'
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Poll Section */}
            {showPoll && (
              <div className='border border-gray-300 rounded-2xl p-4 mt-3'>
                <div className='space-y-3'>
                  {pollOptions.map((option, index) => (
                    <div key={index} className='flex gap-2 items-center'>
                      <input
                        type='text'
                        value={option}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        placeholder={`Choice ${index + 1}${index < 2 ? '' : ' (optional)'}`}
                        maxLength={25}
                        className='flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-blue-500 transition'
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() => handleRemovePollOption(index)}
                          className='p-2 hover:bg-gray-100 rounded-full transition'
                        >
                          <X size={18} className='text-gray-600' />
                        </button>
                      )}
                    </div>
                  ))}

                  {pollOptions.length < 4 && (
                    <button
                      onClick={handleAddPollOption}
                      className='flex items-center gap-2 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-full transition text-sm font-medium'
                    >
                      <Plus size={18} />
                      Add choice
                    </button>
                  )}

                  {/* Poll Duration */}
                  <div className='pt-3 border-t border-gray-200'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Poll length
                    </label>
                    <select
                      value={pollDuration}
                      onChange={(e) => setPollDuration(Number(e.target.value))}
                      className='px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition'
                    >
                      <option value={60}>1 hour</option>
                      <option value={360}>6 hours</option>
                      <option value={720}>12 hours</option>
                      <option value={1440}>1 day</option>
                      <option value={4320}>3 days</option>
                      <option value={10080}>7 days</option>
                    </select>
                  </div>

                  {/* Remove Poll */}
                  <button
                    onClick={togglePoll}
                    className='text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition text-sm font-medium'
                  >
                    Remove poll
                  </button>
                </div>
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
            <label className={`p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors ${showPoll ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <Image size={20} strokeWidth={2} />
              <input
                type='file'
                accept='.png,.jpg,.jpeg'
                hidden
                onChange={handlePicUpload}
                disabled={showPoll}
              />
            </label>
            
            <button 
              onClick={togglePoll}
              disabled={imageurl}
              className={`p-2.5 hover:bg-blue-50 rounded-full transition-colors ${showPoll ? 'text-blue-500 bg-blue-50' : 'text-blue-500'} ${imageurl ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
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
                    <svg width='20' height='20' className='transform -rotate-90'>
                      <circle cx='10' cy='10' r='8' stroke='#e1e8ed' strokeWidth='2' fill='none' />
                      <circle
                        cx='10' cy='10' r='8'
                        stroke={getProgressColor()}
                        strokeWidth='2' fill='none'
                        strokeDasharray={`${2 * Math.PI * 8}`}
                        strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress / 100)}`}
                        strokeLinecap='round'
                      />
                    </svg>
                    {charsRemaining <= 20 && (
                      <span className={`text-xs font-semibold ${charsRemaining <= 0 ? "text-red-500" : "text-gray-600"}`}>
                        {charsRemaining}
                      </span>
                    )}
                  </>
                ) : (
                  <span className='text-xs text-red-500 font-bold'>{charsRemaining}</span>
                )}
              </div>
            )}

            <button
              disabled={
                (tweetText.trim().length === 0) ||
                posting ||
                charsRemaining < 0 ||
                (showPoll && !isPollValid())
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






// import { Link } from "react-router-dom";
// import { getDay } from "../common/date";
// import verifiedBadge from "../imgs/verified.png";

// // Test data with images
// const TEST_LOST_FOUND_ITEMS = [
//   {
//     id: "1",
//     title: "Lost: Blue Nike Backpack",
//     description: "Lost near the library on 3rd floor. Contains textbooks and a laptop charger.",
//     image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
//     status: "lost",
//     category: "Bags",
//     location: "Library - 3rd Floor",
//     postedBy: {
//       fullname: "John Admin",
//       username: "johnadmin",
//       profile_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
//       isVerified: true,
//     },
//     contactInfo: "john@school.edu",
//     publishedAt: new Date().toISOString(),
//   },
//   {
//     id: "2",
//     title: "Found: iPhone 13 Pro",
//     description: "Found in the cafeteria near table 5. Black case with stickers.",
//     image: "https://images.unsplash.com/photo-1592286927505-2fd7794c8061?w=400",
//     status: "found",
//     category: "Electronics",
//     location: "Cafeteria",
//     postedBy: {
//       fullname: "Sarah Admin",
//       username: "sarahadmin",
//       profile_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
//       isVerified: true,
//     },
//     contactInfo: "security@school.edu",
//     publishedAt: new Date(Date.now() - 86400000).toISOString(),
//   },
//   {
//     id: "3",
//     title: "Lost: Silver Ring with Blue Stone",
//     description: "Sentimental value. Lost in the gym locker room.",
//     image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
//     status: "lost",
//     category: "Jewelry",
//     location: "Gym - Locker Room",
//     postedBy: {
//       fullname: "Mike Admin",
//       username: "mikeadmin",
//       profile_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
//       isVerified: true,
//     },
//     contactInfo: "mike@school.edu",
//     publishedAt: new Date(Date.now() - 172800000).toISOString(),
//   },
//   {
//     id: "4",
//     title: "Found: Red Water Bottle (Hydroflask)",
//     description: "Found on bench near the basketball court. Has dents on the bottom.",
//     image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
//     status: "found",
//     category: "Water Bottles",
//     location: "Basketball Court",
//     postedBy: {
//       fullname: "Emily Admin",
//       username: "emilyadmin",
//       profile_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
//       isVerified: true,
//     },
//     contactInfo: "lost-found@school.edu",
//     publishedAt: new Date(Date.now() - 259200000).toISOString(),
//   },
//   {
//     id: "5",
//     title: "Lost: Brown Leather Wallet",
//     description: "Contains ID cards and credit cards. Lost in parking lot B.",
//     image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400",
//     status: "lost",
//     category: "Wallets",
//     location: "Parking Lot B",
//     postedBy: {
//       fullname: "Admin Team",
//       username: "adminteam",
//       profile_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
//       isVerified: true,
//     },
//     contactInfo: "security@school.edu",
//     publishedAt: new Date(Date.now() - 345600000).toISOString(),
//   },
// ];

// const LostAndFoundCard = ({ item, index }) => {
//   const {
//     id,
//     title,
//     description,
//     image,
//     status,
//     category,
//     location,
//     postedBy: { fullname, username, profile_img, isVerified },
//     contactInfo,
//     publishedAt,
//   } = item;

//   const isLost = status === "lost";

//   return (
//     <Link
//       to={`/lost-found/${id}`}
//       className="block group bg-white border border-grey rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
//     >
//       {/* Image Section */}
//       <div className="relative h-48 overflow-hidden bg-gray-100">
//         <img
//           src={image}
//           alt={title}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//         />
        
//         {/* Status Badge */}
//         <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
//           isLost 
//             ? "bg-red text-white" 
//             : "bg-green-500 text-white"
//         }`}>
//           {isLost ? "🔍 LOST" : "✓ FOUND"}
//         </div>

//         {/* Category Badge */}
//         <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium">
//           {category}
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="p-4">
//         {/* Title */}
//         <h2 className="text-lg font-bold text-dark-grey mb-2 line-clamp-1 group-hover:text-black transition-colors">
//           {title}
//         </h2>

//         {/* Description */}
//         <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
//           {description}
//         </p>

//         {/* Location */}
//         <div className="flex items-center gap-2 text-sm text-dark-grey mb-3">
//           <i className="fi fi-rr-marker text-red"></i>
//           <span className="font-medium">{location}</span>
//         </div>

//         {/* Footer - Admin Info */}
//         <div className="flex items-center justify-between pt-3 border-t border-grey">
//           <div className="flex items-center gap-2">
//             <img
//               src={profile_img}
//               alt={fullname}
//               className="w-7 h-7 rounded-full object-cover"
//             />
//             <div className="flex items-center gap-1.5">
//               <span className="text-xs font-medium text-dark-grey">{fullname}</span>
//               {isVerified && (
//                 <img src={verifiedBadge} alt="verified" className="w-3.5 h-3.5" />
//               )}
//             </div>
//           </div>

//           <span className="text-xs text-gray-500">{getDay(publishedAt)}</span>
//         </div>

//         {/* Contact Info */}
//         <div className="mt-3 pt-3 border-t border-grey">
//           <p className="text-xs text-gray-500">
//             <span className="font-semibold text-dark-grey">Contact:</span> {contactInfo}
//           </p>
//         </div>
//       </div>
//     </Link>
//   );
// };

// // Main Component to Display Lost & Found Items
// const LostAndFoundSection = () => {
//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold text-dark-grey mb-2">Lost & Found</h1>
//         <p className="text-gray-600">
//           Help reunite lost items with their owners or claim found items
//         </p>
//       </div>

//       {/* Filter Tabs */}
//       <div className="flex gap-4 mb-6 border-b border-grey">
//         <button className="px-4 py-2 font-semibold text-red border-b-2 border-red">
//           All Items ({TEST_LOST_FOUND_ITEMS.length})
//         </button>
//         <button className="px-4 py-2 font-semibold text-gray-500 hover:text-dark-grey transition">
//           Lost ({TEST_LOST_FOUND_ITEMS.filter(i => i.status === "lost").length})
//         </button>
//         <button className="px-4 py-2 font-semibold text-gray-500 hover:text-dark-grey transition">
//           Found ({TEST_LOST_FOUND_ITEMS.filter(i => i.status === "found").length})
//         </button>
//       </div>

//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {TEST_LOST_FOUND_ITEMS.map((item, index) => (
//           <LostAndFoundCard key={item.id} item={item} index={index} />
//         ))}
//       </div>

//       {/* Empty State (hidden when items exist) */}
//       {TEST_LOST_FOUND_ITEMS.length === 0 && (
//         <div className="text-center py-20">
//           <i className="fi fi-rr-search text-6xl text-gray-300 mb-4"></i>
//           <h3 className="text-xl font-semibold text-gray-600 mb-2">
//             No items reported yet
//           </h3>
//           <p className="text-gray-500">
//             Lost or found something? Contact an admin to post it here.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LostAndFoundSection;