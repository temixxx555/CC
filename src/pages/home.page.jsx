import { useContext, useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import axios from "axios";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { ActiveTabButons } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreData from "../components/load-more.component";
import { Link, useNavigate } from "react-router-dom";
import { userContext } from "../App";
// import Alerts from "../components/alerts";

const Home = () => {
  const {
    userAuth: { access_token },
  } = useContext(userContext);
  let [blogs, setBlogs] = useState(null);
  let [feed, setFeed] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [users, setUsers] = useState(null);
  let [pageState, setPageState] = useState("home");
  let navigate = useNavigate();
  let categories = [
    "events",
    "songs",
    "football",
    "chapel",
    "anime",
    "education",
    "competitions",
    "rumour",
    "foods",
    "brands",
    "important",
    "Western",
  ];
  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blog", { page })
      .then(async ({ data }) => {
        let formateData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          counteRoute: "/all-latest-blogs-count",
        });
        console.log(formateData,"looo");

        setBlogs(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchForYou = ({ page = 1 }) => {
    if (!access_token) {
      return console.log("not valid");
    }
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/for-you",
        { page },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formateData = await filterPaginationData({
          state: feed,
          data: data.blogs,
          page,
          user:access_token,
          counteRoute: "/all-latest-feed",
        });
              console.log(formateData,"looo");


        setFeed(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getallUsers = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/all-users")
      .then(({ data }) => {
        setUsers(data.count);
        // console.log(data.count);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchBlogByCategories = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formateData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          counteRoute: "/search-blogs-count",
          data_to_send: { tag: pageState },
        });

        setBlogs(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const loadBlogByCategory = (e) => {
      let category = e.target.innerText.replace("+", "").trim().toLowerCase();
    setBlogs(null);

    if (pageState == category) {
      setPageState("home");
      return;
    }
    setPageState(category);
  };
  useEffect(() => {
    ActiveTabButons.current.click();
    if (pageState == "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogByCategories({ page: 1 });
    }
    if (!feed) {
      console.log("yes");

      fetchForYou({ page: 1 });
    }
    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState, access_token]);
  useEffect(() => {
    getallUsers();
    // console.log("i am getting called");
  }, []);
  return (
    <AnimationWrapper>
      {/* <Alerts /> */}
      <section className='h-cover flex justify-center gap-10 '>
        {/* latest blogs  */}
        <div className='w-full'>
          <p className='font-bold text-3xl ml-9 '>
            {users} <span className='text-xl'>Students</span>
          </p>

          {/* Show on small screens only */}
        <div className="md:hidden mb-6">
            <h1 className="font-medium text-lg mb-4">Stories across Bowen University ✨</h1>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, i) => (
                <button
                  key={i}
                  onClick={loadBlogByCategory}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    pageState === category
                      ? "bg-black text-white border-black"
                      : "border-gray-300 text-dark-grey hover:bg-gray-100"
                  }`}
                >
                  {category} +
                </button>
              ))}
            </div>
          </div>

          <InPageNavigation
            routes={[pageState, "trending blogs", "foryou"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs == null ? (
                <Loader />
              ) : blogs.results.length ? (
                blogs.results.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <BlogPostCard
                        content={blog}
                        contents={blog.content}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message={"No blogs Published"} />
              )}
              <LoadMoreData
                state={blogs}
                fetchData={
                  pageState == "home" ? fetchLatestBlogs : fetchBlogByCategories
                }
              />
            </>
            <>
              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={"md:hidden"}
                    >
                      <MinimalBlogPost  contents={blog.content} blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message={"No trending blogs "} />
              )}
            </>
            <>
              {!access_token ? (
                <NoDataMessage message={"Please login to see your feed"} />
              ) : feed == null ? (
                <Loader />
              ) : feed.results.length ? (
                feed.results.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <BlogPostCard
                        contents={blog.content}
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message={"No blogs Published"} />
              )}
              <LoadMoreData state={feed} fetchData={fetchForYou} />
            </>
          </InPageNavigation>
        </div>

        {/* filters and trending */}
        <div className='min-w-[40%]  lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden'>
          <div className='flex flex-col gap-10'>
            <div className=''>
              <h1 className='font-medium text-xl mb-6'>
               Stories across Bowen University ✨
              </h1>
              <div className='flex gap-3 flex-wrap'>
                {categories.map((category, i) => {
                  return (
                    <button
                      onClick={loadBlogByCategory}
                      className={
                        "tag " +
                        (pageState == category ? "bg-black text-white" : "")
                      }
                      key={i}
                    >
                      {category} +
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className='font-medium text-xl mb-8'>
                Trending
                <i className='fi fi-rr-arrow-trend-up'></i>
              </h1>
              <>
                {trendingBlogs == null ? (
                  <Loader />
                ) : trendingBlogs.length ? (
                  trendingBlogs.map((blog, i) => {
                    return (
                      <AnimationWrapper
                        key={i}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={"hidden md:block"}
                      >
                        <MinimalBlogPost blog={blog} index={i} />
                      </AnimationWrapper>
                    );
                  })
                ) : (
                  <NoDataMessage message={"No trending blogs published "} />
                )}
              </>
            </div>
          </div>
        </div>
        <Link
          to='/editor'
          className='fixed bottom-24 right-5 z-40 bg-grey   w-14 h-14 rounded-full shadow-lg flex items-center justify-center md:hidden'
        >
          <i className='fi fi-rr-file-edit text-2xl'></i>
        </Link>
      </section>
    </AnimationWrapper>
  );
};

export default Home;
