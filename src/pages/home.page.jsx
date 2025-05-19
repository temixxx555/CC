import { useEffect, useState } from "react";
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
const Home = () => {
  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState("home");
  let categories = [
    "code",
    "girls",
    "love",
    "technology",
    "tech",
    "cars",
    "cooking",
    "travel",
    "football"
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
        console.log(formateData);

        setBlogs(formateData);
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
    let category = e.target.innerText.toLowerCase();
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
    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);
  return (
    <AnimationWrapper>
      <section className='h-cover flex justify-center gap-10 '>
        {/* latest blogs  */}
        <div className='w-full'>
          {/* Show on small screens only */}
<div className='md:hidden px-4 pt-4'>
  <h1 className='font-medium text-xl mb-6'>
    Stories from all interest
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
          {category}
        </button>
      );
    })}
  </div>
</div>

          <InPageNavigation
            routes={[pageState, "trending blogs"]}
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
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message={"No blogs Published"} />
              )}
              <LoadMoreData state={blogs} fetchData={(pageState == "home" ? fetchLatestBlogs : fetchBlogByCategories)} />
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
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message={"No trending blogs "} />
              )}
            </>
            
          </InPageNavigation>
        </div>

        {/* filters and trending */}
        <div className='min-w-[40%]  lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden'>
          <div className='flex flex-col gap-10'>
            <div className=''>
              <h1 className='font-medium text-xl mb-6'>
                Stories from all interest
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
                      {category}
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
      </section>
    </AnimationWrapper>
  );
};

export default Home;
