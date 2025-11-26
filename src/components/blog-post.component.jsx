import { getDay } from "../common/date";
import { Link } from "react-router-dom";
import verifiedBadge from "../imgs/verified.png";
import BlogContent from "./blog-content.component";

const BlogPostCard = ({ content, contents, author }) => {
  const {
    blog_id: id,
    banner,
    publishedAt,
    title,
    des,
    tags,
    activity: { total_likes, total_comments, total_reads },
  } = content;

  const { fullname, profile_img, username, isVerified } = author;

  const previewText =
    contents?.[0]?.blocks?.[0]?.data?.text?.replace(/&nbsp;/g, " ") || "";

  return (
    <Link
      to={`/blog/${id}`}
      className='flex gap-3 border-b border-grey p-4 hover:shadow-lg transition-colors cursor-pointer group'
    >
      {/* Avatar */}
      <Link to={`/user/${username}`} onClick={(e) => e.preventDefault()}>
        <img
          src={profile_img}
          alt='profile'
          className='w-12 h-12 rounded-full hover:opacity-80 transition flex-shrink-0'
        />
      </Link>

      {/* Content Container */}
      <div className='flex-1 min-w-0'>
        {/* Header: Author info + timestamp */}
        <div className='flex items-center gap-1 mb-2 flex-wrap'>
          <Link
            to={`/user/${username}`}
            onClick={(e) => e.preventDefault()}
            className='hover:underline'
          >
            <p className='font-bold text-dark-grey'>{fullname}</p>
          </Link>

          {isVerified && (
            <img src={verifiedBadge} alt='verified' className='w-4 h-4' />
          )}

          <span className='text-gray-500  hover:underline'>@{username}</span>

          <span className='text-gray-500  mx-1'>·</span>

          <span className='text-gray-500  hover:underline text-sm'>
            {getDay(publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className='text-base font-semibold  line-clamp-2 mb-2'>{title}</h1>

        {/* Preview */}
        {previewText ? (
          <p className='text-dark text-sm leading-relaxed line-clamp-3 mb-3'>
            {previewText.slice(0, 210)}...
          </p>
        ) : (
          <p className='text-dark italic text-sm mb-3'>Read more ...</p>
        )}

        {/* Banner Image */}
        {banner && (
          <div className='mb-3 rounded-2xl overflow-hidden border border-grey'>
            <img
              src={banner}
              alt='banner'
              className='w-full max-h-96 object-cover hover:brightness-95 transition'
            />
          </div>
        )}

        {/* Tags + Reactions */}
        <div className='flex items-center flex-wrap gap-1 text-sm text-gray-500 max-w-xs -ml-2'>
          {/* Tags */}
          <div className='flex gap-2'>
            {tags?.[0] && (
              <span className='bg-blue-50  text-gray-500 px-3 py-1 rounded-full text-xs font-medium line-clamp-1'>
                #{tags[0]}
              </span>
            )}
            {/* {tags?.[1] && (
              <span className='bg-blue-50 text-gray-500 px-3 py-1 rounded-full text-xs font-medium line-clamp-1'>
                #{tags[1]}
              </span>
            )} */}
          </div>

          {/* Likes */}
          <button
            className='flex items-center gap-1 px-2 py-2 rounded-full transition group/btn'
            onClick={(e) => e.preventDefault()}
          >
            <i className='fi fi-rr-heart text-lg'></i>
            <span className='text-xs'>
              {total_likes > 0 ? total_likes : "0"}
            </span>
          </button>

          {/* Comments */}
          <button
            className='flex items-center gap-1 px-2 py-2 rounded-full transition group/btn'
            onClick={(e) => e.preventDefault()}
          >
            <i className='fi fi-rr-comment-dots text-lg'></i>
            <span className='text-xs'>
              {total_comments > 0 ? total_comments : "0"}
            </span>
          </button>

          {/* Reads */}
          <button
            className='flex items-center gap-1 px-2 py-2 rounded-full transition group/btn'
            onClick={(e) => e.preventDefault()}
          >
            <i className='fi fi-rr-eye text-lg'></i>
            <span className='text-xs'>
              {total_reads > 0 ? total_reads : "0"}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;
