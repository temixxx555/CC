import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import NotificationCommentField from "./notification-comment-field.component";
import { userContext } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
const NotificationCard = ({ data, index, notificationState }) => {
  let [isReplying, setIsReplying] = useState(false);
  let {
    seen,
    comment,
    reply,
    createdAt,
    blog: { _id, blog_id, title },
    replied_on_comment,
    type,
    user,
    user: {
      personal_info: { fullname, username, profile_img },
    },
    _id: notification_id,
  } = data;
  let {
    userAuth: {
      username: author_username,
      profile_img: author_profile_img,
      access_token,
    },
  } = useContext(userContext);
  console.log(access_token);

  let {
    notifications,
    notifications: { results, totalDocs },
    setNotifications,
  } = notificationState;
  const handleReply = () => {
    setIsReplying((preval) => !preval);
  };
  const handleDelete = (comment_id, type, target) => {
    target.disabled = true;
    const idToDelete = type === "reply" ? data.reply._id : comment_id;

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
          src={profile_img}
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
              {type == "like"
                ? "liked your blog"
                : type == "comment"
                ? "commented on"
                : "replied on"}
            </span>
          </h1>
          {type == "reply" ? (
            <div className='p-4 mt-4 rounded-md bg-grey'>
              <p>{replied_on_comment.comment}</p>
            </div>
          ) : (
            <Link
              className='font-medium hover:underline line-clamp-1'
              to={`/blog/${blog_id}`}
            >{`"${title}"`}</Link>
          )}
        </div>
      </div>
      {type != "like" ? (
        <p className='ml-14 pl-5 font-gelasio text-xl my-5 '>
          {comment.comment}
        </p>
      ) : (
        ""
      )}
      <div className='ml-14 pl-5 mt-3 text-dark-grey flex gap-8'>
        <p>{getDay(createdAt)}</p>

        {type != "like" ? (
          <>
            {!reply ? (
              <button
                onClick={handleReply}
                className='underline hover:text-black'
              >
                Reply
              </button>
            ) : (
              ""
            )}
            <button
              onClick={(e) => handleDelete(comment._id, "comment", e.target)}
              className='underline hover:text-black'
            >
              Delete
            </button>
          </>
        ) : (
          ""
        )}
      </div>
      {isReplying ? (
        <div className='mt-8 '>
          <NotificationCommentField
            _id={_id}
            blog_author={user}
            index={index}
            replyingTo={comment._id}
            setIsReplying={setIsReplying}
            notification_id={notification_id}
            notificationData={notificationState}
          />
        </div>
      ) : (
        ""
      )}
      {reply ? (
        <div className='ml-20 p-5 bg-grey mt-5 rounded-md '>
          <div className='flex gap-3 mb-3'>
            <img
              src={author_profile_img}
              alt='pic'
              className='w-8 h-8 rounded-full'
            />
            <div>
              <h1 className='fonnt-medium text-xl text-dark-grey'>
                <Link
                  className='mx-1 text-black underline '
                  to={`/user/${author_username}`}
                >
                  @{author_username}
                </Link>

                <span className='font-normal'>replied to</span>

                <Link
                  className='mx-1 text-black underline '
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
      ) : (
        ""
      )}
    </div>
  );
};

export default NotificationCard;
