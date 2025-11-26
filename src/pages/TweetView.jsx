import React, { useContext, useEffect, useState } from "react";
import { ArrowLeft, Heart, MessageCircle, Share, Trash2 } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { userContext } from "../App";
import { getDay } from "../common/date";
import verifiedBadge from "../imgs/verified.png";
import Loader from "../components/loader.component";

export default function TweetView() {
  const { blog_id } = useParams();
  const navigate = useNavigate();
  const [tweet, setTweet] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [replying, setReplying] = useState(false);
  const [replies, setReplies] = useState([]);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);

  const {
    userAuth: { access_token, profile_img, user_id, username, fullname },
  } = useContext(userContext);

  // ───────────────────────────────────────────────────────────────
  // FETCH TWEET
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTweet = async () => {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/get-tweet`,
          { blog_id }
        );

        console.log(data.tweet);
        setTweet(data.tweet);
        setAuthor(data.tweet.author.personal_info);
        setLikes(data.tweet.activity.total_likes);
        setReplies(data.tweet.comments || []);

        if (access_token) {
          const likeCheck = await axios.post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/isliked-by-user`,
            { _id: data.tweet._id },
            { headers: { Authorization: `Bearer ${access_token}` } }
          );

          setIsLikedByUser(Boolean(likeCheck.data.result));
        }

        setLoading(false);
      } catch (err) {
        toast.error("Unable to load tweet");
        setLoading(false);
      }
    };

    fetchTweet();
  }, [blog_id, access_token]);

  // ───────────────────────────────────────────────────────────────
  // LIKE (FIXED)
  // ───────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!access_token) return toast.error("Login to like");
    if (isLiking) return;

    setIsLiking(true);
    const newLikedState = !isLikedByUser;

    setIsLikedByUser(newLikedState);
    setLikes((prev) => (newLikedState ? prev + 1 : prev - 1));

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/like-tweet`,
        {
          _id: tweet._id,
          islikedByUser: isLikedByUser, // ✅ Send NEW state (the action to perform)
        },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      if (data.total_likes !== undefined) {
        setLikes(data.total_likes);
      }
    } catch (err) {
      toast.error("Failed to like tweet");
      setIsLikedByUser(!newLikedState);
      setLikes((prev) => (newLikedState ? prev - 1 : prev + 1));
    } finally {
      setIsLiking(false);
    }
  };

  // ───────────────────────────────────────────────────────────────
  // ADD COMMENT/REPLY
  // ───────────────────────────────────────────────────────────────
  const handlePostReply = async () => {
    if (!replyText.trim() && !imageUrl)
      return toast.error("Write something or add an image");

    if (!access_token) return toast.error("Login to reply");

    setReplying(true);

    try {
      const payload = {
        _id: tweet._id,
        comment: replyText.trim(),
        blog_author: tweet.author._id, // Get from tweet object
        ...(replyingToComment && {
          replying_to: replyingToComment._id,
          notification_id: replyingToComment.notification_id,
        }),
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`,
        payload,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      // If replying to a comment, add to that comment's children
      if (replyingToComment) {
        setReplies((prev) =>
          prev.map((comment) =>
            comment._id === replyingToComment._id
              ? {
                  ...comment,
                  children: [
                    {
                      _id: data._id,
                      comment: data.comment,
                      commentedAt: data.commentedAt,
                      commented_by: {
                        personal_info: {
                          _id: user_id,
                          username, // you can fill with actual username if available
                          fullname, // actual fullname
                          profile_img: profile_img,
                          isVerified: false, // optional, default false
                        },
                      },
                      isReply: true,
                    },
                    ...(comment.children || []),
                  ],
                }
              : comment
          )
        );
      } else {
        // Add as new parent comment
        setReplies([
          {
            _id: data._id,
            comment: data.comment,
            commentedAt: data.commentedAt,
            commented_by: {
              personal_info: {
                _id: user_id,
                username, // you can fill with actual username if available
                fullname, // actual fullname
                profile_img: profile_img,
                isVerified: false, // optional, default false
              },
            },
            children: data.children || [],
            isReply: false,
          },
          ...replies,
        ]);
      }

      setReplyText("");
      setImageUrl("");
      setReplyingToComment(null);
      toast.success("Reply added!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to post reply");
    } finally {
      setReplying(false);
    }
  };

  // ───────────────────────────────────────────────────────────────
  // DELETE COMMENT
  // ───────────────────────────────────────────────────────────────
  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-tweet-comment`,
        { _id: commentId },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      // Remove from parent comments
      setReplies((prev) =>
        prev
          .map((c) => ({
            ...c,
            children: c.children?.filter((child) => child._id !== commentId),
          }))
          .filter((c) => c._id !== commentId)
      );

      toast.success("Comment deleted");
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  // ───────────────────────────────────────────────────────────────
  // LOAD REPLIES
  // ───────────────────────────────────────────────────────────────
  const handleLoadReplies = async (commentId) => {
    if (expandedReplies[commentId]) {
      setExpandedReplies((prev) => ({
        ...prev,
        [commentId]: false,
      }));
      return;
    }

    setLoadingMoreReplies(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`,
        { _id: commentId, skip: 0 }
      );

      setReplies((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? { ...comment, children: data.replies }
            : comment
        )
      );

      setExpandedReplies((prev) => ({
        ...prev,
        [commentId]: true,
      }));
    } catch (err) {
      toast.error("Failed to load replies");
    } finally {
      setLoadingMoreReplies(false);
    }
  };

  // ───────────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────────

  if (loading) return <Loader />;

  if (!tweet)
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p>Tweet not found</p>
      </div>
    );
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

        navigate("/")
      })
      .catch((err) => {
        target.removeAttribute("disabled");
        console.log(err);
        toast.error("Failed to delete tweet");
      });
  };
  return (
    <div className='min-h-screen bg-white max-w-2xl mx-auto border-l border-r border-gray-200'>
      {/* HEADER */}
      <div className='sticky top-0 bg-white/80 backdrop-blur flex items-center gap-4 px-4 py-3 border-b border-gray-200 z-20'>
        <button
          onClick={() => navigate(-1)}
          className='p-2 hover:bg-gray-100 rounded-full'
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className='font-bold text-xl'>Post</h2>
      </div>

      {/* MAIN TWEET */}
      <div className='border-b border-gray-200 p-4 pb-0'>
        {/* AUTHOR */}
        <div className='flex gap-3'>
          <Link to={`/user/${author.username}`}>
            <img src={author.profile_img} className='w-12 h-12 rounded-full' />
          </Link>

          <div className='flex-1'>
            <div className='flex items-center gap-1'>
              <Link to={`/user/${author.username}`}>
                <p className='font-bold hover:underline'>{author.fullname}</p>
              </Link>
              {author.isVerified && (
                <img src={verifiedBadge} className='w-4 h-4' />
              )}
            </div>

            <p className='text-gray-500'>@{author.username}</p>
          </div>
        </div>

        {/* TEXT */}
        <p className='text-[22px] mt-3 mb-3 whitespace-pre-wrap leading-snug'>
          {tweet.des}
        </p>

        {/* MEDIA */}
        {tweet.banner && (
          <div className='rounded-2xl overflow-hidden border border-gray-200 mb-3'>
            <img
              src={tweet.banner}
              className='w-full max-h-[500px] object-cover'
            />
          </div>
        )}

        {tweet.images?.length > 0 && (
          <div className='rounded-2xl overflow-hidden border border-gray-200 mb-3'>
            <div
              className={`grid gap-1 ${
                tweet.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {tweet.images.map((img, i) => (
                <img key={i} src={img} className='w-full h-48 object-cover' />
              ))}
            </div>
          </div>
        )}

        {/* TIME */}
        <p className='text-gray-500 text-sm pb-4'>
          {getDay(tweet.publishedAt)}
        </p>

        {/* STATS */}
        <div className='py-3 border-t border-b border-gray-200 text-sm text-gray-500 flex gap-6'>
          <div>
            <span className='font-bold text-black'>{replies.length}</span>{" "}
            Comments
          </div>

          <div>
            <span className='font-bold text-black'>{likes}</span> Likes
          </div>

          <div>
            <span className='font-bold text-black'>
              {tweet.activity.total_reads}
            </span>{" "}
            Views
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className='flex justify-around py-3 text-gray-600'>
          <button className='p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition'>
            <MessageCircle size={20} />
          </button>

          <button
            onClick={handleLike}
            disabled={isLiking}
            className='p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition'
          >
            <i
              className={
                "fi fi-rr-heart text-lg " +
                (isLikedByUser
                  ? " text-red fi-sr-heart "
                  : "bg:grey/80 fi-rr-heart")
              }
            ></i>
          </button>

          <button
            onClick={handleShare}
            className='p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition'
          >
            <i className='fi fi-rr-share text-lg'></i>
          </button>
              {username == author.username ? (
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

      {/* COMMENT BOX */}
      <div className='border-b border-gray-200 p-4'>
        {replyingToComment && (
          <div className='mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-500'>
            <p className='text-sm text-gray-600'>
              Replying to{" "}
              <span className='font-semibold'>
                {replyingToComment.commented_by?.personal_info.fullname}
              </span>
            </p>
            <button
              onClick={() => setReplyingToComment(null)}
              className='text-xs text-blue-600 hover:underline mt-1'
            >
              Cancel
            </button>
          </div>
        )}

        <div className='flex gap-3'>
          <img src={profile_img} className='w-10 h-10 rounded-full' />

          <div className='flex-1'>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                replyingToComment
                  ? "Reply to this comment..."
                  : "Post a comment"
              }
              className='w-full bg-transparent border text-lg outline-none resize-none p-2'
              maxLength={300}
            />

            {imageUrl && (
              <div className='mt-2 relative rounded-xl overflow-hidden'>
                <img src={imageUrl} className='w-full max-h-48 object-cover' />
                <button
                  onClick={() => setImageUrl("")}
                  className='absolute top-2 right-2 bg-black/60 text-white rounded-full px-2 py-1'
                >
                  ✕
                </button>
              </div>
            )}

            <div className='flex justify-end mt-3'>
              <button
                onClick={handlePostReply}
                disabled={!replyText.trim() && !imageUrl}
                className='bg-blue-500 text-white font-semibold px-5 py-2 rounded-full disabled:bg-blue-300'
              >
                {replying ? "Posting…" : "Reply"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <div>
        {replies.length === 0 && (
          <p className='text-center py-10 text-gray-500'>No comments yet</p>
        )}

        {replies.map((comment) => (
          <div key={comment._id} className='border-b border-gray-200'>
            {/* COMMENT */}
            <div className='flex gap-3 p-4'>
              <Link
                to={`/user/${comment.commented_by?.personal_info?.username}`}
              >
                <img
                  src={comment.commented_by?.personal_info.profile_img}
                  className='w-10 h-10 rounded-full'
                />
              </Link>

              <div className='flex-1'>
                <div className='flex items-center gap-1'>
                  <Link
                    to={`/user/${comment.commented_by?.personal_info?.username}`}
                  >
                    <p className='font-bold'>
                      {comment.commented_by?.personal_info.fullname}
                    </p>
                  </Link>
                  {comment.commented_by?.personal_info.isVerified && (
                    <img src={verifiedBadge} className='w-4 h-4' />
                  )}
                  <span className='text-gray-500'>
                    @{comment.commented_by?.personal_info.username}
                  </span>
                  <span className='text-gray-500 text-sm'>
                    · {getDay(comment.commentedAt)}
                  </span>
                </div>

                <p className='mt-1 '>{comment.comment}</p>

                {comment.images?.length > 0 && (
                  <img
                    src={comment.images[0]}
                    className='rounded-xl mt-2 max-h-48 object-cover'
                  />
                )}

                {/* COMMENT ACTIONS */}
                <div className='flex gap-4 mt-2 text-gray-500 text-sm'>
                  <button
                    onClick={() => setReplyingToComment(comment)}
                    className='hover:text-blue-500'
                  >
                    Reply
                  </button>

                  {(username === comment.commented_by?.personal_info.username ||
                    username === author.username) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className='hover:text-red-500 flex items-center gap-1'
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}

                  {comment.children?.length > 0 && (
                    <button
                      onClick={() => handleLoadReplies(comment._id)}
                      className='hover:text-blue-500'
                    >
                      {expandedReplies[comment._id]
                        ? "Hide"
                        : `${comment.children.length} ${
                            comment.children.length === 1 ? "reply" : "replies"
                          }`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* NESTED REPLIES */}
            {expandedReplies[comment._id] && comment.children?.length > 0 && (
              <div className='ml-12 border-l border-gray-200'>
                {comment.children.map((reply) => (
                  <div
                    key={reply._id}
                    className='flex gap-3 p-4 border-b border-gray-100'
                  >
                    <Link
                      to={`/user/${reply.commented_by?.personal_info.username}`}
                    >
                      <img
                        src={reply.commented_by.personal_info?.profile_img}
                        className='w-9 h-9 rounded-full'
                      />
                    </Link>

                    <div className='flex-1'>
                      <div className='flex items-center gap-1'>
                        <p className='font-bold text-sm'>
                          {reply.commented_by?.personal_info.fullname}
                        </p>
                        <span className='text-gray-500 text-sm'>
                          @{reply.commented_by?.personal_info.username}
                        </span>
                        <span className='text-gray-500 text-xs'>
                          · {getDay(reply.commentedAt)}
                        </span>
                      </div>

                      <p className='mt-1 text-sm'>{reply.comment}</p>

                      {reply.images?.length > 0 && (
                        <img
                          src={reply.images[0]}
                          className='rounded-lg mt-2 max-h-40 object-cover'
                        />
                      )}

                      {(user_id === reply.commented_by?.personal_info._id ||
                        user_id === tweet.author._id) && (
                        <button
                          onClick={() => handleDeleteComment(reply._id)}
                          className='text-xs text-red-500 hover:underline mt-1 flex items-center gap-1'
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
