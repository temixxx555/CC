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

  // console.log("Notification data:", data);

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

  return (
    <div
      className={
        "p-6 border-grey border-l-black " + (!seen ? " border-l-2 " : "")
      }
    >
      <div className='flex gap-5 mb-3 '>
        <img
          src={
            profile_img ||
            "https://bowen.edu.ng/wp-content/uploads/2019/10/Podium-Bowen-Logo-e1572367768365.jpg"
          }
          className='w-14 h-14 flex-none rounded-full'
          alt='pic'
        />
        <div className='w-full'>
          <h1 className='font-medium text-dark-grey text-xl'>
            <span className='lg:inline-block hidden capitalize'>
              {fullname}
            </span>
            <Link
              className='mx-1 text-black underline'
              to={`/user/${username}`}
            >
              @{username}
            </Link>
            <span className='font-normal'>
              {type === "like"
                ? "liked your blog"
                : type === "comment"
                  ? "commented on"
                  : type === "reply"
                    ? "replied you"
                    : type === "info"
                      ? "annoucement"
                      : type === "followed"
                        ? "followed you"
                        : ""}
            </span>
          </h1>
          {(type === "announcement" || type === "info") && (
            <Link className='' to={`/ranking`}>
              <div className='p-4 mt-4 rounded-md bg-grey'>
                {data.title && (
                  <p className='font-bold text-lg mb-2'>{data.title}</p>
                )}
                <p className='text-dark-grey font-medium'>{data.message}</p>
              </div>
            </Link>
          )}
          {type === "reply" && replied_on_comment?.comment && (
            <div className='p-4 mt-4 rounded-md bg-grey'>
              <p>{comment?.comment}</p>
            </div>
          )}
          {type === "followed" && (
            <div className='p-4 mt-4 rounded-md bg-grey'>
              <p className='font-medium text-dark-grey'>
                You have a new follower!
              </p>
            </div>
          )}

          {type !== "followed" && type !== "info" && (
            <Link
              className='font-medium hover:underline line-clamp-1'
              to={`/${title?.length > 0 ? "blog" : "tweet"}/${blog_id}`}
            >
              "{title?.length > 0 ? title : des}"
            </Link>
          )}
        </div>
      </div>

      {type === "comment" && comment?.comment && (
        <p className='ml-14 pl-5 font-gelasio text-xl my-5'>
          {comment.comment}
        </p>
      )}

      <div className='ml-14 pl-5 mt-3 text-dark-grey flex gap-8'>
        <p>{getDay(createdAt)}</p>

        {(type === "comment" || type === "reply") && !reply && (
          <button onClick={handleReply} className='underline hover:text-black'>
            Reply
          </button>
        )}

        {(type === "comment" || type === "reply") && (
          <button
            onClick={(e) => handleDelete(comment._id, type, e.target)}
            className='underline hover:text-black'
          >
            Delete
          </button>
        )}
      </div>

      {isReplying && (
        <div className='mt-8'>
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

      {reply && (
        <div className='ml-20 p-5 bg-grey mt-5 rounded-md'>
          <div className='flex gap-3 mb-3'>
            <img
              src={author_profile_img}
              alt='pic'
              className='w-8 h-8 rounded-full'
            />
            <div>
              <h1 className='font-medium text-xl text-dark-grey'>
                <Link
                  className='mx-1 text-black underline'
                  to={`/user/${author_username}`}
                >
                  @{author_username}
                </Link>
                <span className='font-normal'> replied to </span>
                <Link
                  className='mx-1 text-black underline'
                  to={`/user/${username}`}
                >
                  @{username}
                </Link>
              </h1>
            </div>
          </div>
          <p>{reply.comment}</p>

          <button
            onClick={(e) => handleDelete(comment._id, "reply", e.target)}
            className='underline hover:text-black ml-14 mt-2'
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
