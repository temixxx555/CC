import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import verifiedBadge from "../imgs/verified.png";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { userContext } from "../App";
import toast from "react-hot-toast";

const TweetCard = ({ tweet, author }) => {
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
  let {
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

    // ✅ Send correct parameter name
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
        { _id, islikedByUser: isLikedByUser }, // ✅ Changed from "like" to "islikedByUser"
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
      })
      .catch((err) => {
        target.removeAttribute("disabled");
        console.log(err);
        toast.error("Failed to delete tweet");
      });
  };

  return (
    <div className='flex gap-3 border-b border-grey p-4 hover:shadow-lg transition-colors cursor-pointer group'>
      {/* Avatar */}
      <Link to={`/user/${username}`}>
        <img
          src={profile_img}
          alt='profile'
          className='w-12 h-12 rounded-full hover:opacity-80 transition'
        />
      </Link>

      {/* Content Container */}
      <div className='flex-1'>
        {/* Header: Author info + timestamp */}
        <div className='flex items-center gap-1 mb-1'>
          <Link to={`/user/${username}`} className='hover:underline'>
            <p className='font-bold text-dark-grey hover:underline'>
              {fullname}
            </p>
          </Link>

          {isVerified && (
            <img src={verifiedBadge} alt='verified' className='w-4 h-4' />
          )}

          <span className='text-gray-500 hover:underline'>@{username}</span>

          <span className='text-gray-500 mx-1'>·</span>

          <span className='text-gray-500 hover:underline text-sm'>
            {getDay(publishedAt)}
          </span>
        </div>

        {/* Tweet text */}
        <Link to={`/tweet/${blog_id}`}>
          <p className='text-dark text-base mb-3 whitespace-pre-wrap break-words '>
            {des}
          </p>
        </Link>

        {/* Media */}
        {(banner || images) && (
          <Link to={`/tweet/${blog_id}`}>
            <div className='mb-3 rounded-2xl overflow-hidden border border-gray-200'>
              {banner ? (
                <img
                  src={banner}
                  alt='tweet-media'
                  className='w-full max-h-96 object-cover hover:brightness-95 transition'
                />
              ) : images && images.length > 0 ? (
                <div
                  className={`grid gap-1 ${
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
                        className='w-full h-48 object-cover hover:brightness-95 transition'
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        )}

        {/* Action buttons */}
        <div className='flex justify-between text-gray-500 text-sm max-w-xs -ml-2'>
          {/* Comments */}
          <Link to={`/tweet/${blog_id}`}>
            <button className='flex items-center gap-2 px-2 py-2 rounded-full hover:text-blue-500 transition group/btn'>
              <i className='fi fi-rr-comment-dots text-lg'></i>
              <span className='text-xs group-hover/btn:text-blue-500'>
                {total_comments > 0 ? total_comments : "0"}
              </span>
            </button>
          </Link>

          {/* Likes */}
          <button
            onClick={handleLiking}
            className='flex items-center gap-2 px-2 py-2 rounded-full hover:text-blue-500 transition group/btn '
          >
            <i
              className={
                "fi fi-rr-heart text-lg " +
                (isLikedByUser
                  ? " text-red fi-sr-heart "
                  : "bg:grey/80 fi-rr-heart")
              }
            ></i>
            <span className='text-xs group-hover/btn:text-blue-500'>
              {likes}
            </span>
          </button>

          {/* Views */}
          <button className='flex items-center gap-2 px-2 py-2 rounded-full hover:text-blue-500 transition group/btn'>
            <i className='fi fi-rr-eye text-lg'></i>
            <span className='text-xs group-hover/btn:text-blue-500'>
              {total_reads > 0 ? total_reads : "0"}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className='flex items-center gap-2 px-2 py-2 rounded-full hover:text-red transition'
          >
            <i className='fi fi-rr-share text-lg'></i>
          </button>
          {/* delete */}
          {mainusername == username ? (
            <button
              onClick={(e) => deleteTweet(blog_id, access_token, e.target)}
              className='flex items-center gap-2 px-2 py-2 rounded-full hover:text-red transition'
            >
              <i class='fi fi-rr-trash'></i>
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
