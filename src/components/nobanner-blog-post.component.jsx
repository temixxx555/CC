import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import verifiedBadge from "../imgs/verified.png";

const MinimalBlogPost = ({ blog, index }) => {
  const {
    title,
    blog_id: id,
    author: {
      personal_info: { fullname, username, profile_img, isVerified },
    },
    publishedAt,
  } = blog;

  return (
    <Link
      to={`/blog/${id}`}
      className="flex gap-5 group rounded-xl p-4 transition-all duration-300 "
    >
      {/* Index Number */}
      <div className="flex-shrink-0 text-4xl font-bold text-gray-300 group-hover:text-gray-400 transition-colors duration-300 w-12 pt-1">
        {index < 9 ? `0${index + 1}` : index + 1}
      </div>

      {/* Blog Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h1 className="text-xl font-semibold text-dark group-hover:text-black transition-colors duration-200 line-clamp-2 mb-3">
          {title}
        </h1>

        {/* Author Info */}
        <div className="flex items-center gap-2 text-sm">
          <img
            src={profile_img}
            alt="profile"
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="font-medium text-dark-grey truncate">{fullname}</span>
            {isVerified && (
              <img
                src={verifiedBadge}
                alt="verified"
                className="w-4 h-4 flex-shrink-0"
              />
            )}
            <span className="text-gray-400">·</span>
            <span className="text-gray-500 whitespace-nowrap">{getDay(publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MinimalBlogPost;