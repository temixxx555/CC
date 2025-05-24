import { useContext, useState } from "react";
import { userContext } from "../App";
import toast from "react-hot-toast";
import axios from "axios";
const NotificationCommentField = ({
  _id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  setIsReplying,
  notification_id,
  notificationData,
}) => {
  let [comment, setComment] = useState("");
  let { _id: user_id } = blog_author;
  let {
    userAuth: { access_token },
  } = useContext(userContext);
  let {
    notifications,
    notifications: { results },
    setNotifications,
  } = notificationData;
  const handleCommentFunction = () => {
    if (!comment.length) {
      toast.error("Write to leave comment");
      return;
    }

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to: replyingTo,
          notification_id,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setIsReplying(false);

        results[index].reply = { comment, _id: data._id };
        setNotifications({ ...notifications, results });
      })
      .catch((err) => {
        const errorMsg = err?.response?.data?.error;

        if (errorMsg === "Parent comment not found") {
          toast.error(
            "The comment you were replying to has been deleted. Reloading..."
          );
          window.location.reload();
        } else {
          console.error(err);
          toast.error("Something went wrong. Please try again.");
        }
      });
  };
  return (
    <>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder='Leave a reply...'
        className='input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto  '
      ></textarea>
      <button className='btn-dark mt-5 px-10 ' onClick={handleCommentFunction}>
        Reply
      </button>
    </>
  );
};

export default NotificationCommentField;
