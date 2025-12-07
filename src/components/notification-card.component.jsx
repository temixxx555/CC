import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import NotificationCommentField from "./notification-comment-field.component";
import { userContext } from "../App";
import axios from "axios";
import toast from "react-hot-toast";

const NotificationCard = ({ data, index, notificationState }) => {
  const [isReplying, setIsReplying] = useState(false);

  const {
    seen,
    createdAt,
    type,
    user,
    blog = {},
    comment = {},
    reply,
    replied_on_comment = {},
    _id: notification_id,
  } = data;

  const { _id: blogId, blog_id = "", title = "", des = "" } = blog || {};
  const { personal_info: { fullname, username, profile_img } = {} } =
    user || {};

  const {
    userAuth: {
      username: author_username,
      profile_img: author_profile_img,
      access_token,
    },
  } = useContext(userContext);

  const {
    notifications,
    notifications: { results, totalDocs },
    setNotifications,
  } = notificationState;

  const handleReply = () => setIsReplying((prev) => !prev);

  const handleDelete = (comment_id, type, target) => {
    target.disabled = true;
    const idToDelete = type === "reply" ? replied_on_comment?._id : comment_id;

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        { _id: idToDelete },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      .then(() => {
        const updatedResults =
          type === "comment"
            ? results.filter((_, i) => i !== index)
            : results.map((item, i) =>
                i === index ? { ...item, reply: undefined } : item
              );

        setNotifications({
          ...notifications,
          results: updatedResults,
          totalDocs: totalDocs - 1,
          deletedDocCount: notifications.deletedDocCount + 1,
        });

        toast.success("Deleted successfully");
      })
      .catch((err) => {
        target.disabled = false;
        const errorMsg = err.response?.data?.error || "Failed to delete";
        toast.error(errorMsg);
        console.error("Delete error:", err.response);
      });
  };

  // Get notification icon and color based on type
  const getNotificationStyle = () => {
    switch (type) {
      case "like":
        return {
          icon: "fi fi-sr-heart",
          iconBg: "bg-red/10",
          iconColor: "text-red",
        };
      case "comment":
        return {
          icon: "fi fi-rr-comment-dots",
          iconBg: "bg-blue-500/10",
          iconColor: "text-blue-500",
        };
      case "reply":
        return {
          icon: "fi fi-rr-comment-arrow-up",
          iconBg: "bg-purple-500/10",
          iconColor: "text-purple-500",
        };
      case "followed":
        return {
          icon: "fi fi-rr-user-add",
          iconBg: "bg-green-500/10",
          iconColor: "text-green-500",
        };
      case "info":
      case "announcement":
        return {
          icon: "fi fi-rr-megaphone",
          iconBg: "bg-orange-500/10",
          iconColor: "text-orange-500",
        };
      default:
        return {
          icon: "fi fi-rr-bell",
          iconBg: "bg-grey",
          iconColor: "text-dark-grey",
        };
    }
  };

  const notificationStyle = getNotificationStyle();

  return (
    <div
      className={`relative p-4 hover:bg-grey/30 transition-colors border-b border-grey ${
        !seen ? "bg-blue-50/30" : ""
      }`}
    >
      {/* Unread indicator dot */}
      {!seen && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}

      <div className="flex gap-3">
        {/* Avatar with notification icon badge */}
        <div className="relative flex-shrink-0">
          <Link to={`/user/${username}`}>
            <img
              src={
                profile_img ||
                "https://bowen.edu.ng/wp-content/uploads/2019/10/Podium-Bowen-Logo-e1572367768365.jpg"
              }
              className="w-12 h-12 rounded-full hover:opacity-80 transition"
              alt={fullname}
            />
          </Link>
          
          {/* Notification type icon badge */}
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${notificationStyle.iconBg} border-2 border-white`}
          >
            <i
              className={`${notificationStyle.icon} ${notificationStyle.iconColor} text-xs`}
            ></i>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Notification text */}
          <div className="mb-1">
            <Link
              to={`/user/${username}`}
              className="font-semibold text-dark-grey hover:underline"
            >
              {fullname}
            </Link>
            <span className="text-dark-grey">
              {" "}
              {type === "like"
                ? "liked your post"
                : type === "comment"
                  ? "commented on your post"
                  : type === "reply"
                    ? "replied to your comment"
                    : type === "info" || type === "announcement"
                      ? "posted an announcement"
                      : type === "followed"
                        ? "started following you"
                        : "interacted with your content"}
            </span>
          </div>

          {/* Time */}
          <p className="text-sm text-blue-500 mb-2">{getDay(createdAt)}</p>

          {/* Announcement content */}
          {(type === "announcement" || type === "info") && (
            <Link to={`/ranking`}>
              <div className="bg-grey rounded-lg p-3 mt-2 hover:bg-grey/80 transition">
                {data.title && (
                  <p className="font-bold text-base mb-1 text-dark-grey">
                    {data.title}
                  </p>
                )}
                <p className="text-sm text-dark-grey">{data.message}</p>
              </div>
            </Link>
          )}

          {/* Reply preview */}
          {type === "reply" && replied_on_comment?.comment && (
            <div className="bg-grey rounded-lg p-3 mt-2">
              <p className="text-sm text-dark-grey line-clamp-2">
                {comment?.comment}
              </p>
            </div>
          )}

          {/* Follow notification */}
          {type === "followed" && (
            <div className="bg-grey rounded-lg p-3 mt-2">
              <p className="text-sm text-dark-grey">
                You have a new follower! 🎉
              </p>
            </div>
          )}

          {/* Blog/Tweet link */}
          {type !== "followed" && type !== "info" && type !== "announcement" && (
            <Link
              to={`/${title?.length > 0 ? "blog" : "tweet"}/${blog_id}`}
              className="block mt-2"
            >
              <div className="bg-grey rounded-lg p-3 hover:bg-grey/80 transition">
                <p className="text-sm text-dark-grey line-clamp-2">
                  {title?.length > 0 ? title : des}
                </p>
              </div>
            </Link>
          )}

          {/* Comment preview */}
          {type === "comment" && comment?.comment && (
            <div className="bg-grey rounded-lg p-3 mt-2">
              <p className="text-sm text-dark-grey line-clamp-3">
                {comment.comment}
              </p>
            </div>
          )}

          {/* Action buttons */}
          {(type === "comment" || type === "reply") && (
            <div className="flex gap-4 mt-2">
              {!reply && (
                <button
                  onClick={handleReply}
                  className="text-sm font-semibold text-dark-grey hover:underline"
                >
                  Reply
                </button>
              )}
              <button
                onClick={(e) => handleDelete(comment._id, type, e.target)}
                className="text-sm font-semibold text-red hover:underline"
              >
                Delete
              </button>
            </div>
          )}

          {/* Reply input */}
          {isReplying && (
            <div className="mt-3 bg-white rounded-lg border border-grey p-3">
              <NotificationCommentField
                _id={blogId}
                blog_author={user}
                index={index}
                replyingTo={comment._id}
                setIsReplying={setIsReplying}
                notification_id={notification_id}
                notificationData={notificationState}
              />
            </div>
          )}

          {/* Your reply display */}
          {reply && (
            <div className="mt-3 bg-white rounded-lg border border-grey p-3">
              <div className="flex gap-2 mb-2">
                <img
                  src={author_profile_img}
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="mb-1">
                    <Link
                      to={`/user/${author_username}`}
                      className="font-semibold text-sm text-dark-grey hover:underline"
                    >
                      You
                    </Link>
                    <span className="text-sm text-dark-grey"> replied to </span>
                    <Link
                      to={`/user/${username}`}
                      className="font-semibold text-sm text-dark-grey hover:underline"
                    >
                      {fullname}
                    </Link>
                  </div>
                  <p className="text-sm text-dark-grey">{reply.comment}</p>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(comment._id, "reply", e.target)}
                className="text-xs font-semibold text-red hover:underline ml-10"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;