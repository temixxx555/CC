// Create a user-friendly YouTube tool
class YouTubeEmbedTool {
  static get toolbox() {
    return {
      title: 'YouTube Video',
      icon: `<svg width="18" height="12" viewBox="0 0 18 12">
        <path fill="#FF0000" d="M17.6 1.9c-.2-.7-.8-1.3-1.5-1.5C14.7 0 9 0 9 0S3.3 0 1.9.4C1.2.6.6 1.2.4 1.9 0 3.3 0 6 0 6s0 2.7.4 4.1c.2.7.8 1.3 1.5 1.5C3.3 12 9 12 9 12s5.7 0 7.1-.4c.7-.2 1.3-.8 1.5-1.5C18 8.7 18 6 18 6s0-2.7-.4-4.1z"/>
        <path fill="#FFFFFF" d="M7.2 8.5L11.8 6 7.2 3.5v5z"/>
      </svg>`
    };
  }

  constructor({ data, api, config }) {
    this.api = api;
    this.config = config || {};
    this.data = {
      url: data.url || '',
      caption: data.caption || '',
      width: data.width || null,
      height: data.height || null
    };
    this.wrapper = undefined;
    this.input = undefined;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('youtube-tool');
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
      <div style="margin-bottom: 15px;">
        <svg style="margin-bottom: 10px;" width="48" height="32" viewBox="0 0 18 12">
          <path fill="#FF0000" d="M17.6 1.9c-.2-.7-.8-1.3-1.5-1.5C14.7 0 9 0 9 0S3.3 0 1.9.4C1.2.6.6 1.2.4 1.9 0 3.3 0 6 0 6s0 2.7.4 4.1c.2.7.8 1.3 1.5 1.5C3.3 12 9 12 9 12s5.7 0 7.1-.4c.7-.2 1.3-.8 1.5-1.5C18 8.7 18 6 18 6s0-2.7-.4-4.1z"/>
          <path fill="#FFFFFF" d="M7.2 8.5L11.8 6 7.2 3.5v5z"/>
        </svg>
        <h4 style="margin: 10px 0; color: #707684; font-size: 16px; font-weight: 500;">Add YouTube Video</h4>
        <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 14px;">Paste a YouTube URL to embed the video</p>
      </div>
      <input 
        type="text" 
        placeholder="https://www.youtube.com/watch?v=..." 
        style="
          width: 100%; 
          padding: 12px 16px; 
          border: 1px solid #d1d5db; 
          border-radius: 6px; 
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s ease;
        "
      />
      <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
        Supported formats: youtube.com/watch, youtu.be links
      </div>
    `;

    this.input = this.wrapper.querySelector('input');
    
    // Style focus state
    this.input.addEventListener('focus', () => {
      this.input.style.borderColor = '#3b82f6';
      this.input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    });

    this.input.addEventListener('blur', () => {
      this.input.style.borderColor = '#d1d5db';
      this.input.style.boxShadow = 'none';
    });

    // Handle input
    this.input.addEventListener('input', this._handleInput.bind(this));
    this.input.addEventListener('paste', (e) => {
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
      this._renderInput();
      return;
    }

    this.wrapper.innerHTML = `
      <div style="position: relative; border-radius: 8px; overflow: hidden; background: #000;">
        <div style="position: relative; padding-bottom: 56.25%; height: 0;">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            frameborder="0" 
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
          </iframe>
        </div>
      </div>
      <div style="margin-top: 12px;">
        <input 
          type="text" 
          placeholder="Add a caption (optional)" 
          value="${this.data.caption}"
          style="
            width: 100%; 
            padding: 8px 12px; 
            border: 1px solid #e5e7eb; 
            border-radius: 4px; 
            font-size: 14px;
            outline: none;
          "
        />
      </div>
      <div style="margin-top: 8px; text-align: right;">
        <button 
          type="button"
          style="
            background: #ef4444; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px; 
            font-size: 12px; 
            cursor: pointer;
            transition: background-color 0.15s ease;
          "
          onmouseover="this.style.backgroundColor='#dc2626'" 
          onmouseout="this.style.backgroundColor='#ef4444'"
        >
          Remove Video
        </button>
      </div>
    `;

    // Add event listeners
    const captionInput = this.wrapper.querySelector('input[type="text"]');
    captionInput.addEventListener('input', (e) => {
      this.data.caption = e.target.value;
    });

    const removeButton = this.wrapper.querySelector('button');
    removeButton.addEventListener('click', () => {
      this.data.url = '';
      this.data.caption = '';
      this._renderInput();
    });
  }

  _isValidYouTubeUrl(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
  }

  _getVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }

  save() {
    const videoId = this._getVideoId(this.data.url);
    if (!videoId) {
      return {};
    }

    return {
      service: 'youtube',
      source: this.data.url,
      embed: `https://www.youtube.com/embed/${videoId}`,
      width: 580,
      height: 320,
      caption: this.data.caption || ''
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
      }
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
      }
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