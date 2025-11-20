import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { userContext } from "../App";
import axios from "axios";
const BlogStats = ({ statss }) => {
  return (
    <div className='flex max-lg:mb-6 max-lg:pb-6 gap-2  border-grey border-b'>
      {Object.keys(statss).map((key, i) => {
        return !key.includes("parent") ? (
          <div
            key={i}
            className={
              "flex flex-col items-center w-full h-full justify-center p-4 px-6 " +
              (i != 0 ? "border-grey border-l " : " ")
            }
          >
            <h1 className='text-xl lg:text-2xl mb-2'>
              {statss[key].toLocaleString()}
            </h1>
            <p className='max-lg text-dark-grey capitalize'>
              {key.split("_")[1]}
            </p>
          </div>
        ) : (
          ""
        );
      })}
    </div>
  );
};

export const ManagePublishedBlogCard = ({ blog }) => {
  let { banner, blog_id, title, publishedAt, activity } = blog;
  let {
    userAuth: { access_token },
  } = useContext(userContext);
  let [stats, SetStats] = useState(false);
  return (
    <>
      <div className='flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center'>
        <img
          src={banner}
          alt='pic'
          className='max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover'
        />

        <div className='flex flex-col justify-between py-2 w-full min-w-[300px]'>
          <div>
            <Link
              className='blog-title mb-4 hover:underline  '
              to={`/blog/${blog_id}`}
            >
              {title}
            </Link>

            <p className='line-clamp-1'>Published on {getDay(publishedAt)}</p>
          </div>
          <div className='flex gap-6 mt-3'>
            <Link className='pr-4 py-2 underline' to={`/editor/${blog_id}`}>
              Edit
            </Link>
            <button
              onClick={() => SetStats((preVal) => !preVal)}
              className='lg:hidden pr-4 py-2 underline'
            >
              stats
            </button>
            <button
              onClick={(e) => deleteBlog(blog, access_token, e.target)}
              className='pr-4 py-2 underline text-red '
            >
              Delete
            </button>
          </div>
        </div>

        <div className='max-lg:hidden '>
          <BlogStats statss={activity} />
        </div>
      </div>
      {stats ? (
        <div className='lg:hidden'>
          <BlogStats statss={activity} />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export const ManageDraftBlog = ({ blog }) => {
  let { title, des, blog_id, index } = blog;
  let {
    userAuth: { access_token },
  } = useContext(userContext);
  index++;
  return (
    <div className='flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey '>
      <h1 className='blog-index text-center pl-4 md:pl-6 flex-none'>
        {index < 10 ? "0" + index : index}
      </h1>
      <div>
        <h1 className='blog-title mb-3'>{title}</h1>
        <p className='line-clamp-2 font-gelasio'>
          {des.length ? des : "No description"}
        </p>
        <div className='flex gap-6 mt-3'>
          <Link className='pr-4 py-2 underline' to={`/editor/${blog_id}`}>
            Edit
          </Link>

          <button
            onClick={(e) => deleteBlog(blog, access_token, e.target)}
            className='pr-4 py-2 underline text-red '
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const deleteBlog = (blog, access_token, target) => {
   if (!window.confirm("Are you sure you want to delete this comment?")) return;
  let { index, blog_id, setateFunc } = blog;

  target.setAttribute("disabled", true);

  axios
    .post(
      import.meta.env.VITE_SERVER_DOMAIN + "/delete-blog",
      {
        blog_id,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )
    .then(({ data }) => {
      target.removeAttribute("disabled");

      setateFunc((preVal) => {
        let { deletedDocCount, totalDocs, results } = preVal;
        results.splice(index, 1);
        if (!deletedDocCount) {
          deletedDocCount = 0;
        }
        if (!results.length && totalDocs - 1 > 0) {
          return null;
        }
        return {
          ...preVal,
          totalDocs: totalDocs - 1,
          deleteDocCount: deletedDocCount + 1,
        };
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
