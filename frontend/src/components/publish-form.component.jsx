import { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

const PublishForm = () => {
    let charcterLimit = 200;
    let tagLimit = 10;
    let {
        blog,
        blog: { banner, title, tags, des, content },
        setEditorState,
        setBlog,
    } = useContext(EditorContext);
    let {
        userAuth: { access_token },
    } = useContext(UserContext);
    let navigate = useNavigate();

    // Close the publish form and return to the editor
    const handleCloseEvent = () => {
        setEditorState("editor");
    };

    // Update blog title state when input changes
    const handleBlogTitleChange = (e) => {
        let input = e.target;
        setBlog({ ...blog, title: input.value });
    };

    // Update blog description state when input changes
    const handleBlogDesChange = (e) => {
        let input = e.target;
        setBlog({ ...blog, des: input.value });
    };

    // Prevent new lines in title input field
    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    };

    // Handle tag input and add to tags array when Enter (13) or Comma (188) is pressed
    const handleKeyDown = (e) => {
        if (e.keyCode == 13 || e.keyCode == 188) {
            e.preventDefault();
            let tag = e.target.value.trim(); // Trim spaces

            if (tags.length < tagLimit) {
                if (!tags.includes(tag) && tag.length) {
                    setBlog({ ...blog, tags: [...tags, tag] });
                }
            } else {
                toast.error(`You can add max ${tagLimit} Tags`);
            }
            e.target.value = "";
        }
    };

    // Function to validate and publish the blog post to the server.
    const publishBlog = (e) => {
        if (e.target.className.includes("disable")) {
            return;
        }

        if (!title.length) {
            return toast.error("Please enter a title");
        }

        if (!des.length || des.length > charcterLimit) {
            return toast.error(
                `Write a description about your blog within ${charcterLimit} characters to publish`
            );
        }

        if (!tags.length) {
            return toast.error("Please add at least one tag to rank your blog");
        }

        let loadingToast = toast.loading("Publishing...");
        e.target.classList.add("disable");

        let blogObj = {
            title,
            banner,
            des,
            content,
            tags,
            draft: false,
        };

        axios
            .post(
                import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
                blogObj,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            )
            .then(() => {
                e.target.classList.remove("disable");
                toast.dismiss(loadingToast);
                toast.success("Blog Published Successfully");

                setTimeout(() => {
                    navigate("/");
                }, 500);
            })
            .catch(({ response }) => {
                e.target.classList.remove("disable");
                toast.dismiss(loadingToast);

                return toast.error(response.data);
            });
    };

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster />
                {/* Close button */}
                <button
                    className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                    onClick={handleCloseEvent}
                >
                    <i className="fi fi-br-cross"></i>
                </button>

                {/* Blog preview section */}
                <div className="max-w-[550] center">
                    <p className="text-dark-grey mb-1">Preview</p>
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={banner} />
                    </div>

                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
                        {title}
                    </h1>
                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
                        {des}
                    </p>
                </div>

                {/* Blog details input section */}
                <div className="border-grey lg:border-1 lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
                    <input
                        type="text"
                        placeholder="Blog Title"
                        defaultValue={title}
                        className="input-box pl-4"
                        onChange={handleBlogTitleChange}
                    />

                    <p className="text-dark-grey mb-2 mt-9">
                        Short description about your blog
                    </p>
                    <textarea
                        maxLength={charcterLimit}
                        defaultValue={des}
                        className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handleBlogDesChange}
                        onKeyDown={handleTitleKeyDown}
                    ></textarea>

                    <p className="mt-1 text-dark-grey text-sm text-right">
                        {charcterLimit - des.length} characters left
                    </p>

                    {/* Tag input and list */}
                    <p className="text-dark-grey mb-2 mt-9">
                        Topics - (Helps in searching and ranking your blog post)
                    </p>

                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input
                            type="text"
                            placeholder="Topic"
                            className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
                            onKeyDown={handleKeyDown}
                        />

                        {/* Render tags */}
                        {tags.map((tag, i) => {
                            return <Tag tag={tag} tagIndex={i} key={i} />;
                        })}
                    </div>

                    <p className="mt-1 mb-4 text-dark-grey text-right">
                        {tagLimit - tags.length} Tags Left
                    </p>

                    {/* Publish button */}
                    <button className="btn-dark px-8" onClick={publishBlog}>
                        Publish
                    </button>
                </div>
            </section>
        </AnimationWrapper>
    );
};

export default PublishForm;
