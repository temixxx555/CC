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
      className="flex items-start gap-5 group hover:bg-gray-50 rounded-xl p-3 transition-all duration-300"
    >
      {/* Index Number */}
      <div className="text-3xl font-bold text-gray-300  transition-colors duration-300 min-w-[2.5rem] text-center">
        {index < 9 ? `0${index + 1}` : index + 1}
      </div>

      {/* Blog Info */}
      <div className="flex flex-col">
        {/* Author Info */}
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
          <img
            src={profile_img}
            alt="profile"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="font-medium line-clamp-1 text-dark-grey">{fullname}</span>
          <span className="text-dark-grey line-clamp-1">@{username}</span>
          {isVerified && (
            <img
              src={verifiedBadge}
              alt="verified"
              className="w-4 h-4 ml-1 inline-block"
            />
          )}
          <span className="ml-auto text-gray-400 text-xs">
            {getDay(publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-lg md:text-xl font-semibold text-dark  transition-colors duration-200 line-clamp-2">
          {title}
        </h1>
      </div>
    </Link>
  );
};

export default MinimalBlogPost;
