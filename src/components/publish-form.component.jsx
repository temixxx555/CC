import React, { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import toast from "react-hot-toast";
import axios from "axios";
import { userContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";

const PublishForm = () => {
  let characterLimit = 200;
  let tagLimit = 10;
  let {blog_id} = useParams()
  let {
    setEditorState,
    textEditorState,
    setBlog,
    blog,
    blog: { content, banner, title, tags = [], des } = {}, // Default to empty array if tags is undefined
  } = useContext(EditorContext) || {}; // Fallback for context

  let {
    userAuth: { access_token },
  } = useContext(userContext);
  let navigate = useNavigate();
  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogDesChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, des: input.value });
  };

  const handleBlogTitleChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, title: input.value });
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      // Enter or comma
      e.preventDefault();
      let tag = e.target.value.trim();
      if (tag.length && tags.length < tagLimit && !tags.includes(tag)) {
        setBlog({ ...blog, tags: [...tags, tag] });
        e.target.value = ""; // Clear input after adding tag
      } else {
        toast.error("cant add duplicate or more than 10 tags");
      }
    }
  };
  const PublishForm = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write blog title before publishing");
    }
    if (!des.length || des.length > characterLimit) {
      return toast.error("Write a description before publishing");
    }
    if (!tags.length) {
      return toast.error("Enter at least one tag before publishing");
    }
    let loadingToast = toast.loading("Publishing...");
    e.target.classList.add("disable");
if(textEditorState.isReady){
  textEditorState.save().then(content => {
    let blogObj = {
      title,
      banner,
      content,
      tags,
      des,
      draft: false,
    };

    axios
    .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {...blogObj,id:blog_id}, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
    .then(() => {
      e.target.classList.remove("disable");
      toast.dismiss(loadingToast);
      toast.success("Published");

      setTimeout(() => {
        navigate("/dashboard/blogs");
      }, 500);
    })
    .catch(({ response }) => {
      e.target.classList.remove("disable");
      toast.dismiss(loadingToast);

      return toast.error(response.data.error);
    });
  })
}
   
  
  };
  return (
    <AnimationWrapper>
      <section className='w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4'>
        <button
          className='w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]'
          onClick={handleCloseEvent}
        >
          <i className='fi fi-br-cross'></i>
        </button>
        <div className='max-w-[550px] center'>
          <p className='text-dark-grey mb-1'>Preview</p>

          <div className='w-full aspect-video rounded-lg overflow-hidden bg-grey mt-8'>
            <img src={banner} alt='banner' />
          </div>
          <h1 className='text-4xl font-medium mt-2 leading-tight line-clamp-2'>
            {title}
          </h1>
          <p className='font-gelasio line-clamp-2 text-xl leading-7 mt-4'>
            {des}
          </p>
        </div>

        <div className='border-grey lg:border-1 lg:pl-8 mt-40 md:mt-0'>
          <p className='text-dark-grey'>Blog Title</p>
          <input
            type='text'
            placeholder='Blog Title'
            defaultValue={title}
            className='input-box pl-4'
            onChange={handleBlogTitleChange}
          />
          <p className='text-dark-grey mb-2'>Description about your blog</p>
          <textarea
            maxLength={characterLimit}
            placeholder='Write a short description, can be your blog title'
            defaultValue={des}
            className='h-40 resize-none leading-7 input-box pl-4'
            onChange={handleBlogDesChange}
            onKeyDown={handleTitleKeyDown}
          ></textarea>
          <p className='mt-1 text-dark-grey text-sm text-right'>
            {characterLimit - (des?.length || 0)} characters left
          </p>
          <p className='text-dark-grey mb-2'>
            Tags - (just write a word and click enter on keypad)
          </p>

          <div className='relative input-box pl-2 pb-4'>
            <input
              type='text'
              placeholder='Tag'
              className='sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white'
              onKeyDown={handleKeyDown}
            />
            {tags.map((tag, i) => (
              <Tag tag={tag} key={i} tagIndex={i} />
            ))}
          </div>
          <p className='mt-1 mb-4 text-dark-grey text-right'>
            {tagLimit - tags.length} Tags left
          </p>
          <button onClick={PublishForm} className='btn-dark px-8'>
            Publish
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
