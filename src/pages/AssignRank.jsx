import { useContext, useEffect, useState } from "react";
import { userContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/loader.component";
import axios from "axios";
import toast from "react-hot-toast";

const AssignRank = () => {
  const { userAuth } = useContext(userContext);
  const navigate = useNavigate();

  // --- Hooks must be at the top ---
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [ranks, setRanks] = useState({});
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isUserAuthLoading = !userAuth || !userAuth.userId;
  const isAdmin = userAuth?.userId === "682c6ce4e7ba63ef44ad05a9";

  // --- Fetch images ---
  const fetchImages = async () => {
    try {
      const { data } = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/get-competition-images"
      );
      setImages(data.challenges || []);
    } catch (error) {
      console.error("Error fetching images", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserAuthLoading) return;
    if (!isAdmin) {
      setLoading(false);
      navigate("/not-found");
      return;
    }
    fetchImages();
  }, [isAdmin, isUserAuthLoading, navigate]);

  const handleRankChange = (imageId, rank) => {
    setRanks((prev) => ({ ...prev, [imageId]: rank }));
  };

  const handleSubmitRanks = async () => {
    try {
      if (Object.keys(ranks).length === 0) {
        toast.error("Please assign ranks before submitting");
        return;
      }

      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/assign-ranks",
        { ranks }
      );

      if (data.error) return toast.error(data.error);

      toast.success("Ranks assigned successfully");
    } catch (error) {
      console.error("Error submitting ranks", error);
      toast.error(
        error.response?.data?.error || "An error occurred while submitting ranks"
      );
    }
  };

  // --- Handle announcement submission ---
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/make-annoucement",
        { title, message },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );
      setSuccess("Announcement sent successfully 🎉");
      setTitle("");
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (isUserAuthLoading || loading) return <Loader />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Assign Rank</h1>

      {images.map((img) => (
        <div key={img._id} className="border rounded p-3 mb-4 shadow">
          <img src={img.imageurl} alt="entry" className="w-full max-w-xs mb-2" />
          <Link to={`/user/${img.posted_by?.personal_info?.username}`}>
            <p>
              <strong>User:</strong> {img.posted_by?.personal_info?.username}
            </p>
          </Link>
          <select
            value={ranks[img._id] || ""}
            onChange={(e) => handleRankChange(img._id, Number(e.target.value))}
            className="mt-2 p-2 border rounded"
          >
            <option value="">Select Rank</option>
            <option value={0}>No Rank</option>
            <option value={1}>1st</option>
            <option value={2}>2nd</option>
            <option value={3}>3rd</option>
            <option value={4}>Background Noise</option>
          </select>
        </div>
      ))}

      <button
        onClick={handleSubmitRanks}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
      >
        Submit Ranks
      </button>

      {/* --- Announcement Form --- */}
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">
          📢 Create Announcement
        </h2>

        <form onSubmit={handleAnnouncementSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
            required
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="btn-dark py-2 rounded-lg disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Announcement"}
          </button>
        </form>

        {success && <p className="text-green-600 mt-3 text-center">{success}</p>}
        {error && <p className="text-red-600 mt-3 text-center">{error}</p>}
      </div>



      {/* --- Push Notification Form --- */}
<div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
  <h2 className="text-xl font-semibold mb-4 text-center">🔔 Send Push Notification</h2>

  <form
    onSubmit={async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/send-notification",
          { title, body: message },
          {
            headers: {
              Authorization: `Bearer ${userAuth.access_token}`,
            },
          }
        );
        toast.success("Notification sent successfully 🎉");
        setTitle("");
        setMessage("");
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.error || "Failed to send notification");
      } finally {
        setLoading(false);
      }
    }}
    className="flex flex-col gap-4"
  >
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Enter notification title"
      className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      required
    />
    <textarea
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Enter notification message"
      className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      rows={3}
      required
    ></textarea>

    <button
      type="submit"
      disabled={loading}
      className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
    >
      {loading ? "Sending..." : "Send Notification"}
    </button>
  </form>
</div>
    </div>
  );
};

export default AssignRank;
