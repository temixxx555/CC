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
    activity: { total_likes, total_comments,total_reads },
  } = content;

  const { fullname, profile_img, username, isVerified } = author;

  const previewText =
    contents?.[0]?.blocks?.[0]?.data?.text?.replace(/&nbsp;/g, " ") || "";

  return (
    <Link
      to={`/blog/${id}`}
      className="flex flex-col md:flex-row items-start gap-5 border border-grey rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
    >
      {/* Banner Image */}
      <div className="md:w-1/3 w-full h-48 md:h-48 overflow-hidden">
        <img
          src={banner}
          alt="banner"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-5">
        {/* Author + Date */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <img
            src={profile_img}
            alt="profile"
            className="w-7 h-7 rounded-full object-cover"
          />
          <p className="font-medium text-dark-grey">{fullname}</p>
          <span className="text-gray-500">@{username}</span>
          {isVerified && (
            <img
              src={verifiedBadge}
              alt="verified"
              className="w-4 h-4 ml-1 inline-block"
            />
          )}
          <span className="ml-auto text-gray-500">{getDay(publishedAt)}</span>
        </div>

        {/* Title */}
        <h1 className="text-lg md:text-xl font-semibold text-da line-clamp-2 transition-colors duration-200">
          {title}
        </h1>

        {/* Preview */}
        {previewText ? (
          <p className="mt-2 text-dark leading-relaxed line-clamp-8 md:line-clamp-2">
            {previewText.slice(0, 210)}...
          </p>
        ) : (
          <p className="text-dark italic mt-2">Read more ...</p>
        )}

        {/* Tags + Reactions */}
        <div className="flex items-center flex-wrap gap-4 mt-4 text-sm">
          {tags?.[0] && (
            <span className="bg-blue-50 text-gray-500 px-3 py-1 rounded-full text-xs font-medium">
              #{tags[0]}
            </span>
          )}
          {tags?.[1] && (
            <span className="bg-blue-50 text-gray-500 -ml-2 md:-ml-2 px-3 py-1 rounded-full text-xs font-medium">
              #{tags[1]}
            </span>
          )}
          <div className="flex items-center gap-1 text-gray-500">
            <i className="fi fi-rr-heart text-lg"></i>
            <span>{total_likes}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <i className="fi fi-rr-comment-dots text-lg"></i>
            <span>{total_comments}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <i className="fi fi-rr-eye text-lg"></i>
            <span>{total_reads}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;
