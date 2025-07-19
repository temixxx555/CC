import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { userContext } from "../App";
import toast from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
    isLikedByUser,
    setLikedByUser,
    setCommentsWrapper
  } = useContext(BlogContext);

  let {
    userAuth: { username, access_token },
  } = useContext(userContext);

useEffect(()=>{
if(access_token){
  axios
  .post(
    import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user",
    { _id},
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  )
  .then(({data:{result}})=>{
    setLikedByUser(Boolean(result))
    
  })
}
},[])

const handleLiking = () => {
  if (!access_token) {
    return toast.error("Please Login to like the blog");
  }

  const optimisticLiked = !isLikedByUser;
  const newTotalLikes = optimisticLiked ? total_likes + 1 : total_likes - 1;

  setLikedByUser(optimisticLiked);
  setBlog({ ...blog, activity: { ...activity, total_likes: newTotalLikes } });

  axios
    .post(
      import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
      { _id, islikedByUser:isLikedByUser },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )
    .then(({ data: { liked_by_user } }) => {
      if (liked_by_user !== optimisticLiked) {
        // Revert if backend disagrees
        setLikedByUser(liked_by_user);
        const correctedLikes = liked_by_user ? total_likes + 1 : total_likes - 1;
        setBlog({ ...blog, activity: { ...activity, total_likes: correctedLikes } });
      }
    })
    .catch((err) => {
      // Revert on failure
      toast.error("Failed to like blog. Try again.");
      setLikedByUser(isLikedByUser);
      setBlog({ ...blog, activity: { ...activity, total_likes } });
      console.error(err);
    });
};

  return (
    <>
      <hr className='border-grey my-2' />
      <div className='flex gap-6 justify-between'>
        <div className='flex gap-3 items-center'>
          <button
            className={
              "w-10 h-10 rounded-full flex items-center justify-center " +
              (isLikedByUser ? "bg-red/20 text-red " : "bg:grey/80")
            }
            onClick={handleLiking}
          >
            <i
              className={
                "fi " + (isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")
              }
            ></i>
          </button>
          <p className='text-xl text-dark-grey'>{total_likes}</p>

          <button className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/80' onClick={()=>setCommentsWrapper(prevVal => !prevVal)}>
            <i className='fi fi-rr-comment-dots'></i>
          </button>
          <p className='text-xl text-dark-grey'>{total_comments}</p>
        </div>
        <div className='flex gap-6 items-center'>
          {username == author_username ? (
            <Link
              to={`/editor/${blog_id}`}
              className='underline hover:text-purple'
            >
              Edit
            </Link>
          ) : (
            ""
          )}
          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}
          >
            <i className='fi fi-brands-twitter text-xl hover:text-twitter'></i>
          </Link>
        </div>
      </div>

      <hr className='border-grey my-2' />
    </>
  );
};

export default BlogInteraction;
