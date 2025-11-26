import React, { useState } from 'react';
import { ArrowLeft, Image, FileImage, BarChart2, Smile, Calendar, MapPin, ChevronDown } from 'lucide-react';

export default function TweetComposer() {
  const [tweetText, setTweetText] = useState('');
  const [replyPermission, setReplyPermission] = useState('Everyone');
  const [showReplyMenu, setShowReplyMenu] = useState(false);

  const maxChars = 280;
  const progress = (tweetText.length / maxChars) * 100;
  const charsRemaining = maxChars - tweetText.length;

  const getProgressColor = () => {
    if (charsRemaining <= 0) return '#f91880';
    if (charsRemaining <= 20) return '#ffd400';
    return '#1d9bf0';
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-black" />
        </button>
        <button className="text-blue-500 hover:text-blue-600 font-bold text-sm transition-colors">
          Drafts
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex gap-3">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" 
            alt="Your avatar" 
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            {/* Reply Permission Button */}
            <button 
              onClick={() => setShowReplyMenu(!showReplyMenu)}
              className="flex items-center gap-1 text-blue-500 text-sm font-bold mb-3 hover:bg-blue-50 px-2 py-1 rounded-full transition-colors relative"
            >
              <span>{replyPermission}</span>
              <ChevronDown size={14} />
              
              {showReplyMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl py-3 w-80 z-10">
                  <div className="px-4 pb-3">
                    <h3 className="font-bold text-xl text-black">Who can reply?</h3>
                    <p className="text-gray-600 text-sm mt-1">Choose who can reply to this post.</p>
                  </div>
                  <div>
                    {['Everyone', 'Accounts you follow', 'Only accounts you mention'].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setReplyPermission(option);
                          setShowReplyMenu(false);
                        }}
                        className="w-full px-4 py-3 hover:bg-gray-100 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            replyPermission === option ? 'border-blue-500' : 'border-gray-400'
                          }`}>
                            {replyPermission === option && (
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                          <span className="text-black font-semibold">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </button>

            {/* Text Area */}
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent text-xl outline-none resize-none placeholder-gray-500 text-black"
              style={{ minHeight: '150px' }}
              maxLength={280}
            />
          </div>
        </div>

        {/* Reply Restriction Info */}
        <div className="flex items-center gap-1 mt-4 ml-14 text-blue-500 text-sm">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 1.75C6.34 1.75 1.75 6.34 1.75 12S6.34 22.25 12 22.25 22.25 17.66 22.25 12 17.66 1.75 12 1.75zm-.25 10.48L10.5 17.5l-2-1.5v-3.5L7.5 9 5.03 7.59c1.42-2.24 3.89-3.75 6.72-3.84L11 6l2 .5L13.5 9l1 4.5-1.75.48z"/>
          </svg>
          <span className="font-bold">{replyPermission} can reply</span>
        </div>
      </div>

      {/* Footer Toolbar */}
      <div className="border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Media Buttons */}
          <div className="flex items-center gap-1">
            <button className="p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors">
              <Image size={20} strokeWidth={2} />
            </button>
            <button className="p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors">
              <FileImage size={20} strokeWidth={2} />
            </button>
            <button className="p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors">
              <BarChart2 size={20} strokeWidth={2} />
            </button>
            <button className="p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors">
              <Smile size={20} strokeWidth={2} />
            </button>
            <button className="p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors">
              <Calendar size={20} strokeWidth={2} />
            </button>
            <button className="p-2.5 hover:bg-blue-50 rounded-full text-blue-500 transition-colors">
              <MapPin size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Character Count and Post Button */}
          <div className="flex items-center gap-3">
            {tweetText.length > 0 && (
              <div className="flex items-center gap-2">
                {charsRemaining >= 0 ? (
                  <>
                    <svg width="20" height="20" className="transform -rotate-90">
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="#e1e8ed"
                        strokeWidth="2"
                        fill="none"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke={getProgressColor()}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 8}`}
                        strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    {charsRemaining <= 20 && (
                      <span className={`text-xs font-semibold ${charsRemaining <= 0 ? 'text-red-500' : 'text-gray-600'}`}>
                        {charsRemaining}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-red-500 font-bold">
                    {charsRemaining}
                  </span>
                )}
              </div>
            )}
            
            <button 
              disabled={!tweetText.trim() || charsRemaining < 0}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed font-bold px-5 py-2 rounded-full text-white transition-colors text-sm"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



// import { getDay } from "../common/date";
// import { Link } from "react-router-dom";
// import verifiedBadge from "../imgs/verified.png";
// import BlogContent from "./blog-content.component";

// const BlogPostCard = ({ content, contents, author }) => {
//   const {
//     blog_id: id,
//     banner,
//     publishedAt,
//     title,
//     des,
//     tags,
//     activity: { total_likes, total_comments,total_reads },
//   } = content;

//   const { fullname, profile_img, username, isVerified } = author;

//   const previewText =
//     contents?.[0]?.blocks?.[0]?.data?.text?.replace(/&nbsp;/g, " ") || "";

//   return (
//     <Link
//       to={`/blog/${id}`}
//       className="flex flex-col md:flex-row items-start gap-5 border border-grey rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all mb-6 duration-300 hover:-translate-y-1 bg-white"
//     >
//       {/* Banner Image */}
//       <div className="md:w-1/3 w-full h-48 md:h-48 overflow-hidden">
//         <img
//           src={banner}
//           alt="banner"
//           className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
//         />
//       </div>

//       {/* Content */}
//       <div className="flex-1 p-4 md:p-5">
//         {/* Author + Date */}
//         <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
//           <img
//             src={profile_img}
//             alt="profile"
//             className="w-7 h-7 rounded-full object-cover"
//           />
//           <p className="font-medium text-dark-grey line-clamp-1 ">{fullname}</p>
//           <span className="text-gray-500  line-clamp-1 ">@{username}</span>
//           {isVerified && (
//             <img
//               src={verifiedBadge}
//               alt="verified"
//               className="w-4 h-4 ml-1 inline-block"
//             />
//           )}
//           <span className="ml-auto text-sm md:text-lg text-gray-500">{getDay(publishedAt)}</span>
//         </div>

//         {/* Title */}
//         <h1 className="text-lg md:text-xl font-semibold text-da line-clamp-2 transition-colors duration-200">
//           {title}
//         </h1>

//         {/* Preview */}
//         {previewText ? (
//           <p className="mt-2 text-dark leading-relaxed line-clamp-8 md:line-clamp-2">
//             {previewText.slice(0, 210)}...
//           </p>
//         ) : (
//           <p className="text-dark italic mt-2">Read more ...</p>
//         )}

//         {/* Tags + Reactions */}
//         <div className="flex items-center flex-wrap gap-4 mt-4 text-sm">
//           {tags?.[0] && (
//             <span className="bg-blue-50 text-gray-500 line-clamp-1 px-3 py-1 rounded-full text-xs font-medium">
//               #{tags[0]}
//             </span>
//           )}
//           {tags?.[1] && (
//             <span className="bg-blue-50 text-gray-500 line-clamp-1 -ml-2 md:-ml-2 px-3 py-1 rounded-full text-xs font-medium">
//               #{tags[1]}
//             </span>
//           )}
//           <div className="flex items-center gap-1 text-gray-500">
//             <i className="fi fi-rr-heart text-lg"></i>
//             <span>{total_likes}</span>
//           </div>
//           <div className="flex items-center gap-1 text-gray-500">
//             <i className="fi fi-rr-comment-dots text-lg"></i>
//             <span>{total_comments}</span>
//           </div>
//           <div className="flex items-center gap-1 text-gray-500">
//             <i className="fi fi-rr-eye text-lg"></i>
//             <span>{total_reads}</span>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default BlogPostCard;