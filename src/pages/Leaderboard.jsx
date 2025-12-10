import axios from "axios";
import React, { useState, useEffect } from "react";
import Loader from "../components/loader.component";
import { Link } from "react-router-dom";
import { lookInSession } from "../common/session";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import verfiedBadge from ".././imgs/verified.png";

const getMedal = (pos) => {
  if (pos === 1) return "🥇";
  if (pos === 2) return "🥈";
  if (pos === 3) return "🥉";
  if (pos >= 4) return `#${pos}`;
  return pos;
};

const formatNumber = (num) => {
  return num.toLocaleString();
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("allTime");
  const [query, setQuery] = useState("followers"); // Can be "followers" or "streak"
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInLeaderboard, setUserInLeaderboard] = useState(null);

  useEffect(() => {
    const getLeaderboardData = async () => {
      try {
        setLoading(true);
        const user = lookInSession("user");
        const parsedUser = user ? JSON.parse(user) : null;
        setUserInLeaderboard(parsedUser?.username || null);
        // console.log("User in session:", parsedUser?.username);

        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/leaderboard?type=${query}`
        );

        // Transform data to match expected structure
        const transformedData = data.map((user) => ({
          _id: user._id,
          username: user.username || user.personal_info?.username,
          fullname: user.fullname || user.personal_info?.fullname,
          profile_img: user.profile_img || user.personal_info?.profile_img,
          followersCount: user.followersCount ?? 0,
          streak: user.streak ?? { count: 0 },
          isVerified: user.isVerified || user.personal_info?.isVerified,
        }));

        setData(transformedData);
        // console.log(transformedData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setData([]);
        setLoading(false);
      }
    };
    getLeaderboardData();
  }, [query]);

  // Sort users based on activeTab and query
  const getSortedUsers = () => {
    const sortedUsers = [...data];
    const sortKey = query === "followers" ? "followersCount" : "streak.count";

    if (activeTab === "allTime") {
      return sortedUsers
        .sort((a, b) => b[sortKey] - a[sortKey])
        .map((user, idx) => ({ ...user, position: idx + 1 }));
    } else if (activeTab === "pastWeek") {
      // Simulate weekly sorting by weighting recent activity (e.g., halve the metric)
      return sortedUsers
        .sort((a, b) => Math.floor(b[sortKey] / 2) - Math.floor(a[sortKey] / 2))
        .map((user, idx) => ({ ...user, position: idx + 1 }));
    } else if (activeTab === "pastMonth") {
      // Simulate monthly sorting by weighting (e.g., 75% of the metric)
      return sortedUsers
        .sort(
          (a, b) =>
            Math.floor(b[sortKey] * 0.75) - Math.floor(a[sortKey] * 0.75)
        )
        .map((user, idx) => ({ ...user, position: idx + 1 }));
    }
    return sortedUsers;
  };

  const sortedUsers = getSortedUsers();
  const getLeaderLeaf = (idx) => {
    switch (idx) {
      case 0:
        return "/gold.png";
      case 1:
        return "/silver.png";
      default:
        return "/bronze.png";
    }
  };
  return (
    <div className='min-h-screen mt-[66px]'>
      {loading ? (
        <Loader />
      ) : (
        <div className='max-w-6xl mx-auto py-8 px-4'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='text-[20px] md:text-4xl mx-auto flex justify-center items-center font-bold text-dark-grey mb-4'>
              Popularity Contest {/* Flame Animation */}
              <DotLottieReact
                src='https://lottie.host/02271725-b11e-42f9-b1a5-f6b8a94cd6c1/Oq8GFbPfmB.lottie'
                loop
                autoplay
                className='w-[50px] h-[50px] object-contain'
              />
            </div>
            <p className='text-dark-grey max-w-4xl mx-auto leading-relaxed'>
              Wanna know who's the most popular in Bowen? Check out the
              leaderboard by followers or streaks — new Faves every week!
            </p>
          </div>

          {/* Query Selector */}
          <div className='flex justify-center mb-4'>
            <select
              className='px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-dark-grey'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            >
              <option value='followers'>Followers</option>
              <option value='streak'>Streak</option>
            </select>
          </div>

          {/* Navigation Tabs */}
          {/* <div className='flex justify-center mb-8'>
            <div className='flex bg-white rounded-lg border border-gray-200 overflow-hidden'>
              {[
                { key: "allTime", label: "All Time" },
                { key: "pastWeek", label: "Past Week" },
                { key: "pastMonth", label: "Past Month" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-grey text-white-700"
                      : "text-dark-grey hover:text-dark-grey/30 "
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div> */}

          {/* Leaderboard Table */}
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden relative z-0'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[600px]'>
                <thead className='bg-white border-b border-gray-200'>
                  <tr>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-black w-20'>
                      Position
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-black'>
                      Full Name
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-black'>
                      Username
                    </th>
                    <th className='text-right py-4 px-6 text-sm font-semibold text-black w-32'>
                      {query === "followers" ? "Followers" : "Streak"}
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {sortedUsers.map((user, idx) => (
                    <tr
                      key={user._id}
                      className={`transition-colors 
   
   `}
                    >
                      <td className='py-4 px-6'>
                        <span className='text-lg font-bold text-dark-grey'>
                          {getMedal(user.position)}
                        </span>
                      </td>
                      <Link to={`/user/${user.username}`}>
                        <td className={`${idx < 3 ? "py-4" : "py-7"} px-6`}>
                          <div className='flex items-center gap-4'>
                            {idx < 3 ? (
                              <div className='relative w-16 h-16 shrink-0'>
                                <img
                                  src={getLeaderLeaf(idx)}
                                  alt=''
                                  className='w-full h-full object-contain'
                                />
                                <img
                                  src={user.profile_img}
                                  alt={user.username}
                                  className='w-10 h-10 rounded-full border-2 border-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10'
                                />
                              </div>
                            ) : (
                              <img
                                src={user.profile_img}
                                alt={user.username}
                                className='w-10 h-10 ml-3 rounded-full border-2 border-gray-200'
                              />
                            )}

                            <span
                              className={
                                "font-semibold text-dark-grey text-base "
                              }
                            >
                              {user.fullname}
                            </span>
                            {user.isVerified && (
                              <img
                                src={verfiedBadge}
                                alt='profileimg'
                                className='w-6 h-6 -ml-3 rounded-full'
                              />
                            )}
                          </div>
                        </td>
                      </Link>

                      <td className='py-4 px-6'>
                        <Link
                          to={`/user/${user.username}`}
                          className={"text-dark-grey hover:underline "}
                        >
                          {user.username}
                        </Link>
                      </td>
                      <td className='py-4 px-6 text-right'>
                        <span
                          className={
                            "text-lg font-bold text-dark-grey font-mono "
                          }
                        >
                          {formatNumber(
                            query === "followers"
                              ? user.followersCount
                              : user.streak.count
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info */}
          <div className='text-center mt-8'>
            <p className='text-sm text-gray-500'>
              Rankings are updated in real-time based on user activity and
              achievements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
