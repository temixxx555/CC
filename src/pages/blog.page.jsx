import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer, {
  fetchComments,
} from "../components/comments.component";

export const blogStructure = {
  title: "",
  dess: "",
  content: "",
  author: { personal_info: {} },
  publishedAt: "",
  activity: { total_reads: 0 },
  banner: "",
};
export const BlogContext = createContext({});
const BlogPage = () => {
  let { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [similarblogs, setSimilarblogs] = useState(null);
  const [isLikedByUser, setLikedByUser] = useState(false);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentsCommentsLoaaded] =
    useState(0);

  const [loading, setLoading] = useState(true);
  let {
    title,
    content,
    banner,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    activity: { total_reads },
    publishedAt,
  } = blog;

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {
        blog_id,
      })
      .then(async ({ data: { blog } }) => {
        blog.comments = await fetchComments({
          blog_id: blog._id,
          setParentCommentFunc: setTotalParentsCommentsLoaaded,
        });
        console.log(blog, "pooo");

        setBlog(blog);

        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
            tag: blog.tags[0],
            limit: 6,
            eliminate_blog: blog_id,
          })
          .then(({ data }) => {
            setSimilarblogs(data.blogs);
          });

        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blog_id]);
  const resetState = () => {
    setBlog(blogStructure);
    setSimilarblogs(null);
    setLoading(true);
    setLikedByUser(false);
    // setCommentsWrapper(false)
    setTotalParentsCommentsLoaaded(0);
  };
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            isLikedByUser,
            setLikedByUser,
            setCommentsWrapper,
            setTotalParentsCommentsLoaaded,
            commentsWrapper,
            totalParentCommentsLoaded,
          }}
        >
          <CommentsContainer />
          <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
            <img
              src={banner}
              alt='pic'
              className='aspect-video object-cover rounded-2xl shadow-md'
            />

            <div className='mt-12'>
              <h2 className=''>{title}</h2>

              <div className='flex  justify-between my-8'>
                <div className='flex gap-5 items-start '>
                  <Link className='' to={`/user/${author_username}`}>
                    <img
                      src={profile_img}
                      alt='pic'
                      className='w-12 h-12 rounded-full'
                    />
                  </Link>
                  <p className='capitalize'>
                    <Link className='' to={`/user/${author_username}`}>
                      {fullname}
                    </Link>
                    <br />
                    <Link
                      className='underline text-blue-500'
                      to={`/user/${author_username}`}
                    >
                      @{author_username}
                    </Link>
                  </p>
                </div>
                <div className='text-sm text-gray-500 italic  max-sm:mt-6 max-sm:ml-12 max-sm:pl-5'>
                  Published on {getDay(publishedAt)}
                  <p className="text-black font-semibold">{total_reads} reads</p>
                </div>
              </div>
            </div>

            <BlogInteraction />

            <div className='my-8 font-gelasio blog-page-content'>
              {content[0].blocks.map((block, i) => {
                return (
                  <div key={i} className='my-4 md:my-4'>
                    <BlogContent block={block} />
                  </div>
                );
              })}
            </div>

            <BlogInteraction />

            {/* Similar Blogs */}
            {similarblogs && similarblogs.length > 0 && (
              <div className='mt-16'>
                <h2 className='text-2xl font-semibold mb-8 border-l-4 border-black pl-3'>
                  Similar Blogs
                </h2>

                <div className='grid sm:grid-cols-2 gap-8'>
                  {similarblogs.map((blog, i) => {
                    const {
                      author: { personal_info },
                    } = blog;
                    return (
                      <AnimationWrapper
                        key={i}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      >
                        <BlogPostCard content={blog} author={personal_info} />
                      </AnimationWrapper>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
