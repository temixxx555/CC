const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const getDay = (timestamp) => { 
  const date = new Date(timestamp);
  const now = new Date();

  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  // Less than 1 minute
  if (diffSec < 60) return diffSec < 2 ? "now" : `${diffSec}s`;

  // Less than 1 hour
  if (diffMin < 60) return `${diffMin}m`;

  // Less than 24 hours
  if (diffHr < 24) return `${diffHr}h`;

  // 1–6 days ago → show 1d, 2d, etc.
  if (diffDay < 7) return `${diffDay}d`;

  // 7 days or older → Mar 15 (or with year)
  const thisYear = date.getFullYear() === now.getFullYear();
  return thisYear
    ? `${months[date.getMonth()]} ${date.getDate()}`
    : `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const getFullDay = (timestamp) => { 
  const date = new Date(timestamp);

  // Always show full pretty date with ordinal (like tooltips or blog posts)
  const day = date.getDate();
  const suffix = [,"st","nd","rd"][day % 10] || "th";
  // Handle 11th, 12th, 13th correctly
  const finalSuffix = [11,12,13].includes(day % 100) ? "th" : suffix;

  return `${months[date.getMonth()]} ${day}${finalSuffix}, ${date.getFullYear()}`;
};