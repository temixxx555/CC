import axios from "axios";
import { filterProps } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import { userContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreData from "../components/load-more.component";

const Notifications = () => {
  const [filter, setfilter] = useState("all");
  let {
    userAuth,
    setUserAuth,
    userAuth: { access_token, new_notification_available },
  } = useContext(userContext);
  let filters = ["all", "like", "comment", "reply","info"];
  const [notifications, setNotifications] = useState(null);

  const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/notifications",
        {
          page,
          filter,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data: { notifications: data } }) => {
        if (new_notification_available) {
          setUserAuth({ ...userAuth, new_notification_available: false });
        }
        let formatedData = await filterPaginationData({
          state: notifications,
          data,
          page,
          counteRoute: "/all-notifications-count",
          data_to_send: { filter },
          user: access_token,
        });

        setNotifications(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token, filter]);

  const handleFilterFunction = (e) => {
    let btn = e.target;

    setfilter(btn.innerHTML);
    setNotifications(null);
  };
  return (
    <div>
      <h1 className='max-md:hidden'>Recent Notifications</h1>

      <div className='my-8 flex gap-3 overflow-x-auto scrollbar-hide sm:gap-6'>
        {filters.map((filtername, i) => {
          return (
            <button
              onClick={handleFilterFunction}
              className={
                "py-2 text-[13px] md:text-[15px] " + (filter == filtername ? "btn-dark" : "btn-light ")
              }
              key={i}
            >
              {filtername}
            </button>
          );
        })}
      </div>
      {notifications == null ? (
        <Loader />
      ) : (
        <>
          {notifications.results.length ? (
            notifications.results.map((notification, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                  <NotificationCard
                    data={notification}
                    index={i}
                    notificationState={{ notifications, setNotifications }}
                  />
                </AnimationWrapper>
              );
            })
          ) : (
            <NoDataMessage message='Nothing available' />
          )}
          <LoadMoreData
            state={notifications}
            fetchData={fetchNotifications}
            additionalParam={{ deletedDocCount: notifications.deletedDocCount }}
          />
        </>
      )}
    </div>
  );
};

export default Notifications;
