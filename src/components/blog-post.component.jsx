import { getDay } from "../common/date";
import { Link, useNavigate } from "react-router-dom";
import verifiedBadge from "../imgs/verified.png";
import BlogContent from "./blog-content.component";
import { useContext, useEffect, useState } from "react";
import { userContext } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import { useGlobalContext } from "../contexts/GlobalStoreContext";

const BlogPostCard = ({ content, contents, author, id: _ids }) => {
  const {
    _id,
    blog_id: id,
    banner,
    publishedAt,
    title,
    des,
    tags,
    activity: { total_likes, total_comments, total_reads },
  } = content;
  // console.log('Content: ', content);

  const { fullname, profile_img, username, isVerified } = author;

  const { cachedBlog, setCachedBlog } = useGlobalContext();

  const previewText =
    contents?.[0]?.blocks?.[0]?.data?.text?.replace(/&nbsp;/g, " ") || "";

  const [isFollowing, setIsFollowing] = useState(false);
  let {
    userAuth,
    setUserAuth,
    userAuth: { access_token, username: mainusername },
  } = useContext(userContext);
  const [isLikedByUser, setLikedByUser] = useState(false);
  const [likes, setLikes] = useState(total_likes);
  const navigate = useNavigate();

  useEffect(() => {
    if (userAuth?.following && _ids) {
      setIsFollowing(userAuth.following.includes(_ids));
    }
  }, [userAuth, _ids]);

  const handleFollow = async () => {
    if (!access_token) {
      return toast.error("Please login to follow users");
    }

    const userIdToFollow = _ids;
    const newState = !isFollowing;

    // optimistic UI
    setIsFollowing(newState);

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
  const deleteTweet = (id, access_token, target) => {
    if (!window.confirm("Are you sure you want to delete this tweet?")) return;

    target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-blog",
        { blog_id: id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        target.removeAttribute("disabled");
        // toast.success("Tweet deleted");
        window.location.reload();
      })
      .catch((err) => {
        target.removeAttribute("disabled");
        console.log(err);
        toast.error("Failed to delete tweet");
      });
  };
  const handleShare = () => {
    const url = `${window.location.origin}/blog/${id}`;

    if (navigator.share) {
      navigator.share({
        title: "Check out this post",
        text: title.slice(0, 80),
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };
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
  return (
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

          {/* Author Info */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-1 justify-between'>
              <div className='flex items-center gap-1 flex-wrap'>
                <Link to={`/user/${username}`} className='hover:underline'>
                  <p className='font-semibold text-dark-grey text-[15px]'>
                    {fullname}
                  </p>
                </Link>

                {isVerified && (
                  <img src={verifiedBadge} alt='verified' className='w-4 h-4' />
                )}
              </div>

              {access_token ? (
                mainusername === username ? (
                  // Owner -> delete button
                  <button
                    onClick={(e) => deleteTweet(id, access_token, e.target)}
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
                    {isFollowing ? "Connected" : "Follow"}
                  </button>
                )
              ) : null}
            </div>
            <div className='flex items-center gap-1 text-sm text-gray-500'>
              <Link to={`/user/${username}`} className='hover:underline'>
                @{username}
              </Link>
              <span>·</span>
              <span className='hover:underline'>{getDay(publishedAt)}</span>
            </div>
          </div>
        </div>
{/* 
                  <div className='mt-3' onClick={() => (
            console.log("haha", { content, author, id, contents }),
            navigate(
            `/blog/${id}`,
            {
              state: {
                content, contents, author, id
              }
            }
          )
          )}></div> */}

        {/* Blog Content */}

        <Link to={`/blog/${id}`}>
          <div className='mt-3' onClick={() => (
            setCachedBlog(content),
            navigate(`/blog/${id}`,)
          )}>
            {/* Title */}
            <h1 className='text-lg font-semibold text-dark-grey line-clamp-2 mb-2 hover:underline'>
              {title}
            </h1>

            {/* Preview Text */}
            {previewText ? (
              <p className='text-dark text-[15px] leading-relaxed line-clamp-3 mb-3'>
                {previewText.slice(0, 210)}...
              </p>
            ) : (
              <p className='text-gray-500 italic text-[15px] mb-3'>
                Read more...
              </p>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className='flex gap-2 mb-3 flex-wrap'>
                {tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className='bg-blue-50 text-gray-500 px-3 py-1 rounded-full text-xs font-medium'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Banner Image */}
      {banner && (
        <Link to={`/blog/${id}`}>
          <div className='w-full'>
            <img
              src={banner}
              alt='banner'
              className='w-full max-h-[400px] object-cover hover:brightness-95 transition'
            />
          </div>
        </Link>
      )}

      {/* Engagement Stats */}
      <div className='px-4 py-2 border-t border-grey'>
        <div className='flex items-center gap-4 text-sm text-gray-500'>
          {likes > 0 ? (
            <span>
              {likes} {likes === 1 ? "like" : "likes"}
            </span>
          ) : (
            <span>
              {total_likes} {total_likes === 1 ? "like" : "likes"}
            </span>
          )}
          {total_comments > 0 && (
            <span>
              {total_comments} {total_comments === 1 ? "comment" : "comments"}
            </span>
          )}
          {total_reads > 0 && (
            <span>
              {total_reads} {total_reads === 1 ? "read" : "reads"}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='border-t border-grey px-2 py-1'>
        <div className='flex items-center justify-around'>
          {/* Comment */}
          <Link to={`/blog/${id}`} className='flex-1'>
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
  );
};

export default BlogPostCard;
