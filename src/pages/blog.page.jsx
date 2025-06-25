import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer, { fetchComments } from "../components/comments.component";

export const blogStructure = {
  title: "",
  dess: "",
  content: "",
  author: { personal_info: {} },
  publishedAt: "",
  banner: "",
};
export const BlogContext = createContext({});
const BlogPage = () => {
  let { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [similarblogs, setSimilarblogs] = useState(null);
const [isLikedByUser,setLikedByUser] = useState(false);
const [commentsWrapper,setCommentsWrapper] = useState(false)
const [totalParentCommentsLoaded,setTotalParentsCommentsLoaaded] = useState(0); 

  const [loading, setLoading] = useState(true);
  let {
    title,
    content,
    banner,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    publishedAt,
  } = blog;

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {
        blog_id,
      })
      .then( async ({ data: { blog } }) => {
        blog.comments = await fetchComments({blog_id:blog._id,setParentCommentFunc:setTotalParentsCommentsLoaaded})
        // console.log(blog);

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
    resetState()
    fetchBlog();
  }, [blog_id]);
  const resetState =()=>{
    setBlog(blogStructure)
    setSimilarblogs(null)
    setLoading(true)
    setLikedByUser(false)
    // setCommentsWrapper(false)
    setTotalParentsCommentsLoaaded(0)
  }
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider value={{ blog, setBlog, isLikedByUser,setLikedByUser,setCommentsWrapper,setTotalParentsCommentsLoaaded,commentsWrapper,totalParentCommentsLoaded}}>
          
          
          <CommentsContainer />
          <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
            <img src={banner} alt='pic' className='aspect-video' />

            <div className='mt-12'>
              <h2 className=''>{title}</h2>

              <div className='flex max-sm:flex-col justify-between my-8'>
                <div className='flex gap-5 items-start '>
                  <img
                    src={profile_img}
                    alt='pic'
                    className='w-12 h-12 rounded-full'
                  />
                  <p className='capitalize'>
                    {fullname}
                    <br />@
                    <Link className='underline' to={`/user/${author_username}`}>
                      {author_username}
                    </Link>
                  </p>
                </div>
                <p className='text-dark-grey opacity-25 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5'>
                  Published on {getDay(publishedAt)}
                </p>
              </div>
            </div>

            <BlogInteraction />

            <div className="my-12 font-gelasio blog-page-content">
              {
                content[0].blocks.map((block,i)=>{
                  return(
                    <div key={i} className="my-4 md:my-8">
                      <BlogContent block={block} />
                    </div>
                  )
                })
              }
            </div>

            <BlogInteraction />

            {similarblogs != null && similarblogs.length ? (
              <>
                <h1 className='text-2xl mt-14 mb-10 font-medium'>
                  Similar Blogs
                </h1>

                {similarblogs.map((blog, i) => {
                  let {
                    author: { personal_info },
                  } = blog;
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.08 }}
                    >
                      <BlogPostCard content={blog} author={personal_info} />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : (
              ""
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
