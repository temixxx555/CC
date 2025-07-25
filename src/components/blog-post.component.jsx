import { getDay } from "../common/date";
import {Link} from "react-router-dom"


const BlogPostCard = ({ content, author }) => {
  let {
    blog_id: id,
    banner,
    publishedAt,
    title,
    des,
    tags,
    activity: { total_likes,total_comments },
  } = content;
  let { fullname, profile_img, username } = author;
  return (
   <Link to = {`/blog/${id}`} className="flex gap-8 items-center border-b border-grey pb-5 mb-4">
    <div className='w-full'>
      <div className='gap-2 flex items-center mb-7'>
        <img
          src={profile_img}
          alt='profileimg'
          className='w-6 h-6 rounded-full'
        />
        <p className='line-clamp-1 '>
          {fullname} @{username}
        </p>
        <p className='min-w-fit'>{getDay(publishedAt)}</p>
      </div>
      
    <h1 className="blog-title">{title}</h1>
    <p className="my-3 text-xl font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2 ">{des}</p>

    <div className="flex gap-2 mt-7">
      <span className="btn-light text-[11px] md:text-[15px] py-1 px-4">{tags[0]}</span>
      <span className="ml-1 flex items-center gap-2 text-dark-grey">
        <i className="fi fi-rr-heart text-xl"></i>
        {total_likes}
      </span>
      <span className="ml-1 flex items-center gap-2 text-dark-grey">
        <i className="fi fi-rr-comment-dots text-xl"></i>
        {total_comments}
      </span>
    </div>
    </div>
    <div className="h-28 aspect-square bg-grey">
      <img src={banner} className="w-full h-full aspect-square object-cover" alt="banner" />
    </div>
   </Link>

  );
};

export default BlogPostCard;
