// Create a user-friendly YouTube tool
class YouTubeEmbedTool {
  static get toolbox() {
    return {
      title: "YouTube Video",
      icon: `<svg width="18" height="12" viewBox="0 0 18 12">
        <path fill="#FF0000" d="M17.6 1.9c-.2-.7-.8-1.3-1.5-1.5C14.7 0 9 0 9 0S3.3 0 1.9.4C1.2.6.6 1.2.4 1.9 0 3.3 0 6 0 6s0 2.7.4 4.1c.2.7.8 1.3 1.5 1.5C3.3 12 9 12 9 12s5.7 0 7.1-.4c.7-.2 1.3-.8 1.5-1.5C18 8.7 18 6 18 6s0-2.7-.4-4.1z"/>
        <path fill="#FFFFFF" d="M7.2 8.5L11.8 6 7.2 3.5v5z"/>
      </svg>`,
    };
  }

  constructor({ data, api, config }) {
    this.api = api;
    this.config = config || {};
    this.data = {
      url: data.url || "",
      caption: data.caption || "",
    };
    this.wrapper = undefined;
    this.input = undefined;
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("youtube-tool");
    this.wrapper.style.cssText = `
      border: 2px dashed #e6e8eb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      background: #f9f9fb;
      transition: all 0.15s ease;
    `;

    if (this.data.url && this._getVideoId(this.data.url)) {
      this._renderVideo();
    } else {
      this._renderInput();
    }

    return this.wrapper;
  }

  _renderInput() {
    this.wrapper.innerHTML = `
      <h4 style="color:#707684;font-size:16px;">Paste a YouTube video URL</h4>
      <input 
        type="text" 
        placeholder="https://www.youtube.com/watch?v=..." 
        style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;color:black"
      />
      <div style="font-size:12px;margin-top:6px;color:#666;">
        Supported formats: youtube.com/watch, youtu.be, /live
      </div>
    `;

    this.input = this.wrapper.querySelector("input");
    this.input.value = this.data.url || "";

    this.input.addEventListener("input", this._handleInput.bind(this));
    this.input.addEventListener("paste", (e) => {
      setTimeout(() => this._handleInput(e), 100);
    });
  }

  _handleInput(e) {
    const url = e.target.value.trim();
    if (this._isValidYouTubeUrl(url)) {
      this.data.url = url;
      this._renderVideo();
    }
  }

  _renderVideo() {
    const videoId = this._getVideoId(this.data.url);

    if (!videoId) {
      this.wrapper.innerHTML = `
        <div style="color: red; font-size: 14px;">
          Could not extract video ID. Please use a direct YouTube video link (not a channel/live link).
        </div>
      `;
      return;
    }

    this.wrapper.innerHTML = `
      <div style="position: relative; border-radius: 8px; overflow: hidden; background: #000;">
        <div style="position: relative; padding-bottom: 56.25%; height: 0;">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            frameborder="0" 
            allowfullscreen 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      </div>
      <input 
        type="text" 
        placeholder="Add a caption (optional)" 
        value="${this.data.caption}"
        class="input"
        style="width: 100%; padding: 8px 12px; margin-top: 10px; border: 1px solid #ccc; border-radius: 4px; color:black;"
      />
      <div style="text-align:right;margin-top:6px;">
        <button style="background:#ef4444;color:white;padding:6px 12px;border:none;border-radius:4px;cursor:pointer;">
          Remove Video
        </button>
      </div>
    `;

    const captionInput = this.wrapper.querySelector('input[type="text"]');
    captionInput.addEventListener("input", (e) => {
      this.data.caption = e.target.value;
    });

    const removeBtn = this.wrapper.querySelector("button");
    removeBtn.addEventListener("click", () => {
      this.data.url = "";
      this.data.caption = "";
      this._renderInput();
    });
  }

  _isValidYouTubeUrl(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
  }

  _getVideoId(url) {
    try {
      // Support multiple formats
      const patterns = [
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/
      ];

      for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
      }

      return null;
    } catch {
      return null;
    }
  }

  save() {
    const videoId = this._getVideoId(this.data.url);
    if (!videoId) return {};

    return {
      service: "youtube",
      source: this.data.url,
      embed: `https://www.youtube.com/embed/${videoId}`,
      width: 580,
      height: 320,
      caption: this.data.caption || "",
    };
  }

  static get sanitize() {
    return {
      service: false,
      source: false,
      embed: false,
      width: false,
      height: false,
      caption: {
        br: true,
      },
    };
  }

  validate(savedData) {
    return savedData.source && savedData.embed;
  }
}


// Updated tools configuration
import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import axios from "axios";

export const tools = {
  // Replace the embed tool with our custom YouTube tool
  youtube: YouTubeEmbedTool,

  // Keep the regular embed for other platforms if needed
  embed: {
    class: Embed,
    config: {
      services: {
        vimeo: true,
        facebook: true,
        instagram: true,
        twitter: true,
        codepen: true,
        // Remove youtube from here since we have a dedicated tool
      },
    },
    inlineToolbar: true,
  },

  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByFile: async (file) => {
          try {
            const formData = new FormData();
            formData.append("image", file);

            const { data } = await axios.post(
              `${import.meta.env.VITE_SERVER_DOMAIN}/upload-image`,
              formData,
              { headers: { "Content-Type": "multipart/form-data" } }
            );

            return {
              success: 1,
              file: {
                url: data.imageUrl,
              },
            };
          } catch (error) {
            console.error("File upload failed:", error);
            return {
              success: 0,
            };
          }
        },
        uploadByUrl: async (url) => {
          try {
            return {
              success: 1,
              file: {
                url,
              },
            };
          } catch (error) {
            console.error("URL upload failed:", error);
            return {
              success: 0,
            };
          }
        },
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading ....",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
};
