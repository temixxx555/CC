import { useContext, useState } from "react";
import { getDay } from "../common/date";
import { userContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";
import { Link } from "react-router-dom";

const CommentsCard = ({ index, leftVal, commentData }) => {
  let {
    commented_by: {
      personal_info: { profile_img, fullname, username: commented_by_username },
    },
    commentedAt,
    comment,
    children,
    _id,
  } = commentData;

  let {
    setBlog,
    blog,
    blog: {
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_parent_comments },
      author: {
        personal_info: { username: blog_author },
      },
    },
    setTotalParentsCommentsLoaaded,
  } = useContext(BlogContext);

  let {
    userAuth: { access_token, username },
  } = useContext(userContext);

  const [isReplying, setReplying] = useState(false);
  const [skipCount, setSkipCount] = useState(0);
  const [isLoadingMoreReplies, setIsLoadingMoreReplies] = useState(false);
  const [hasMoreReplies, setHasMoreReplies] = useState(children.length > 5);

  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("log in to leave a reply");
    }
    setReplying((preVal) => !preVal);
  };

  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (
        commentsArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }
    return startingPoint;
  };

  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (
        commentsArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentsArr.splice(startingPoint, 1);
        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }
    if (isDelete) {
      let parentIndex = getParentIndex();
      if (parentIndex != undefined) {
        commentsArr[parentIndex].children = commentsArr[
          parentIndex
        ].children.filter((child) => child !== _id);
        if (!commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }
      commentsArr.splice(index, 1);
    }
    if (commentData.childrenLevel === 0 && isDelete) {
      setTotalParentsCommentsLoaaded((preVal) => preVal - 1);
    }
    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments - (commentData.childrenLevel === 0 && isDelete ? 1 : 0),
      },
    });
  };

  const loadReplies = () => {
    if (children.length) {
      hideReplies();
  
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {
          _id,
          skip: 0,
        })
        .then(({ data: { replies } }) => {
          commentData.isReplyLoaded = true;
  
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel = commentData.childrenLevel + 1;
            commentsArr.splice(index + 1 + i, 0, replies[i]);
          }
  
          setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
  
          // ✅ RESET skipCount and hasMoreReplies properly
          setSkipCount(replies.length);
          setHasMoreReplies(replies.length >= 5);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  

  const loadMoreReplies = () => {
    setIsLoadingMoreReplies(true);
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {
        _id,
        skip: skipCount,
      })
      .then(({ data: { replies } }) => {
        for (let i = 0; i < replies.length; i++) {
          replies[i].childrenLevel = commentData.childrenLevel + 1;
          commentsArr.splice(index + 1 + skipCount + i, 0, replies[i]);
        }
        setBlog({ ...blog, comments: { ...comments, results: commentsArr } });

        setSkipCount((prev) => prev + replies.length);
        if (replies.length < 5) {
          setHasMoreReplies(false);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoadingMoreReplies(false);
      });
  };

  const deleteComment = (e) => {
    if (!commentData || !commentsArr[index]) return;
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    e.target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        { _id },
        {
          headers: {
            Authorization: `Bearer ${access_token} `,
          },
        }
      )
      .then(() => {
        e.target.removeAttribute("disabled");
        removeCommentsCards(index + 1, true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    setSkipCount(0);
    setHasMoreReplies(children.length > 5); // Reset properly
    removeCommentsCards(index + 1);
  };
  

  return (
    <div className='w-full' style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className='my-5 p-6 rounded-md border border-grey'>
         <Link to={`/user/${commented_by_username}`}>
        <div className='flex gap-3 items-center mb-8'>
          <img src={profile_img} alt='image' className='w-6 h-6 rounded-full' />
          <p className='line-clamp-1'>
            {fullname} @{commented_by_username}
          </p>
          <p className='min-w-fit'>{getDay(commentedAt)}</p>
        </div>
        </Link>
        <p className='font-gelasio text-xl ml-3'>{comment}</p>
        <div className='flex gap-5 items-center mt-5'>
          {commentData.isReplyLoaded ? (
            <button
              className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2'
              onClick={hideReplies}
            >
              <i className='fi fi-rs-comment-dots'></i>
              Hide Reply
            </button>
          ) : (
            <button
              className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2'
              onClick={() => loadReplies({ skip: 0 })}
            >
              <i className='fi fi-rs-comment-dots'></i>
              {children.length} Reply
            </button>
          )}
          <button className='underline' onClick={handleReplyClick}>
            Reply
          </button>

          {username === commented_by_username || username === blog_author ? (
            <button
              className='p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center'
              onClick={deleteComment}
            >
              <i className='fi fi-rr-trash pointer-events-none'></i>
            </button>
          ) : (
            ""
          )}
        </div>

        {isReplying ? (
          <div className='mt-8'>
            <CommentField
              action='reply'
              index={index}
              replyinTo={_id}
              setReplying={setReplying}
            />
          </div>
        ) : (
          ""
        )}

        {/* Load more replies */}
        {commentData.isReplyLoaded && hasMoreReplies && (
          <div className="mt-4">
            <button
              onClick={loadMoreReplies}
              disabled={isLoadingMoreReplies}
              className="text-blue-600 hover:underline"
            >
              {isLoadingMoreReplies ? "Loading..." : "Load More Replies"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsCard;
