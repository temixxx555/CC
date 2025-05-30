import { Link, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { userContext } from "../App";
import AboutUser from "../components/about.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreData from "../components/load-more.component";
import PageNotFound from "./404.page";
export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: { },
  joinedAt: " ",
};
const ProfilePage = () => {
  let { id: profileId } = useParams();
  let [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null);
  let [profileLoaded, setprofileLoaded] = useState("");

  let {
    userAuth: { username },
  } = useContext(userContext);
  let {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const fetchUserProfile = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
        username: profileId,
      })
      .then(({ data: user }) => {
        getBlogs({ user_id: user._id });
        if (user != null){
          setProfile(user);

         }
        setprofileLoaded(profileId);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  const getBlogs = ({ page = 1, user_id }) => {
   user_id = user_id == undefined && blogs ? blogs.user_id : user_id;


    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          counteRoute: "/search-blogs-count",
          data_to_send: { author: user_id },
        });
        formattedData.user_id = user_id;
        console.log(formattedData);
        
        setBlogs(formattedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (profileId != profileLoaded) {
      setBlogs(null);
    }
    if(blogs == null){
      
    reset();
    fetchUserProfile();
    }

  }, [profileId,blogs]);
  const reset = () => {
    setLoading(true);
    setprofileLoaded("")
  };
  return (
    <AnimationWrapper>
      {loading ? 
        <Loader /> :
        profile_username.length  ?
  
        <section className='h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12'>
          <div className='flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-2 border-grey md:sticky md:top-[100px] md:py-10'>
            <img
              src={profile_img}
              alt='image'
              className='w-48 h-48 bg-grey rounded-full md:w-32 md:h-32'
            />

            <h1 className='text-2xl font-medium'>@{profile_username}</h1>
            <p className='text-xl capitalize h-6'>{fullname}</p>

            <p>
              {total_posts.toLocaleString()} Blogs -{" "}
              {total_reads.toLocaleString()} - Reads
            </p>

            <div className='flex gap-4 mt-2'>
              {profileId === username ? (
                <Link
                  to='/settings/edit-profile'
                  className='btn-light rounded-md'
                >
                  Edit Profile
                </Link>
              ) : (
                "<button>follow</button>"
              )}
            </div>
            <AboutUser
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
              className={"max-md:hidden"}
            />
          </div>
          <div className="max-md:mt-12 w-full">
          <InPageNavigation
            routes={["Blogs published", "About"]}
            defaultHidden={["About"]}
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
              <LoadMoreData state={blogs} fetchData={getBlogs} />
            </>
         <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
            
          </InPageNavigation>
          </div>
        </section>
        : <PageNotFound />
      }
    </AnimationWrapper>
  );
};

export default ProfilePage;
