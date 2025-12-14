import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import verifiedBadge from "../imgs/verified.png";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { userContext } from "../App";
import toast from "react-hot-toast";

const TweetCard = ({ tweet, author, id }) => {
  const {
    _id,
    blog_id,
    des,
    banner,
    images,
    activity: { total_likes, total_comments, total_retweets, total_reads },
    publishedAt,
  } = tweet;

  const { fullname, username, profile_img, isVerified } = author;
  const [isLikedByUser, setLikedByUser] = useState(false);
  const [likes, setLikes] = useState(total_likes);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");

  let {
    userAuth,
    setUserAuth,
    userAuth: { access_token, username: mainusername },
  } = useContext(userContext);

  useEffect(() => {
    if (access_token) {
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user",
          { _id },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data: { result } }) => {
          setLikedByUser(Boolean(result));
        });
    }
  }, []);

  const handleLiking = () => {
    if (!access_token) {
      return toast.error("Please Login to like the tweet");
    }

    const newLikedState = !isLikedByUser;

    // Optimistic UI update
    setLikedByUser(newLikedState);
    setLikes((prev) => (newLikedState ? prev + 1 : prev - 1));

    // ✅ Send the NEW state to backend
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
        { _id, islikedByUser: isLikedByUser }, // ✅ Send newLikedState instead of isLikedByUser
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      .then(({ data }) => {
        // Sync with backend response
        if (data.liked_by_user !== newLikedState) {
          setLikedByUser(data.liked_by_user);
          setLikes(data.total_likes);
        }
      })
      .catch((err) => {
        // Revert on failure
        toast.error("Failed to like tweet. Try again.");
        setLikedByUser(!newLikedState);
        setLikes((prev) => (newLikedState ? prev - 1 : prev + 1));
        console.error(err);
      });
  };

  const openLightbox = (imgSrc, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxImage(imgSrc);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage("");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/tweet/${blog_id}`;

    if (navigator.share) {
      navigator.share({
        title: "Check out this post",
        text: tweet.des.slice(0, 80),
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  const deleteTweet = (blog_id, access_token, target) => {
    if (!window.confirm("Are you sure you want to delete this tweet?")) return;

    target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-blog",
        { blog_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        target.removeAttribute("disabled");
        toast.success("Tweet deleted");

        window.location.reload();
        window.location.reload();
      })
      .catch((err) => {
        target.removeAttribute("disabled");
        console.log(err);
        toast.error("Failed to delete tweet");
      });
  };

    const isFollowing = userAuth?.following?.includes(id);


  // useEffect(() => {
  //   if (userAuth?.following && id) {
  //     setIsFollowing(userAuth.following.includes(id));
  //   }
  // }, [userAuth, id]);

  const handleFollow = async () => {
    if (!access_token) {
      return toast.error("Please login to follow users");
    }

    const userIdToFollow = id;
    const newState = !isFollowing;

    // optimistic UI
    // setIsFollowing(newState);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/follows/${userIdToFollow}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const updatedAuth = {
        ...userAuth,
        following: data.following
          ? [...userAuth.following, userIdToFollow]
          : userAuth.following.filter((id) => id !== userIdToFollow),
      };

      setUserAuth({ ...updatedAuth });
      sessionStorage.setItem("user", JSON.stringify(updatedAuth));

      // toast.success(data.following ? "Followed" : "Unfollowed");
    } catch (err) {
      setIsFollowing(!newState);
      toast.error("Failed to update follow status");
      console.error(err);
    }
  };

  // to click links
  const linkifyText = (text) => {
    const urlRegex =
      /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;

    return text.replace(urlRegex, (url) => {
      let href = url;

      // If no http:// or https://, add https://
      if (!href.startsWith("http")) {
        href = "https://" + href;
      }

      return `<a href="${href}" target="_blank" class="text-blue-500 underline">${url}</a>`;
    });
  };

  return (
    <>
      <div className='bg-white border border-grey rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow'>
        {/* Header Section */}
        <div className='p-4'>
          <div className='flex items-start gap-3'>
            {/* Avatar */}
            <Link to={`/user/${username}`}>
              <img
                src={profile_img}
                alt='profile'
                className='w-10 h-10 rounded-full hover:opacity-80 transition flex-shrink-0'
              />
            </Link>

            {/* Author Info and Options */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1 flex-wrap'>
                  <Link to={`/user/${username}`} className='hover:underline'>
                    <p className='font-semibold text-dark-grey text-[15px]'>
                      {fullname}
                    </p>
                    <p className='font-semibold text-gray-500 text-[11px]'>
                      student - Bowen{" "}
                    </p>
                  </Link>

                  {isVerified && (
                    <img
                      src={verifiedBadge}
                      alt='verified'
                      className='w-6 h-6 mb-3'
                    />
                  )}
                </div>

                {/* Delete button (top right) */}
                {access_token ? (
                  mainusername === username ? (
                    // Owner -> delete button
                    <button
                      onClick={(e) =>
                        deleteTweet(blog_id, access_token, e.target)
                      }
                      className='text-gray-500 hover:text-red p-2 rounded-full hover:bg-grey/20 transition'
                    >
                      <i className='fi fi-rr-trash text-lg'></i>
                    </button>
                  ) : (
                    // Follow / Following button
                    <button
                      onClick={handleFollow}
                      className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1 transition ${
                        isFollowing
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      <i className='fi fi-rr-user-add'></i>
                      {isFollowing ? "Connected" : "Connect"}
                    </button>
                  )
                ) : null}
              </div>

              <div className='flex items-center gap-1 text-sm text-gray-500'>
                <Link to={`/user/${username}`} className='hover:underline'>
                  @{username}
                </Link>
                <span>·</span>
                <Link to={`/tweet/${blog_id}`} className='hover:underline'>
                  {getDay(publishedAt)}
                </Link>
              </div>
            </div>
          </div>

          {/* Tweet Content */}
          <Link to={`/tweet/${blog_id}`}>
            <p
              className='text-dark text-[15px] mt-3 whitespace-pre-wrap break-words leading-relaxed'
              dangerouslySetInnerHTML={{ __html: linkifyText(des) }}
            ></p>
          </Link>
        </div>

        {/* Media Section */}
        {(banner || images) && (
          <div className='w-full'>
            {banner ? (
              <img
                src={banner}
                alt='tweet-media'
                onClick={(e) => openLightbox(banner, e)}
                className='w-full max-h-[500px] object-cover hover:brightness-95 transition cursor-pointer'
              />
            ) : images && images.length > 0 ? (
              <div
                className={`grid gap-0.5 ${
                  images.length === 1
                    ? "grid-cols-1"
                    : images.length === 2
                      ? "grid-cols-2"
                      : images.length === 3
                        ? "grid-cols-2"
                        : "grid-cols-2"
                }`}
              >
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={
                      images.length === 3 && idx === 0 ? "col-span-2" : ""
                    }
                  >
                    <img
                      src={img}
                      alt={`tweet-${idx}`}
                      onClick={(e) => openLightbox(img, e)}
                      className='w-full h-64 object-cover hover:brightness-95 transition cursor-pointer'
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Engagement Stats */}
        <div className='px-4 py-2 border-t border-grey'>
          <div className='flex items-center gap-4 text-sm text-gray-500'>
            {likes > 0 && (
              <span>
                {likes} {likes === 1 ? "like" : "likes"}
              </span>
            )}
            {total_comments > 0 && (
              <span>
                {total_comments} {total_comments === 1 ? "comment" : "comments"}
              </span>
            )}
            {total_reads > 0 && (
              <span>
                {total_reads} {total_reads === 1 ? "view" : "views"}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='border-t border-grey px-2 py-1'>
          <div className='flex items-center justify-around'>
            {/* Comments */}
            <Link to={`/tweet/${blog_id}`} className='flex-1'>
              <button className='flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:bg-grey/20 transition w-full group'>
                <i className='fi fi-rr-comment-dots text-xl text-gray-500 group-hover:text-blue-500'></i>
                <span className='text-sm font-medium text-gray-500 group-hover:text-blue-500'>
                  Comment
                </span>
              </button>
            </Link>

            {/* Likes */}
            <button
              onClick={handleLiking}
              className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:bg-grey/20 transition group'
            >
              <i
                className={
                  "fi text-xl " +
                  (isLikedByUser
                    ? "text-red fi-sr-heart"
                    : "text-gray-500 group-hover:text-blue-500 fi-rr-heart")
                }
              ></i>
              <span
                className={
                  "text-sm font-medium " +
                  (isLikedByUser
                    ? "text-red"
                    : "text-gray-500 group-hover:text-blue-500")
                }
              >
                Like
              </span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:bg-grey/20 transition group'
            >
              <i className='fi fi-rr-share text-xl text-gray-500 group-hover:text-blue-500'></i>
              <span className='text-sm font-medium text-gray-500 group-hover:text-blue-500'>
                Share
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D] bg-opacity-95 p-4'
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className='absolute top-4 right-4 text-[#ffff] text-3xl hover:text-gray-300 transition z-10'
          >
            ×
          </button>

          {/* Modal Content */}
          <div
            className='flex flex-col md:flex-row w-full p-3 max-w-5xl bg-[#0D0D0D]  rounded-lg overflow-hidden shadow-lg'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section */}
            <div className='flex-1 flex items-center justify-center'>
              <img
                src={lightboxImage}
                alt='Full size'
                className='max-h-[80vh] w-auto object-contain'
              />
            </div>

            {/* Right Sidebar: Description & Engagement */}
            <div className='md:w-96 w-full flex flex-col justify-between md:justify-normal p-4 text-white'>
              {/* Post Description */}
              <div className='mb-4 overflow-y-auto max-h-[60vh]'>
                <h2 className='text-lg text-[#ffff] font-semibold mb-2'>
                  Post
                </h2>
                <p className='text-sm text-[#ffff] leading-relaxed'>{des}</p>
              </div>

              {/* Engagement Stats */}
              <div className='mb-4'>
                <div className='flex items-center gap-4 text-sm text-[#ffff]'>
                  {likes > 0 && (
                    <span>
                      {likes} {likes === 1 ? "like" : "likes"}
                    </span>
                  )}
                  {total_comments > 0 && (
                    <span>
                      {total_comments}{" "}
                      {total_comments === 1 ? "comment" : "comments"}
                    </span>
                  )}
                  {total_reads > 0 && (
                    <span>
                      {total_reads} {total_reads === 1 ? "view" : "views"}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center justify-around border-t border-gray-700 pt-2'>
                <Link to={`/tweet/${blog_id}`} className='flex-1'>
                  <button className='flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg hover:bg-gray-800 transition group'>
                    <i className='fi fi-rr-comment-dots text-xl text-gray-400 group-hover:text-blue-500'></i>
                    <span className='text-sm font-medium text-[#ffff] group-hover:text-blue-500'>
                      Comment
                    </span>
                  </button>
                </Link>

                <button
                  onClick={handleLiking}
                  className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-800 transition group'
                >
                  <i
                    className={`fi text-xl ${isLikedByUser ? "text-red fi-sr-heart" : "text-gray-400 group-hover:text-blue-500 fi-rr-heart"}`}
                  ></i>
                  <span
                    className={`text-sm font-medium ${isLikedByUser ? "text-red" : "text-gray-400 group-hover:text-blue-500"}`}
                  >
                    Like
                  </span>
                </button>

                <button
                  onClick={handleShare}
                  className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-800 transition group'
                >
                  <i className='fi fi-rr-share text-xl text-gray-400 group-hover:text-blue-500'></i>
                  <span className='text-sm font-medium text-gray-400 group-hover:text-blue-500'>
                    Share
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TweetCard;
