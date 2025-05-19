import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import axios from "axios";

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        /**
         * Upload Image by File
         */
        uploadByFile: async (file) => {
          try {
            const formData = new FormData();
            formData.append("image", file);

            const { data } = await axios.post(
              `${import.meta.env.VITE_SERVER_DOMAIN}/upload-image`,
              formData,
              { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Editor.js expects an object with success and file properties
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
            // Directly pass the image URL
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
