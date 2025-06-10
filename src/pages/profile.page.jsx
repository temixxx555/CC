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
import toast from "react-hot-toast";
import FollowList from "../components/FollowingFollower";
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
  social_links: {},
  joinedAt: " ",
};
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  let { id: profileId } = useParams();
  let [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null);
  let [profileLoaded, setprofileLoaded] = useState("");
  const [Following, setFollowing] = useState(false);
  const [followingType, setFollowingType] = useState("followers");
  const [followData, setFollowData] = useState();

  let {
    setUserAuth,
    userAuth,
    userAuth: { username, access_token },
  } = useContext(userContext);
  useEffect(() => {
    if (profile?._id && userAuth?.following) {
      const isFollowing = userAuth.following.includes(profile._id);
      setFollowing(isFollowing);
    }
  }, [profile._id, userAuth.following]);
  let {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
    followers,
    following,
  } = profile;

  const fetchUserProfile = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
        username: profileId,
      })
      .then(({ data: user }) => {
        getBlogs({ user_id: user._id });
        if (user != null) {
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
  console.log(profile);
  //get the following and followers

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const { data } = await axios.get(
          `${
            import.meta.env.VITE_SERVER_DOMAIN
          }/${profile_username}/${followingType}`
        );
        setFollowData(data);
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error.message);
      }
    };

    if (profile_username) fetchFollowData();
  }, [profile_username, followingType,userAuth]);

  console.log("followData", followData);

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
    if (blogs == null) {
      reset();
      fetchUserProfile();
    }
  }, [profileId, blogs]);
  const reset = () => {
    setLoading(true);
    setprofileLoaded("");
  };

  const FollowAndUnfollow = async () => {
    const id = await profile._id;
    if (!access_token) {
      return toast.error("You will need to login");
    }
    try {
      await axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + `/follows/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data }) => {
          setFollowing(data.following);

          // Update localStorage and context
          const updatedUserAuth = { ...userAuth };
          if (data.following) {
            updatedUserAuth.following = [
              ...(updatedUserAuth.following || []),
              id,
            ];
          } else {
            updatedUserAuth.following = updatedUserAuth.following.filter(
              (fid) => fid !== id
            );
          }

          setUserAuth(updatedUserAuth);
          sessionStorage.setItem("user", JSON.stringify(updatedUserAuth));

          toast.success(data.following ? "Followed" : "Unfollowed");
          fetchUserProfile();
        });
    } catch (error) {
      toast.error("something went wrong");
      console.log(error.message);
    }
  };
  useEffect(() => {
    if (activeTab === 2) {
      setFollowingType("followers");
    } else if (activeTab === 3) {
      setFollowingType("following");
    }
  }, [activeTab]);
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
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
            <div className='flex gap-4 text-sm text-gray-600 font-medium'>
              <span className='hover:text-black transition'>
                {followers.length} Followers
              </span>
              <span className='text-gray-400'>•</span>
              <span className='hover:text-black transition'>
                {following.length} Following
              </span>
            </div>

            <div className='flex gap-4 mt-2'>
              {profileId === username ? (
                <Link
                  to='/settings/edit-profile'
                  className='btn-light rounded-md'
                >
                  Edit Profile
                </Link>
              ) : (
                <button className='btn-dark py-2' onClick={FollowAndUnfollow}>
                  {Following ? "Unfollow" : "follow"}
                </button>
              )}
            </div>
            <AboutUser
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
              className={"max-md:hidden"}
            />
          </div>
          <div className='max-md:mt-12 w-full'>
            <InPageNavigation
              routes={["Blogs published", "About", "Followers", "Following"]}
              defaultHidden={["About"]}
              onTabChange={setActiveTab}
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
              <AboutUser
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
              <>
                <FollowList data={followData} title={"Followers"} />
              </>
              <>
                <FollowList data={followData} title={"Following"} />
              </>
            </InPageNavigation>
          </div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
