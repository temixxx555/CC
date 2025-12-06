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
          total_parent_comments -
          (commentData.childrenLevel === 0 && isDelete ? 1 : 0),
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
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

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
    setHasMoreReplies(children.length > 5);
    removeCommentsCards(index + 1);
  };

  return (
    <div className='w-full' style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className='my-3'>
        {/* Main comment container */}
        <div className='flex gap-2 group'>
          {/* Avatar */}
          <Link to={`/user/${commented_by_username}`} className='flex-shrink-0'>
            <img
              src={profile_img}
              alt={fullname}
              className='w-10 h-10 rounded-full hover:opacity-80 transition'
            />
          </Link>

          {/* Comment content */}
          <div className='flex-1 min-w-0'>
            {/* Comment bubble */}
            <div className='inline-block bg-grey rounded-2xl px-4 py-2.5 max-w-full break-words'>
              <Link
                to={`/user/${commented_by_username}`}
                className='hover:underline'
              >
                <p className='font-semibold text-sm text-dark-grey mb-0.5'>
                  {fullname}
                </p>
              </Link>
              <p className='text-[15px] leading-snug text-dark-grey'>
                {comment}
              </p>
            </div>

            {/* Action buttons row */}
            <div className='flex items-center gap-4 mt-1 ml-3 text-xs font-semibold text-dark-grey'>
              {/* Timestamp */}
              <span className='text-xs'>{getDay(commentedAt)}</span>

              {/* Reply button */}
              <button
                className='hover:underline'
                onClick={handleReplyClick}
              >
                Reply
              </button>

              {/* View/Hide replies */}
              {children.length > 0 && (
                <>
                  {commentData.isReplyLoaded ? (
                    <button
                      className='hover:underline flex items-center gap-1'
                      onClick={hideReplies}
                    >
                      <i className='fi fi-rr-angle-small-up text-sm'></i>
                      Hide {children.length} {children.length === 1 ? 'reply' : 'replies'}
                    </button>
                  ) : (
                    <button
                      className='hover:underline flex items-center gap-1'
                      onClick={() => loadReplies({ skip: 0 })}
                    >
                      <i className='fi fi-rr-angle-small-down text-sm'></i>
                      View {children.length} {children.length === 1 ? 'reply' : 'replies'}
                    </button>
                  )}
                </>
              )}

              {/* Delete button (only for author or commenter) */}
              {(username === commented_by_username ||
                username === blog_author) && (
                <button
                  className='hover:underline text-red ml-auto'
                  onClick={deleteComment}
                >
                  Delete
                </button>
              )}
            </div>

            {/* Reply input field */}
            {isReplying && (
              <div className='mt-3 ml-3'>
                <CommentField
                  action='reply'
                  index={index}
                  replyinTo={_id}
                  setReplying={setReplying}
                />
              </div>
            )}

            {/* Load more replies button */}
            {commentData.isReplyLoaded && hasMoreReplies && (
              <div className='mt-3 ml-3'>
                <button
                  onClick={loadMoreReplies}
                  disabled={isLoadingMoreReplies}
                  className='text-sm font-semibold text-dark-grey hover:underline flex items-center gap-1'
                >
                  {isLoadingMoreReplies ? (
                    <>
                      <i className='fi fi-rr-spinner animate-spin'></i>
                      Loading...
                    </>
                  ) : (
                    <>
                      <i className='fi fi-rr-angle-small-down text-sm'></i>
                      View more replies
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsCard;