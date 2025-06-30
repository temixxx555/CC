import { useContext, useEffect, useState } from "react";
import { userContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/loader.component";
import axios from "axios";
import toast from "react-hot-toast";

const AssignRank = () => {
  const { userAuth } = useContext(userContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [ranks, setRanks] = useState({});

  // Check if userAuth is still loading - FIXED
  const isUserAuthLoading = !userAuth || !userAuth.userId;
  // Check if user is admin - FIXED (changed !== to ===)
  const isAdmin = userAuth?.userId === "682c6ce4e7ba63ef44ad05a9";

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
    // Don't do anything if userAuth is still loading
    if (isUserAuthLoading) {
      return;
    }

    // FIXED: Check if NOT admin
    if (!isAdmin) {
      setLoading(false);
      navigate("/not-found");
    } else {
      fetchImages();
    }
  }, [isAdmin, isUserAuthLoading, navigate]);

  // ADDED: Missing handleRankChange function
  const handleRankChange = (imageId, rank) => {
    setRanks((prev) => ({ ...prev, [imageId]: rank }));
  };

  const handleSubmit = async () => {
    try {
      // FIXED: Added full URL
      console.log("Submitting ranks:", ranks);

      if (Object.keys(ranks).length === 0) {
        toast.error("Please assign ranks before submitting");
        return;
      }
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/assign-ranks",
        { ranks }
      );
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success("Ranks assigned successfully");
    } catch (error) {
      console.error("Error submitting ranks", error);
      toast.error(
        error.response.data.error || "An error occurred while submitting ranks"
      );
    }
  };

  // Show loader while userAuth is loading OR while fetching images
  if (isUserAuthLoading || loading) return <Loader />;

  return (
    <div className='p-4 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Assign Rank</h1>

      {images.map((img) => (
        <div key={img._id} className='border rounded p-3 mb-4 shadow'>
          <img
            src={img.imageurl}
            alt='entry'
            className='w-full max-w-xs mb-2'
          />
          <Link
            to={`/user/${img.posted_by?.personal_info?.username}`}
          >
            <p>
              <strong>User:</strong> {img.posted_by?.personal_info?.username}
            </p>
          </Link>
          <select
            value={ranks[img._id] || ""}
            onChange={(e) => handleRankChange(img._id, Number(e.target.value))}
            className='mt-2 p-2 border rounded'
          >
            <option value=''>Select Rank</option>
            <option value={0}>No Rank</option>
            <option value={1}>1st</option>
            <option value={2}>2nd</option>
            <option value={3}>3rd</option>
          </select>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4'
      >
        Submit Ranks
      </button>
    </div>
  );
};

export default AssignRank;
