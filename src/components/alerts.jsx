"use client";

const items = [
  { title: "🎉 Party of the Century Tomorrow at Rema’s House", link: "#" },
  { title: "👤 Anonymous of the Century is coming on Friday 13th", link: "#" },
  { title: "🍹 Hangout Now like never before", link: "#" },
  { title: "🔥 Don’t Miss Out!", link: "#" },
  { title: "🎶 Music Fiesta", link: "#" },
  { title: "🏆 First Place on the Leaderboard gets a Verified Badge", link: "#" },
];

export default function Alerts() {
  return (
    <div className="w-full overflow-hidden py-6">
      <div className="marquee">
        {/* First copy */}
        {items.map((item, i) => (
          <a
            key={`a-${i}`}
            href={item.link}
            className="mx-4 w-full px-4 py-3 bg-white rounded-xl shadow flex items-center justify-center text-center font-semibold text-sky-600"
          >
            {item.title}
          </a>
        ))}
        {/* Duplicate copy */}
        {items.map((item, i) => (
          <a
            key={`b-${i}`}
            href={item.link}
            className="mx-4 w-full px-4 py-3 bg-white rounded-xl shadow flex items-center justify-center text-center font-semibold text-sky-600"
          >
            {item.title}
          </a>
        ))}
      </div>
    </div>
  );
}
