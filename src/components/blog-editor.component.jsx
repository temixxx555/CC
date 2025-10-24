import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import lightlogo from "../imgs/logo-light.png";
import darklogo from "../imgs/logo-dark.png";
import { Link, useNavigate, useParams } from "react-router-dom";
import defaultBanner from "../imgs/blog banner.png";
import lightdefaultBanner from "../imgs/blog banner light.png";
import darkdefaultBanner from "../imgs/blog banner dark.png";
import AnimationWrapper from "../common/page-animation";
import { toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJs from "@editorjs/editorjs";
import { tools } from "./tools.component";
import { ThemeContext, userContext } from "../App";
const BlogEditor = () => {
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditorState,
    setTextEditorState,
    setEditorState,
  } = useContext(EditorContext);
  let {
    userAuth: { access_token },
  } = useContext(userContext);
  let { theme } = useContext(ThemeContext);
  let { blog_id } = useParams();

  let navigate = useNavigate();
  useEffect(() => {
    if (!textEditorState.isReady) {
      setTextEditorState(
        new EditorJs({
          holder: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "Share your campus story! ✨",
        })
      );
    }
  }, []);
  const handleBannerUpload = async (e) => {
    try {
      let img = e.target.files[0];
      if (!img) {
        console.log("No file selected");
        return;
      }
      const toastId = toast.loading("Submitting your photo...");
      const formData = new FormData();
      formData.append("image", img);

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setBlog({ ...blog, banner: data.imageUrl });
      toast.dismiss(toastId);
      toast.success("Uploaded");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.dismiss(toastId);

      toast.error("Image upload failed:");
    }
  };
  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };
  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Please upload a banner");
    }
    if (!title.length) {
      return toast.error("Please enter a title");
    }
    if (textEditorState.isReady) {
      textEditorState
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("write something in your blog to publish it");
          }
        })
        .catch((err) => console.log(err));
    }
  };
 const HandleSaveDraft = async (e) => {
  if (e.target.className.includes("disable")) return;
  if (!title.length) return toast.error("Write blog title before saving Draft");

  e.target.classList.add("disable");
  const loadingToast = toast.loading("Saving Draft...");

  try {
    // Save current editor content
    const data = await textEditorState.save();

    if (!data.blocks.length) {
      toast.error("Write something before saving draft");
      e.target.classList.remove("disable");
      toast.dismiss(loadingToast);
      return;
    }

    const processedTags = Array.isArray(tags) ? tags : [];

    const blogObj = {
      title,
      banner: banner || "",
      content: data, // ✅ Use the freshly saved data
      tags: processedTags,
      des: des || "",
      draft: true,
    };

    console.log("Saving draft:", blogObj);

    await axios.post(
      `${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`,
      { ...blogObj, id: blog_id },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    toast.dismiss(loadingToast);
    toast.success("Draft saved successfully!");
    navigate("/dashboard/blogs?tab=draft");
  } catch (error) {
    console.error("Error saving draft:", error.response?.data || error.message);
    toast.dismiss(loadingToast);
    toast.error(error.response?.data?.error || "Failed to save draft");
  } finally {
    e.target.classList.remove("disable");
  }
};
  return (
    <>
      <nav className='navbar'>
        <Link to='/'>
          <img
            src={theme == "light" ? darklogo : lightlogo}
            alt='logo'
            className='flex-none w-10'
          />
        </Link>
        <p className='max-md:hidden text-black line-clamp-1 w-full '>
          {title.length ? title : "New Blog"}
        </p>
        <div className='flex gap-4 ml-auto'>
          <button onClick={handlePublishEvent} className='btn-dark py-2 '>
            Publish
          </button>
          <button onClick={HandleSaveDraft} className='btn-light py-2'>
            Save Draft
          </button>
        </div>
      </nav>
      <AnimationWrapper>
        <section>
          <div className='mx-auto max-w-[900px] w-full'>
            <div className='relative aspect-ratio bg-white border-4 border-grey hover:opacity-80'>
              <label htmlFor='uploadBanner'>
                <img
                  src={
                    !banner
                      ? theme == "light"
                        ? lightdefaultBanner
                        : darkdefaultBanner
                      : banner
                  }
                  alt='banner'
                  className='z-20'
                />
                <input
                  type='file'
                  id='uploadBanner'
                  accept='.png,.jpg,.jpeg'
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
          </div>
          <textarea
            defaultValue={title}
            placeholder='Blog Title'
            name=''
            id=''
            className='text-4xl font-medium w-full h-20 border-none resize-none mt-10 leading-tight placeholder:opacity-40  bg-white'
            onKeyDown={handleTitleKeyDown}
            onChange={handleTitleChange}
          ></textarea>
          <hr className='w-full opacity-10 my-5' />

          <div id='textEditor' className='font-gelasio'></div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
