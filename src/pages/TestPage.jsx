import React, { useState } from 'react';
import { Send, MessageCircle, Eye, Heart, Share2 } from 'lucide-react';

const AnonymousPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Anyone else feeling like they're just going through the motions lately? Like life is on autopilot?",
      timestamp: "2h ago",
      likes: 23,
      views: 156,
      color: "bg-purple-500"
    },
    {
      id: 2,
      text: "I finally told my crush how I feel... they said they felt the same way! Sometimes taking risks pays off 💜",
      timestamp: "4h ago",
      likes: 89,
      views: 234,
      color: "bg-pink-500"
    },
    {
      id: 3,
      text: "Does anyone else lie awake at 3am thinking about that embarrassing thing you did 5 years ago?",
      timestamp: "6h ago",
      likes: 156,
      views: 412,
      color: "bg-blue-500"
    },
    {
      id: 4,
      text: "I've been pretending to understand my job for 3 months now. Imposter syndrome is real.",
      timestamp: "8h ago",
      likes: 67,
      views: 298,
      color: "bg-green-500"
    },
    {
      id: 5,
      text: "Just wanted to say: you're doing better than you think you are. Keep going.",
      timestamp: "10h ago",
      likes: 234,
      views: 567,
      color: "bg-yellow-500"
    },
    {
      id: 6,
      text: "Sometimes I wonder if my pets judge me for talking to them like they're humans... but then I remember they probably do the same thing.",
      timestamp: "12h ago",
      likes: 45,
      views: 189,
      color: "bg-indigo-500"
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const colors = ["bg-purple-500", "bg-pink-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-indigo-500", "bg-red-500"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const message = {
        id: messages.length + 1,
        text: newMessage,
        timestamp: "now",
        likes: 0,
        views: 1,
        color: randomColor
      };
      
      setMessages([message, ...messages]);
      setNewMessage('');
    }
  };

  const handleLike = (id) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, likes: msg.likes + 1 } : msg
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Anonymous
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            {messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {/* Message Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${message.color}`}></div>
                  <span className="text-sm text-gray-400">Anonymous</span>
                </div>
                <span className="text-xs text-gray-500">{message.timestamp}</span>
              </div>

              {/* Message Content */}
              <p className="text-gray-100 leading-relaxed mb-4 text-base">
                {message.text}
              </p>

              {/* Message Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(message.id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-pink-400 transition-colors duration-200 group"
                  >
                    <Heart className="w-4 h-4 group-hover:fill-current" />
                    <span className="text-sm">{message.likes}</span>
                  </button>
                  
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{message.views}</span>
                  </div>
                </div>

                <button className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts anonymously..."
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none border border-gray-600 min-h-[50px] max-h-32"
                rows="1"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 text-white p-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Your message will be posted anonymously
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousPage;