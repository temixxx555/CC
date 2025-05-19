import { useContext, useState } from "react";
import { userContext } from "../App";
import toast from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({
  action,
  index = undefined,
  replyinTo = undefined,
  setReplying,
}) => {
  let {
    blog,
    setBlog,
    blog: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setTotalParentsCommentsLoaaded,
  } = useContext(BlogContext);
  let {
    userAuth: { access_token, username, fullname, profile_img },
  } = useContext(userContext);
  const [comment, setComment] = useState("");

  const handleCommentFunction = () => {
    if (!access_token) {
      return toast.error("Login to Leave a comment");
    }
    if (!comment.length) {
      toast.error("Write to leave comment");
      return;
    }
  
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        {
          _id,
          blog_author,
          comment,
          replying_to: replyinTo,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setComment("");
  
        data.commented_by = {
          personal_info: { username, profile_img, fullname },
        };
  
        let newCommentArr;
  
        if (replyinTo) {
          // ✅ Check if parent comment still exists
          if (!commentsArr[index] || commentsArr[index]._id !== replyinTo) {
            toast.error("Parent comment not found. Reloading...");
            window.location.reload();
            return;
          }
  
          commentsArr[index].children.push(data._id);
  
          data.childrenLevel = commentsArr[index].childrenLevel + 1;
          data.parentIndex = index;
  
          commentsArr[index].isReplyLoaded = true;
          commentsArr.splice(index + 1, 0, data);
  
          newCommentArr = commentsArr;
          setReplying(false);
        } else {
          data.childrenLevel = 0;
          newCommentArr = [data, ...commentsArr];
        }
  
        let parentCommentIncrementVal = replyinTo ? 0 : 1;
  
        setBlog({
          ...blog,
          comments: { ...comments, results: newCommentArr },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments:
              total_parent_comments + parentCommentIncrementVal,
          },
        });
  
        setTotalParentsCommentsLoaaded(
          (preVal) => preVal + parentCommentIncrementVal
        );
      })
      .catch((err) => {
        const errorMsg = err?.response?.data?.error;
      
        if (errorMsg === "Parent comment not found") {
          toast.error("The comment you were replying to has been deleted. Reloading...");
          window.location.reload();
        } else {
          console.error(err);
          toast.error("Something went wrong. Please try again.");
        }
      });
    }
  
  return (
    <>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder='Leave a Comment...'
        className='input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto  '
      ></textarea>
      <button className='btn-dark mt-5 px-10 ' onClick={handleCommentFunction}>
        {action}
      </button>
    </>
  );
};

export default CommentField;
