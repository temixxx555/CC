import { useState } from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import verifiedBadge from "../imgs/verified.png";

// Test data
const TEST_LOST_FOUND_ITEMS = [
  {
    id: "1",
    title: "Lost: Blue Nike Backpack",
    description:
      "Lost near the library on 3rd floor. Contains textbooks and a laptop charger.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    status: "lost",
    category: "Bags",
    location: "Library - 3rd Floor",
    postedBy: {
      fullname: "John Admin",
      username: "johnadmin",
      profile_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      isVerified: true,
    },
    contactInfo: "john@school.edu",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Found: iPhone 13 Pro",
    description:
      "Found in the cafeteria near table 5. Black case with stickers.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
    status: "found",
    category: "Electronics",
    location: "Cafeteria",
    postedBy: {
      fullname: "Sarah Admin",
      username: "sarahadmin",
      profile_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      isVerified: true,
    },
    contactInfo: "security@school.edu",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Lost: Silver Ring with Blue Stone",
    description: "Sentimental value. Lost in the gym locker room.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
    status: "lost",
    category: "Jewelry",
    location: "Gym - Locker Room",
    postedBy: {
      fullname: "Mike Admin",
      username: "mikeadmin",
      profile_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      isVerified: true,
    },
    contactInfo: "mike@school.edu",
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

// ---------- Card Component ----------
const LostAndFoundCard = ({ item, setSelectedItem }) => {
  const {
    title,
    description,
    image,
    status,
    category,
    location,
    postedBy: { fullname, profile_img, isVerified },
    contactInfo,
    publishedAt,
  } = item;

  const isLost = status === "lost";

  return (
    <div className='block group bg-white   rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300'>
      {/* Image */}
      <div
        className='relative h-48 overflow-hidden bg-gray-100 cursor-pointer'
        onClick={() => setSelectedItem(item)}
      >
        <img
          src={image}
          alt={title}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
        />

        <div
          className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs text-dark font-semibold shadow ${
            isLost ? "bg-red " : "bg-green-600 text-white"
          }`}
        >
          {isLost ? "🔍 LOST" : "✓ FOUND"}
        </div>

        <div className='absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 text-black text-xs'>
          {category}
        </div>
      </div>

      {/* Content */}
      <div className='p-4'>
        <p className='text-xl font-bold text-dark-grey mb-1 line-clamp-1 group-hover:text-black'>
          {title}
        </p>

        <p className='text-sm text-dark mb-3 line-clamp-2'>{description}</p>

        <div className='flex items-center gap-2 text-sm text-gray-500 mb-3'>
          <i className='fi fi-rr-marker text-red'></i>
          <span>come to {location}</span>
        </div>

        {/* Bottom */}
        <div className='flex justify-between items-center  pt-3'>
          <div className='flex items-center gap-2'>
            <img src={profile_img} className='w-7 h-7 rounded-full' />

            <div className='flex items-center gap-1'>
              <span className='text-xs font-medium text-dark'>
                {fullname}
              </span>
              {isVerified && <img src={verifiedBadge} className='w-3 h-3' />}
            </div>
          </div>

          <span className='text-xs text-dark'>{getDay(publishedAt)}</span>
        </div>

        <div className='mt-3 text-xs text-dark  pt-2'>
          <span className='font-semibold'>Contact:</span> {contactInfo}
        </div>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
export default function LostAndFoundSection() {
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems =
    filter === "all"
      ? TEST_LOST_FOUND_ITEMS
      : TEST_LOST_FOUND_ITEMS.filter((i) => i.status === filter);

  return (
    <div className='max-w-7xl mt-[17px] mx-auto px-4 py-10'>
      {/* Header */}
      <h1 className='text-4xl font-bold text-dark'>Lost & Found</h1>
      <p className='text-gray-500 mb-8'>
        Helping students recover lost valuables across campus.
      </p>

      {/* Filters */}
      <div className='flex gap-4 mb-8 border-b  pb-3'>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 font-semibold ${
            filter === "all"
              ? " border-b-2 "
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          All Items ({TEST_LOST_FOUND_ITEMS.length})
        </button>

        <button
          onClick={() => setFilter("lost")}
          className={`px-4 py-2 font-semibold ${
            filter === "lost"
              ? "t border-b-2 "
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Lost (
          {TEST_LOST_FOUND_ITEMS.filter((i) => i.status === "lost").length})
        </button>

        <button
          onClick={() => setFilter("found")}
          className={`px-4 py-2 font-semibold ${
            filter === "found"
              ? "t border-b-2 "
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Found (
          {TEST_LOST_FOUND_ITEMS.filter((i) => i.status === "found").length})
        </button>
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredItems.map((item) => (
            <LostAndFoundCard
              key={item.id}
              item={item}
              setSelectedItem={setSelectedItem}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-20'>
          <i className='fi fi-rr-search text-6xl text-gray-300 mb-4'></i>
          <h3 className='text-xl font-semibold text-black mt-2'>
            No items available in this category
          </h3>
        </div>
      )}

      {selectedItem && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50'
         onClick={() => setSelectedItem(null)} >
          <div className='bg-white rounded-2xl max-w-md w-full p-4 relative'
          onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              className='absolute top-3 right-3 text-black text-xl'
              onClick={() => setSelectedItem(null)}
            >
              ✕
            </button>

            {/* Image */}
            <img
              src={selectedItem.image}
              className='w-full h-64 object-cover rounded-xl mb-4'
              alt='Preview'
            />

            {/* Title */}
            <h2 className='text-xl font-bold text-dark mb-2'>
              {selectedItem.title}
            </h2>

            {/* Location */}
            <div className='flex items-center gap-2 text-dark mb-2'>
              <i className='fi fi-rr-marker text-red'></i>
              <span className='font-medium'>come to {selectedItem.location}</span>
            </div>

            {/* Contact */}
            <div className='text-sm text-dark'>
              <span className='font-semibold'>Contact:</span>{" "}
              {selectedItem.contactInfo}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
