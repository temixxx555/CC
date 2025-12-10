import React, { useContext, useEffect, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { userContext } from "../App";
import { getDay } from "../common/date";
import verifiedBadge from "../imgs/verified.png";
import SmallLoader from "../components/small.loader";

export default function TweetView() {
  const { state } = useLocation();
  const { tweet: tweet_, author: author_ } = state || {};

  const { blog_id } = useParams();
  const navigate = useNavigate();

  const [tweet, setTweet] = useState(tweet_ || null);
  const [author, setAuthor] = useState(author_ || null);
  const [tweetLoading, setTweetLoading] = useState(!tweet_); // load immediately if state exists
  const [commentLoading, setCommentLoading] = useState(!tweet_);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [likes, setLikes] = useState(tweet_ ? tweet_.activity.total_likes : 0);
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
  // When state is passed through navigation, load instantly
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tweet_) {
      setTweet(tweet_);
      setAuthor(author_);
      setLikes(tweet_.activity.total_likes);
      setTweetLoading(false);
      setCommentLoading(false);
    }
  }, [tweet_, author_]);

  // ───────────────────────────────────────────────────────────────
  // If no state (full reload), fetch from server
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tweet_) return; // skip if navigation already provided tweet

    const fetchTweet = async () => {
      setTweetLoading(true);

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/get-tweet`,
          { blog_id }
        );

        setTweet(data.tweet);
        setAuthor(data.tweet.author.personal_info);
        setLikes(data.tweet.activity.total_likes);

        const parentComments = (data.tweet.comments || []).filter(
          (c) => !c.parent && !c.isReply
        );
        setReplies(parentComments);

        if (access_token) {
          const likeCheck = await axios.post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/isliked-by-user`,
            { _id: data.tweet._id },
            { headers: { Authorization: `Bearer ${access_token}` } }
          );
          setIsLikedByUser(Boolean(likeCheck.data.result));
        }
      } catch (err) {
        toast.error("Unable to load tweet");
      } finally {
        setTweetLoading(false);
        setCommentLoading(false);
      }
    };

    fetchTweet();
  }, [blog_id, access_token, tweet_]);

  useEffect(() => {
    const fetchCommentAndLikes = async () => {
      setCommentLoading(true);
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/get-tweet`,
          { blog_id }
        );

        const parentComments = (data.tweet.comments || []).filter(
          (c) => !c.parent && !c.isReply
        );
        setReplies(parentComments);

        if (access_token) {
          const likeCheck = await axios.post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/isliked-by-user`,
            { _id: data.tweet._id },
            { headers: { Authorization: `Bearer ${access_token}` } }
          );
          setIsLikedByUser(Boolean(likeCheck.data.result));
        }
      } catch (err) {
        toast.error("Unable to load tweet");
      } finally {
        setCommentLoading(false);
      }
    }
    if (tweet_)
    {
      fetchCommentAndLikes();
    }
  }, [tweet_])

  // ───────────────────────────────────────────────────────────────
  // LIKE HANDLER
  // ───────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!access_token) return toast.error("Login to like");
    if (isLiking) return;

    setIsLiking(true);
    const newState = !isLikedByUser;

    setIsLikedByUser(newState);
    setLikes((prev) => (newState ? prev + 1 : prev - 1));

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/like-tweet`,
        {
          _id: tweet._id,
          islikedByUser: isLikedByUser,
        },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      if (data.total_likes !== undefined) {
        setLikes(data.total_likes);
      }
    } catch (err) {
      toast.error("Failed to like tweet");
      setIsLikedByUser(!newState);
      setLikes((prev) => (newState ? prev - 1 : prev + 1));
    } finally {
      setIsLiking(false);
    }
  };

  // ───────────────────────────────────────────────────────────────
  // POST COMMENT / REPLY
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
        blog_author: tweet.author._id,
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

      const newComment = {
        _id: data._id,
        comment: data.comment,
        commentedAt: data.commentedAt,
        commented_by: {
          personal_info: {
            _id: user_id,
            username,
            fullname,
            profile_img,
            isVerified: false,
          },
        },
        children: [],
        isReply: Boolean(replyingToComment),
        parent: replyingToComment?._id || null,
      };

      if (replyingToComment) {
        setReplies((prev) =>
          prev.map((c) =>
            c._id === replyingToComment._id
              ? { ...c, children: [newComment, ...(c.children || [])] }
              : c
          )
        );
      } else {
        setReplies((prev) => [newComment, ...prev]);
      }

      setReplyText("");
      setImageUrl("");
      setReplyingToComment(null);
      toast.success("Reply added!");
    } catch (err) {
      toast.error("Failed to post reply");
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
      setExpandedReplies((prev) => ({ ...prev, [commentId]: false }));
      return;
    }

    setLoadingMoreReplies(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`,
        { _id: commentId, skip: 0 }
      );

      setReplies((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, children: data.replies } : c
        )
      );

      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    } catch (err) {
      toast.error("Failed to load replies");
    } finally {
      setLoadingMoreReplies(false);
    }
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
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-blog`,
        { blog_id },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      .then(() => {
        target.removeAttribute("disabled");
        toast.success("Tweet deleted");
        navigate("/");
      })
      .catch(() => {
        target.removeAttribute("disabled");
        toast.error("Failed to delete tweet");
      });
  };
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


  // ───────────────────────────────────────────────────────────────
  // UI RENDERING
  // ───────────────────────────────────────────────────────────────
  if (tweetLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SmallLoader />
      </div>
    );

  if (!tweet)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Tweet not found</p>
      </div>
    );

  return (
    <div className='min-h-screen mt-[70px] bg-white max-w-2xl mx-auto border-l border-r border-grey'>
    <div className="min-h-screen bg-white max-w-2xl mx-auto border-l border-r border-grey">
      {/* HEADER */}
      <div className="sticky top-0 bg-white/80 backdrop-blur flex items-center gap-4 px-4 py-3 border-b border-grey z-20">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-black rounded-full bg-black"
        >
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </button>
        <h2 className="font-bold text-xl">Post</h2>
      </div>

      {/* MAIN TWEET */}
      <div className="border-b border-grey p-4 pb-0">
        {/* AUTHOR */}
        <div className="flex gap-3">
          <Link to={`/user/${author.username}`}>
            <img src={author.profile_img} className="w-12 h-12 rounded-full" />
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-1">
              <Link to={`/user/${author.username}`}>
                <p className="font-bold hover:underline">{author.fullname}</p>
              </Link>
              {author.isVerified && (
                <img src={verifiedBadge} className="w-4 h-4" />
              )}
            </div>

            <p className="text-gray-500">@{author.username}</p>
          </div>
        </div>

        {/* TEXT */}
        <p
          className='text-[22px] mt-3 mb-3 whitespace-pre-wrap leading-snug'
          dangerouslySetInnerHTML={{ __html: linkifyText(tweet.des) }}
        ></p>
        <p className="text-[22px] mt-3 mb-3 whitespace-pre-wrap leading-snug">
          {tweet.des}
        </p>

        {/* MEDIA */}
        {tweet.banner && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 mb-3">
            <img
              src={tweet.banner}
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {tweet.images?.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 mb-3">
            <div
              className={`grid gap-1 ${
                tweet.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {tweet.images.map((img, i) => (
                <img key={i} src={img} className="w-full h-48 object-cover" />
              ))}
            </div>
          </div>
        )}

        {/* TIME */}
        <p className="text-gray-500 text-sm pb-4">
          {getDay(tweet.publishedAt)}
        </p>

        {/* STATS */}
        <div className="py-3 border-t border-b border-grey text-sm text-gray-500 flex gap-6">
          <div>
            <span className="font-bold text-black">{replies.length}</span>{" "}
            Comments
          </div>

          <div>
            <span className="font-bold text-black">{likes}</span> Likes
          </div>

          <div>
            <span className="font-bold text-black">
              {tweet.activity.total_reads}
            </span>{" "}
            Views
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-around py-3 text-gray-600">
          <button className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition">
            <MessageCircle size={20} />
          </button>

          <button
            onClick={handleLike}
            disabled={isLiking}
            className="p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition"
          >
            <i
              className={
                "fi fi-rr-heart text-lg " +
                (isLikedByUser ? "text-red fi-sr-heart" : "fi-rr-heart")
              }
            ></i>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition"
          >
            <i className="fi fi-rr-share text-lg"></i>
          </button>

          {username === author.username && (
            <button
              onClick={(e) => deleteTweet(blog_id, access_token, e.target)}
              className="flex items-center gap-2 px-2 py-2 rounded-full hover:text-red transition"
            >
              <i className="fi fi-rr-trash"></i>
            </button>
          )}
        </div>
      </div>

      {/* COMMENTS */}
      {!commentLoading ? (
        <>
          {/* COMMENT BOX */}
          <div className="border-b border-grey p-4">
            {replyingToComment && (
              <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">
                  Replying to{" "}
                  <span className="font-semibold">
                    {replyingToComment.commented_by?.personal_info.fullname}
                  </span>
                </p>
                <button
                  onClick={() => setReplyingToComment(null)}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <img src={profile_img} className="w-10 h-10 rounded-full" />

              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    replyingToComment
                      ? "Reply to this comment..."
                      : "Post a comment"
                  }
                  className="w-full bg-transparent border border-grey text-lg outline-none resize-none p-2"
                  maxLength={300}
                />

                {imageUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden">
                    <img
                      src={imageUrl}
                      className="w-full max-h-48 object-cover"
                    />
                    <button
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex justify-end mt-3">
                  <button
                    onClick={handlePostReply}
                    disabled={!replyText.trim() && !imageUrl}
                    className="bg-blue-500 text-white font-semibold px-5 py-2 rounded-full disabled:bg-blue-300"
                  >
                    {replying ? "Posting…" : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* COMMENTS SECTION */}
          <div className="px-4">
            {replies.length === 0 && (
              <p className="text-center py-10 text-gray-500">No comments yet</p>
            )}

            {replies.map((comment) => (
              <div key={comment._id} className="py-3 border-b border-gray-100">
                <div className="flex gap-2">
                  <Link
                    to={`/user/${comment.commented_by.personal_info.username}`}
                  >
                    <img
                      src={comment.commented_by.personal_info.profile_img}
                      className="w-10 h-10 rounded-full"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="inline-block bg-grey rounded-2xl px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/user/${comment.commented_by.personal_info.username}`}
                        >
                          <p className="font-semibold text-sm">
                            {comment.commented_by.personal_info.fullname}
                          </p>
                        </Link>

                        {comment.commented_by.personal_info.isVerified && (
                          <img src={verifiedBadge} className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <p className="text-[15px] mt-0.5">{comment.comment}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-1 ml-3 text-xs">
                      <span>{getDay(comment.commentedAt)}</span>

                      <button
                        onClick={() => setReplyingToComment(comment)}
                        className="hover:underline"
                      >
                        Reply
                      </button>

                      {comment.children?.length > 0 && (
                        <button
                          onClick={() => handleLoadReplies(comment._id)}
                          className="hover:underline"
                        >
                          {expandedReplies[comment._id]
                            ? `Hide ${comment.children.length} replies`
                            : `View ${comment.children.length} replies`}
                        </button>
                      )}

                  {(username === comment.commented_by?.personal_info.username ||
                    username === author.username) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className='hover:underline text-red ml-auto'
                    >
                      Delete
                    </button>
                  )}
                </div>
                      {(username ===
                        comment.commented_by.personal_info.username ||
                        username === author.username) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="hover:underline text-red ml-auto"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {expandedReplies[comment._id] &&
                      comment.children?.length > 0 && (
                        <div className="mt-3 space-y-3 ml-2">
                          {comment.children.map((reply) => (
                            <div key={reply._id} className="flex gap-2">
                              <img
                                src={
                                  reply.commented_by.personal_info.profile_img
                                }
                                className="w-9 h-9 rounded-full"
                              />

                              <div className="flex-1">
                                <div className="inline-block bg-grey rounded-2xl px-3 py-2">
                                  <p className="font-semibold text-sm">
                                    {
                                      reply.commented_by.personal_info
                                        .fullname
                                    }
                                  </p>
                                  <p className="text-sm mt-1">
                                    {reply.comment}
                                  </p>
                                </div>

                            {/* Reply actions */}
                            <div className='flex items-center gap-3 mt-1 ml-3 text-xs font-semibold text-dark-grey'>
                              <span className='text-xs'>
                                {getDay(reply.commentedAt)}
                              </span>

                              {(user_id ===
                                reply.commented_by?.personal_info._id ||
                                user_id === tweet.author._id) && (
                                <button
                                  onClick={() => handleDeleteComment(reply._id)}
                                  className='hover:underline text-red'
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
                                <div className="text-xs mt-1 ml-3">
                                  <span>{getDay(reply.commentedAt)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <SmallLoader />
      )}
    </div>
  );
}

