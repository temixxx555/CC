import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  MoreHorizontal,
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Menu,
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import verfiedBadge from ".././imgs/verified.png";

import { userContext } from "../App";
import { useSocket } from "../contexts/SocketContexts";
import toast from "react-hot-toast";
import Loader from "../components/loader.component";

const ChatPage = () => {
  const navigate = useNavigate();
  const { id: chatIdFromUrl } = useParams();
  const [currentChat, setCurrentChat] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadings, setLoadings] = useState(true);
  const [message, setMessage] = useState("");
  const {
    userAuth: { access_token, userId },
  } = useContext(userContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [showmodal, setShowModal] = useState(false);
  const [users, SetshowUsers] = useState([]); //so i can add contacts
  const emojiRef = useRef();
  const fileInputRef = useRef(null);
  const [testMessage, setTestMessage] = useState([]);
  const [chats, setChat] = useState([]);

  //link to chats
  useEffect(() => {
    if (!chatIdFromUrl || chats.length === 0) return;

    const foundChat = chats.find((chat) => chat.id === chatIdFromUrl);

    if (foundChat) {
      setCurrentChat(foundChat);
      setShowSidebar(false);
    } else {
      // If chat not found, assume it's a direct chat and create a temp one
      const fetchUserInfo = async () => {
        try {
          const { data } = await axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + "/get-user-info",
            { chatIdFromUrl },
            { headers: { Authorization: `Bearer ${access_token}` } }
          );
          const { fullname, profile_img, username } = data.user.personal_info;

          const tempChat = {
            id: chatIdFromUrl,
            name: fullname, // fallback name, can fetch later
            type: "direct",
            avatar: fullname.charAt(0).toUpperCase(),
            online: false,
            username: username,
            profile_img: profile_img,
          };
          setCurrentChat(tempChat);
          setShowSidebar(false);
          return;
        } catch (error) {
          console.error("Failed to fetch user info", error);
          return null;
        }
      };
      fetchUserInfo();
    }
  }, [chatIdFromUrl, chats]);

  //scroll to bottom when new message arrives
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [testMessage]);

  useEffect(() => {
    //so when i click my background my emoji goes hidden
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoadings(true);
      if (!currentChat?.id || !access_token) return; // Ensure id and token exist
      try {
        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + `/get-messages`,
          {
            id: currentChat.id,
            isGroup: currentChat.type === "group", // Add isGroup flag
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        const formattedMessages = data.messages.map((msg) => ({
          id: msg._id,
          sender: msg.sender?.personal_info?.username || "Them",
          content: msg.content,
          isOwn: msg.sender?._id === userId,
          datetime: msg.createdAt,
          messageType: msg.messageType,
          fileUrl: msg.fileUrl,
          avatar:
            msg.sender?.personal_info?.fullname?.charAt(0).toUpperCase() || "T",
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setTestMessage(formattedMessages.reverse());
        setLoadings(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setLoadings(false);
      }
    };
    fetchMessages();
  }, [currentChat?.id, access_token, userId]);

  let [allusers, setallusers] = useState(0);

  const getallUsers = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/all-users")
      .then(({ data }) => {
        setallusers(data?.count);
        // console.log(data.count);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getallUsers();
    // console.log("i am getting called");
  }, []);
  //fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        if (!access_token) return; // No token, skip fetching
        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + `/get-contacts`,
          {},
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        console.log("contacts gotten", data);

        const formatedMessages = data.contacts.map((msg) => ({
          id: msg._id,
          name: msg.firstName, // fallback
          type: "direct",
          lastMessage: msg.lastMessage,
          unread: msg.unreadCount,
          online: msg.online,
          lastSeen: msg.lastSeen,
          profile_img: msg.profileImage,
          username: msg.username,
          avatar: msg.firstName?.charAt(0).toUpperCase(),
          timestamp: new Date(msg.lastMessageTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isVerified: msg.isVerified,
        }));
        // Add static group manually
        const staticGroup = {
          id: "global", // or some unique string you’ll use in group message logic
          name: "Campus Group",
          type: "group",
          username: "temiq33",
          lastMessage: "Welcome to the group!",
          unread: 0,
          online: true,
          isVerified: true,
          members: 10,
          avatar: "CG",
          profile_img:
            "https://bowen.edu.ng/wp-content/uploads/2019/10/Podium-Bowen-Logo-e1572367768365.jpg", // optional avatar image
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setChat([...formatedMessages, staticGroup]);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching messages:", error);
        setLoading(false);
      }
    };
    fetchContacts();
  }, [access_token, currentChat?.id]);
  //Time for chat connection
  const socket = useSocket();

  useEffect(() => {
    if (!socket?.current) return;

    const handleReceiveMessage = (msg) => {
      const isCurrentChat =
        currentChat &&
        (msg.sender._id === currentChat.id ||
          msg.recipient._id === currentChat.id);
      const myMessage = msg.sender._id === userId;
      if (!myMessage && isCurrentChat) {
        const formattedMessage = {
          id: Date.now(),
          sender: msg.sender.personal_info.fullname || "Them", // fallback
          content: msg.content,
          messageType: msg.messageType,
          fileUrl: msg.fileUrl,
          datetime: new Date().toISOString(),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: false,
          avatar: msg.sender.personal_info.fullname?.charAt(0).toUpperCase(),
        };
        setTestMessage((prev) => [...prev, formattedMessage]);
      }
    };

    socket.current.on("receivedMessage", handleReceiveMessage);

    return () => {
      socket.current.off("receivedMessage", handleReceiveMessage);
    };
  }, [socket, currentChat]);

  //for group messages
  useEffect(() => {
    if (!socket?.current) return;

    socket.current.on("receiveGroupMessage", (msg) => {
      if (currentChat?.id === msg.room) {
        const formattedMessage = {
          id: msg._id || Date.now(),
          sender: msg.sender.personal_info.username || "Them",
          content: msg.content,
          messageType: msg.messageType,
          fileUrl: msg.fileUrl,
          datetime: msg.createdAt,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: msg.sender._id === userId,
          avatar: msg.sender.personal_info.fullname?.charAt(0).toUpperCase(),
        };
        setTestMessage((prev) => [...prev, formattedMessage]);
      }
    });

    return () => {
      socket.current.off("receiveGroupMessage");
    };
  }, [socket, currentChat, userId]);

  const handleSendMessage = () => {
    try {
      if (message.trim()) {
        // Handle sending message
        const newMessage = {
          id: Date.now(), // temporary unique id
          sender: "You",
          content: message,
          datetime: new Date().toISOString(),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: true,
        };

        // Add to UI
        if (currentChat.id === "global") {
          socket?.current?.emit("sendGroupMessage", {
            content: message,
            senderId: userId,
            messageType: "text",
            fileUrl: undefined,
          });
        } else {
          socket?.current?.emit("sendMessage", {
            content: message,
            sender: userId,
            recipient: currentChat.id,
            messageType: "text",
            fileUrl: undefined,
          });
          setTestMessage((prev) => [...prev, newMessage]);
        }
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((msg) => {
      const date = new Date(msg.datetime).toDateString(); // groups by day
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });

    return groups;
  };

  const getDateLabel = (dateString) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const targetDate = new Date(dateString);

    if (targetDate.toDateString() === today.toDateString()) return "Today";
    if (targetDate.toDateString() === yesterday.toDateString())
      return "Yesterday";

    return targetDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }); // e.g., July 9, 2025
  };
  const groupedMessages = groupMessagesByDate(testMessage);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats?.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const searchContacts = async (searchQuery) => {
    console.log(searchQuery);
    try {
      if (searchQuery.length > 0) {
        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/search-dm",
          { searchUser: searchQuery },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        if (data?.users.length > 0) {
          SetshowUsers(data?.users);
        } else {
          SetshowUsers([]);
        }
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const handleChatSelect = (chat) => {
    setCurrentChat(chat);
    setShowSidebar(false);
    setTestMessage([]);
    setSearchQuery("");
    SetshowUsers([]);
    navigate(`/messages/${chat.id}`);
  };
  const handleAddContact = (chat) => {
    setCurrentChat(chat);
    setShowSidebar(false);
    setTestMessage([]);
    setShowModal(false);
    setSearchQuery("");
    SetshowUsers([]);
    navigate(`/messages`);
  };

  // const handleBackToList = () => {
  // navigate("/messages")
  //   setCurrentChat(null);
  //   setShowSidebar(true);
  // };

  const handleFileUpload = async (e) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit");
      return;
    }
    const toastId = toast.loading("Submitting your photo...");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/upload-image",
        formData
      );
      if (data?.imageUrl) {
        const newMessage = {
          id: Date.now(),
          sender: userId,
          content: undefined,
          datetime: new Date().toISOString(),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: true,
          messageType: "file",
          fileUrl: data.imageUrl,
          avatar: "Y", // Placeholder for current user's avatar
        };

        if (currentChat.type === "group") {
          socket?.current?.emit("sendGroupMessage", {
            content: undefined,
            senderId: userId,
            messageType: "file",
            fileUrl: data.imageUrl,
            room: currentChat.id,
          });
        } else {
          socket?.current?.emit("sendMessage", {
            content: undefined,
            sender: userId,
            recipient: currentChat.id,
            messageType: "file",
            fileUrl: data.imageUrl,
          });

          setTestMessage((prev) => [...prev, newMessage]);
        }
        toast.dismiss(toastId);
        toast.success("Uploaded");
        setMessage("");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.dismiss(toastId);
      toast.error("File upload failed");
    }
  };

  //format last seen time
  // Format last seen
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "last seen recently";
    const lastSeen = new Date(timestamp);
    const now = new Date();

    const isToday = lastSeen.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = lastSeen.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Last seen today at ${lastSeen.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (isYesterday) {
      return `Last seen yesterday at ${lastSeen.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return `Last seen on ${lastSeen.toLocaleDateString()} at ${lastSeen.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )}`;
    }
  };
  const handleSidebarClose = () => {
    navigate("/messages");
  };
  return (
    <div className='w-full h-[calc(100vh-10rem)]   md:h-[calc(100vh-6rem)] max-w-screen-2xl mx-auto overflow-hidden flex'>
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-full bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:w-80`}
      >
        {/* Header */}
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-xl font-semibold text-black'>Messages</h1>
            <button
              onClick={() => setShowModal((preval) => !preval)}
              className='p-2 flex hover:opacity-20 text-black border border-black rounded-full transition-colors'
            >
              Add <Plus className='w-5 h-5 black' />
            </button>
          </div>

          {/* Search */}
          {!showmodal ? (
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search conversations...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-grey border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-grey text-sm'
              />
            </div>
          ) : (
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Add contacts...'
                onChange={(e) => searchContacts(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-grey border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-grey text-sm'
              />
            </div>
          )}
        </div>

        {/* Chat List */}
        {loading ? (
          <Loader />
        ) : !showmodal ? (
          <div className='flex-1 overflow-y-auto scrollbar-hide'>
            {filteredChats?.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`p-4 cursor-pointer transition-color ${
                  currentChat?.id === chat.id ? " border-r-2 border-black" : ""
                }`}
              >
                <div className='flex items-center space-x-2'>
                  <div className='relative'>
                    <div
                      className={`w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-white font-semibold ${
                        chat.type === "group" ? "bg-purple" : "bg-blue-500"
                      }`}
                    >
                      <img
                        src={chat.profile_img}
                        alt={chat.firstName}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    {chat.online && (
                      <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full'></div>
                    )}
                  </div>

                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <div className='flex text-sm items-center space-x-2'>
                        <p className='font-semibold'>{chat.name}</p>
                        {chat.type === "group" && (
                          <span className='text-xs text-gray-500 hidden sm:inline'>
                            ({chat.members})
                          </span>
                        )}
                        {chat.isVerified && (
                          <img
                            src={verfiedBadge}
                            alt='profileimg'
                            className='w-6 h-6 ml-5 rounded-full'
                          />
                        )}
                      </div>

                      <span className='text-xs text-gray-500 flex-shrink-0'>
                        {chat.timestamp}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <p className='text-sm max-w-[170px] text-gray-600 truncate'>
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <span className='bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2'>
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto px-4 py-2'>
            {users.length > 0 ? (
              users.map((chat, i) => {
                const { fullname, username, profile_img } =
                  chat.personal_info || {};
                return (
                  <div
                    key={i}
                    onClick={() =>
                      handleAddContact({
                        id: chat._id,
                        name: chat.personal_info.fullname,
                        type: "direct",
                        avatar: chat.personal_info.fullname
                          .charAt(0)
                          .toUpperCase(),
                        online: false,
                        username: chat.personal_info.username,
                        profile_img: chat.personal_info.profile_img,
                      })
                    }
                    className='flex items-center space-x-3 py-3 border-b border-black cursor-pointer  transition-colors'
                  >
                    <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-white font-semibold'>
                      {profile_img ? (
                        <img
                          src={profile_img}
                          alt={fullname}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        fullname?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className='flex-1'>
                      <p className='font-semibold text-black text-sm'>
                        {fullname}
                      </p>
                      <p className='text-gray-500 text-xs'>@{username}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className='text-center text-sm text-gray-500 mt-4'>
                No users found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={handleSidebarClose}
        />
      )}

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col lg:ml-0'>
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className='bg-white border-b border-gray-200 p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  {/* Menu button for mobile when no chat selected */}
                  <button
                    onClick={() => setShowSidebar(true)}
                    className='p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden'
                  >
                    <Menu className='w-5 h-5 text-gray-600' />
                  </button>
                  <Link to={`/user/${currentChat?.username}`}>
                    <div className='relative'>
                      <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-white font-semibold'>
                        {currentChat?.avatar ? (
                          <img
                            src={currentChat?.profile_img}
                            alt={currentChat?.name}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          currentChat.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {currentChat.online && (
                        <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></div>
                      )}
                    </div>
                  </Link>
                  <Link to={`/user/${currentChat?.username}`}>
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-black text-xl md:text-3xl truncate'>
                        {currentChat.name}
                      </p>
                      <p className='text-sm text-gray-500 truncate'>
                        {currentChat.type === "group"
                          ? `${allusers} members`
                          : currentChat.online
                            ? "Online"
                            : formatLastSeen(currentChat.lastSeen)}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className=' hidden   items-center space-x-1 sm:space-x-2'>
                  <p>Block</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className='flex-1  scrollbar-hide overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4'>
            {loadings ? <Loader />: Object.entries(groupedMessages).map(([date, messages]) => (
                <div key={date}>
                  <div className='text-center text-xs text-gray-500 my-4'>
                    {getDateLabel(date)}
                  </div>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-4 ${
                        msg.isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-full sm:max-w-sm md:max-w-md p-2 lg:max-w-lg ${
                          msg.isOwn ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {!msg.isOwn && (
                          <Link to={`/user/${msg?.sender}`}>
                            <div className='w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-grey flex items-center justify-center text-black text-xs sm:text-sm font-semibold mr-2 sm:mr-3 flex-shrink-0'>
                              {msg.avatar}
                            </div>
                          </Link>
                        )}

                        <div
                          className={`px-3  ${
                            msg.messageType === "file" && msg.fileUrl
                              ? "bg-transparent"
                              : " "
                          } sm:px-4 py-2 rounded-2xl ${
                            msg.isOwn
                              ? "bg-black text-white"
                              : "bg-white text-black"
                          }`}
                        >
                          {msg.messageType === "file" && msg.fileUrl ? (
                            <img
                              src={msg.fileUrl}
                              alt='Uploaded file'
                              className='rounded-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-cover'
                            />
                          ) : (
                            <p className='text-sm sm:text-base'>
                              {msg.content}
                            </p>
                          )}

                          <p
                            className={`text-xs mt-1 ${
                              msg.isOwn ? "text-gray-500" : "text-gray-500"
                            }`}
                          >
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} className='h-0' />
            </div>

            {/* Message Input */}
            <div className='bg-white border-t border-gray-200 p-3 sm:p-4'>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={handleFileUpload}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0'
                >
                  <Paperclip className='w-4 h-4 sm:w-5 sm:h-5 text-gray-600' />
                  <input
                    type='file'
                    className='hidden'
                    accept='.png,.jpg,.jpeg,.gif'
                    ref={fileInputRef}
                    onChange={handleAttachmentChange}
                  />
                </button>

                <div className='flex-1 min-w-0'>
                  <div className='relative'>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder='Type a message...'
                      className='w-full px-3 sm:px-4 py-2 pr-10 sm:pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 text-sm sm:text-base bg-grey'
                      rows={1}
                    />
                    {emojiOpen && (
                      <div
                        ref={emojiRef}
                        className='absolute bottom-14 right-2 z-50 w-[90vw] max-w-[320px] sm:w-[280px] md:w-[320px] bg-white dark:bg-zinc-900 rounded-xl shadow-lg '
                      >
                        <Picker
                          theme='auto'
                          data={data}
                          onEmojiSelect={(e) => setMessage(message + e.native)}
                        />
                      </div>
                    )}

                    <button className='absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors'>
                      <Smile
                        className='w-4 h-4 sm:w-5 sm:h-5 text-gray-600'
                        onClick={() => setEmojiOpen((preval) => !preval)}
                      />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSendMessage}
                  className='p-2 bg-black text-white rounded-full hover:bg-grey-100 transition-colors flex-shrink-0'
                >
                  <Send className='w-4 h-4 sm:w-5 sm:h-5' />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex flex-col'>
            {/* Mobile header when no chat selected */}
            <div className='bg-white border-b border-gray-200 p-4 lg:hidden'>
              <div className='flex items-center justify-between'>
                <button
                  onClick={() => setShowSidebar(true)}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                >
                  <Menu className='w-5 h-5 text-gray-600' />
                </button>
                <h1 className='text-lg font-semibold text-gray-900'>
                  Messages
                </h1>
                <button className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
                  <Plus className='w-5 h-5 text-gray-600' />
                </button>
              </div>
            </div>

            {/* Empty state */}
            <div className='flex-1 flex items-center justify-center p-4'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Search className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Select a conversation
                </h3>
                <p className='text-gray-500 text-sm sm:text-base px-4'>
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
