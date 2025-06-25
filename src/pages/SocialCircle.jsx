import React from "react";
import { MessageCircle, Camera } from "lucide-react"; // optional, or use Flaticon
import { Link } from "react-router-dom";

const features = [
  {
    icon: <i className='fi fi-rr-camera text-2xl text-pink-500' />,
    title: "Weekly Image Ranking",
    description: "Drop your photo weekly and see how you rank on campus!",
    link: "/ranking", // Optional link
  },
  {
    icon: <i className='fi fi-rr-comment-alt text-2xl text-blue-600' />, // Flaticon UIcons
    title: "Anonymous Message",
    link: "/social-circle/anonymous-message",
    description:
      "Chat freely with other students without revealing your identity.",
  },
];

const SocialCircle = () => {
  return (
    <div className='p-4 max-w-full mx-auto'>
      <h1 className='text-2xl font-bold mb-6 text-center'>Social Circle</h1>

      <div className='space-y-4'>
        {features.map((feature, index) => (
          <Link to={feature.link} className='no-underline' key={index}>
            <div
              key={index}
              className='flex items-start gap-4 bg-white shadow-md p-4 rounded-xl mb-[10px] transition-transform hover:scale-105 hover:shadow-xl'
            >
              <div className='mt-1'>{feature.icon}</div>
              <div>
                <h2 className='text-lg font-semibold'>{feature.title}</h2>
                <p className='text-sm text-dark-grey'>{feature.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SocialCircle;
