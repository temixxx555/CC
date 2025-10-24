"use client"

import { Send, MessageCircle, Eye, Heart, Share2, Smile } from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { useSocket } from "../contexts/SocketContexts"
import { useState, useRef, useEffect, useContext } from "react"
import { userContext } from "../App"
import axios from "axios"
import LoadMoreAnonymous from "../components/loadMoreAnonymous"
import toast from "react-hot-toast"
import Loader from "../components/loader.component"

const AnnonymousPage = () => {
  const socket = useSocket()
  const emojiRef = useRef()
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [messageCount, setmessageCount] = useState(0)
  const [loading, setloading] = useState(false)
  const [viewers, setViewers] = useState(0)
  const [page, setPage] = useState(1)
  const {
    userAuth: { access_token, userId },
  } = useContext(userContext)

  useEffect(() => {
    //so when i click my background my emoji goes hidden
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [emojiRef])

  const [messages, setMessages] = useState([])

  const getRelativeTime = (date) => {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" })
    const diff = Date.now() - new Date(date).getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return rtf.format(-seconds, "second")
    if (minutes < 60) return rtf.format(-minutes, "minute")
    if (hours < 24) return rtf.format(-hours, "hour")
    return rtf.format(-days, "day")
  }

  //get anonymous message
  const fetchMessages = async ({ page = 1 }) => {
    setloading(true)
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + `/get-anonymous`,
        { page },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      setViewers(data.onlineCount)
      setmessageCount(data.weeklyMessages)
      const formatted = data.messages.map((messageData) => ({
        id: messageData._id,
        text: messageData.content,
        timestamp: getRelativeTime(messageData.date),
        likes: messageData.likes ?? 0,
        views: 0,
        color: messageData.colors || "bg-gray-500",
        likedByMe: messageData.likedBy?.includes(userId),
      }))

      if (page === 1) {
        setMessages(formatted)
      } else {
        setMessages((prev) => [...prev, ...formatted])
      }
      setPage(page) // update current page
      setloading(false)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setloading(false)
    }
  }

  useEffect(
    () => {
      fetchMessages({ page: 1 })
    },
    [access_token],
    userId,
  )

  //socket-io sent messsages
  useEffect(() => {
    if (!socket?.current?.connected) {
      console.log("Socket not connected yet.")
      return
    } else {
      console.log("socket connected succesfully")
    }

    const handleReceiveMessage = (messageData) => {
      const formatted = {
        id: Date.now(),
        text: messageData.content,
        timestamp: "Just now",
        likes: messageData.likes ?? 0,
        views: 0,
        color: messageData.colors || "bg-gray-500",
      }

      if (messageData.sender !== userId) {
        setMessages((prev) => [...prev, formatted])
      }
    }

    socket.current.on("anonymousMessage", handleReceiveMessage)

    return () => {
      socket.current.off("anonymousMessage", handleReceiveMessage)
    }
  }, [socket?.current?.connected])

  //scroll to scroll Up when new message arrives
  const messagesEndRef = useRef(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    })
  }, [messages])

  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (!access_token) {
      return toast.error("login to send message")
    }
    if (newMessage.trim()) {
      const colors = [
        "bg-orange-500",
        "bg-pink-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-indigo-500",
        "bg-violet-500",
      ]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const formattedMessage = {
        id: userId, // Unique ID for React
        text: newMessage,
        timestamp: "Just now",
        likes: 0,
        views: 0,
        color: randomColor || "bg-gray-500",
      }

      const message = {
        content: newMessage,
        likes: 0,
        colors: randomColor,
        sender: userId,
      }

      socket?.current?.emit("anonymousMessage", message)
      setMessages((preVal) => [...preVal, formattedMessage])
      setNewMessage("")
    }
  }

  const handleLike = async (id) => {
    if (!access_token) {
      return toast.error("login to like message")
    }
    if (userId === id) {
      return
    }
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + `/like-anonymous`,
        { messageId: id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )

      setMessages(messages.map((msg) => (msg.id === id ? { ...msg, likes: msg.likes + 1, likedByMe: true } : msg)))
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleShare = async (message) => {
    const shareUrl = `${window.location.origin}/anonymous/${message.id}`
    const shareText = `${message.text}\n\nCheck this anonymous message 👀`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Anonymous Message",
          text: shareText,
          url: shareUrl,
        })
      } else {
        // Fallback for unsupported browsers
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied to clipboard")
      }
    } catch (error) {
      console.error("Share failed:", error)
      toast.error("Could not share message")
    }
  }

  return (
    <div className="w-full overflow-auto scrollbar-hide h-[80vh] md:h-[450px] flex flex-col">
      {/* Header - Mobile Optimized */}
      <div className="w-full border-b border-gray-700 px-3 sm:px-4 py-3 sm:py-4 z-10 bg-white sticky top-0">
        <div className="max-w-2xl mx-auto">
          {/* Mobile: Stack vertically, Desktop: Keep horizontal */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Title and Icon */}
            <div className="flex items-center justify-between sm:justify-start">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 sm:w-5 sm:h-5 text-black" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent">
                  Anonymous
                </h1>
              </div>

              {/* Mobile: Show message count on the right */}
              <div className="text-sm sm:hidden text-black font-medium">{messageCount} messages</div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2 text-black">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{viewers} viewing</span>
              </div>

              {/* Desktop: Show message count */}
              <div className="hidden sm:block text-sm md:text-base text-black font-medium">{messageCount} messages</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="w-full md:w-[628px] mx-auto px-2 sm:px-4 py-3 sm:py-6">
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 transform hover:scale-[1.01] sm:hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${message.color}`}></div>
                    <span className="text-xs sm:text-sm text-gray-400">Anonymous</span>
                  </div>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>

                {/* Message Content */}
                <p className="text-gray-100 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base break-words">
                  {message.text}
                </p>

                {/* Message Actions */}
                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-700">
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    <button
                      onClick={() => handleLike(message.id)}
                      className="flex items-center space-x-1 sm:space-x-2 text-gray-400 hover:text-pink-400 transition-colors duration-200 group"
                    >
                      <Heart
                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-200 ${
                          message.likedByMe ? "fill-pink-500 text-pink-500" : "group-hover:fill-current"
                        }`}
                      />
                      <span className="text-xs sm:text-sm">{message.likes}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleShare(message)}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 p-1"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} className="h-0"></div>

            <LoadMoreAnonymous state={{ results: messages, page, totalDocs: messageCount }} fetchData={fetchMessages} />
          </div>
        </div>
      )}

      {/* Message Input - Mobile Optimized */}
      <div className="bg-white border-t border-gray-200 p-2 sm:p-4 sticky bottom-0">
        <div className="flex items-end space-x-2 max-w-2xl mx-auto">
          <div className="flex-1 min-w-0 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-8 sm:pr-12 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-20 sm:max-h-32 text-sm sm:text-base text-gray-900 bg-gray-50 leading-tight"
              rows={1}
              style={{
                minHeight: "36px",
                lineHeight: "1.4",
              }}
            />

            {/* Emoji Picker - Mobile Optimized */}
            {emojiOpen && (
              <div
                ref={emojiRef}
                className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-xl overflow-hidden"
                style={{
                  // Mobile: Full width with margins, Desktop: Fixed width
                  width: window.innerWidth < 640 ? "calc(100vw - 32px)" : "320px",
                  maxWidth: "320px",
                  // Mobile: Position from right edge, Desktop: Normal positioning
                  right: window.innerWidth < 640 ? "0" : "auto",
                }}
              >
                <Picker
                  theme="auto"
                  data={data}
                  onEmojiSelect={(e) => setNewMessage(newMessage + e.native)}
                  perLine={window.innerWidth < 640 ? 8 : 9}
                  emojiSize={window.innerWidth < 640 ? 18 : 20}
                />
              </div>
            )}

            {/* Emoji Button */}
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setEmojiOpen((preval) => !preval)}
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 flex-shrink-0 ${
              newMessage.trim()
                ? "bg-black text-white hover:bg-gray-800 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnnonymousPage
