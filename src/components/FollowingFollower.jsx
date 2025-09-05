// FollowList.tsx
import { Link } from "react-router-dom";
import verfiedBadge from ".././imgs/verified.png";

const FollowList = ({ data, title = "Users" }) => {
  console.log("dataa", data);

  return (
    <div className='space-y-4 p-4 border rounded-md shadow-md bg-white'>
      <h2 className='text-xl font-semibold'>{title}</h2>
      {data.length === 0 ? (
        <p className='text-dark-grey'>No users to show.</p>
      ) : (
        <ul className='space-y-3'>
          {data.map(({ personal_info }, index) => (
            <li
              key={index}
              className='flex items-center gap-4 p-2 border-b last:border-b-0'
            >
              <img
                src={personal_info.profile_img}
                alt={personal_info.fullname}
                className='w-12 h-12 rounded-full'
              />

              <div>
                <Link
                  to={`/user/${personal_info.username}`}
                  className=' hover:underline font-medium flex gap-2'
                >
                  @{personal_info.username}{" "}
                  {personal_info.isVerified && (
                    <img
                      src={verfiedBadge}
                      alt='profileimg'
                      className='w-6 h-6 rounded-full'
                    />
                  )}
                </Link>
                <p className='text-dark-grey text-sm'>
                  {personal_info.fullname}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FollowList;
//
