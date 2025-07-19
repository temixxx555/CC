"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Heart,
  Eye,
  MessageCircle,
  Calendar,
  Loader2,
  EyeClosed,
} from "lucide-react";

const ViewMessage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRelativeTime = (date) => {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return rtf.format(-seconds, "second");
    if (minutes < 60) return rtf.format(-minutes, "minute");
    if (hours < 24) return rtf.format(-hours, "hour");
    return rtf.format(-days, "day");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + `/anonymous/${id}`
        );
        setMessage(res.data.text);
        console.log(res);
      } catch (err) {
        console.error("Error fetching message:", err);
        setError(err.response?.data?.message || "Message not found or expired");
        setMessage(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMessage();
    }
  }, [id]);

  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-purple-500 mx-auto mb-4' />
          <p className='text-black'>Loading message...</p>
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className='h-screen flex items-center justify-center p-4'>
        <div className='max-w-md w-full text-center'>
          <div className='bg-gray-800 rounded-2xl p-8 border border-gray-700'>
            <div className='w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <MessageCircle className='w-8 h-8 text-red-400' />
            </div>
            <h2 className='text-xl font-bold text-white mb-2'>
              Message Not Found
            </h2>
            <p className='text-white mb-6'>
              {"This message may have been deleted or expired."}
            </p>
            <button
              onClick={() => navigate("/")}
              className='inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors'
            >
              <ArrowLeft className='w-4 h-4' />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen py-3 px-4'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => navigate("/")}
            className='inline-flex items-center space-x-2 text-dark-grey hover:underlinetransition-colors mb-4'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to Anonymous</span>
          </button>

          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
              <MessageCircle className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent'>
                Anonymous Message
              </h1>
              <p className='text-gray-400 text-sm'>Shared message view</p>
            </div>
          </div>
        </div>

        {/* Message Card */}
        <div className='bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl'>
          {/* Message Header */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center space-x-3'>
              <div
                className={`w-4 h-4 rounded-full ${message.colors || "bg-gray-500"}`}
              ></div>
              <span className='text-gray-400 font-medium'>Anonymous</span>
            </div>
            <div className='flex items-center space-x-2 text-gray-500 text-sm'>
              <Calendar className='w-4 h-4' />
              <span>{getRelativeTime(message.date)}</span>
            </div>
          </div>

          {/* Message Content */}
          <div className='mb-8'>
            <p className='text-gray-100 leading-relaxed text-lg whitespace-pre-wrap font-medium'>
              {message.content}
            </p>
          </div>

          {/* Message Stats */}
          <div className='border-t border-gray-700 pt-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-6'>
                <div className='flex items-center space-x-2 text-gray-400'>
                  <Heart className='w-5 h-5' />
                  <span className='font-medium'>{message.likes || 0}</span>
                  <span className='text-sm'>likes</span>
                </div>
               
              </div>
              <div className='text-gray-500 text-sm'>
                {formatDate(message.date)}
              </div>
            </div>
          </div>

          {/* Message ID (for debugging/reference) */}
          <div className='mt-4 pt-4 border-t border-gray-700'>
            <p className='text-xs text-gray-600 font-mono'>ID: {message._id}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-8 flex justify-center space-x-4'>
          <button
            onClick={() => navigate("/dashboard/anonymous-message")}
            className='px-6 py-3 bg-black hover:bg-purple-700 text-white rounded-xl transition-colors font-medium'
          >
            View More Messages
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              // You could add a toast notification here
            }}
            className='px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium'
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMessage;
