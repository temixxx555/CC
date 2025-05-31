const Img = ({ url, caption }) => {
  return (
    <div>
      <img src={url} alt="image" />
      {caption.length ? (
        <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">
          {caption}
        </p>
      ) : null}
    </div>
  );
};

const Quote = ({ quote, caption }) => {
  return (
    <div className="bg-purple/10 p-3 pl-5 border-1-4 border-purple">
      <p
        className="text-xl leading-10 md:text-2xl"
        dangerouslySetInnerHTML={{ __html: quote }}
      ></p>
      {caption.length ? (
        <p className="w-full text-purple text-base">{caption}</p>
      ) : null}
    </div>
  );
};

// New YouTube component
const YouTubeEmbed = ({ data }) => {
  // Handle both custom YouTube tool and regular embed tool
  const embedUrl = data.embed || data.source;
  const caption = data.caption || '';
  
  if (!embedUrl) return null;

  // Extract video ID for consistent embedding
  const getVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = getVideoId(embedUrl);
  
  if (!videoId) return null;

  return (
    <div className="my-6">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1`}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="YouTube video"
        />
      </div>
      {caption && (
        <p className="w-full text-center my-3 text-base text-dark-grey">
          {caption}
        </p>
      )}
    </div>
  );
};

// Generic Embed component for other platforms
const EmbedBlock = ({ data }) => {
  const { service, embed, width, height, caption } = data;
  
  if (!embed) return null;

  return (
    <div className="my-6">
      <div className="relative w-full overflow-hidden rounded-lg">
        <iframe
          src={embed}
          width={width || '100%'}
          height={height || '315'}
          frameBorder="0"
          allowFullScreen
          className="w-full"
          title={`${service || 'Embedded'} content`}
        />
      </div>
      {caption && (
        <p className="w-full text-center my-3 text-base text-dark-grey">
          {caption}
        </p>
      )}
    </div>
  );
};

const List = ({ style, items }) => {
  if (!Array.isArray(items)) {
    console.error("List items must be an array:", items);
    return null;
  }

  // Handle checklist style
  if (style === "checklist") {
    return (
      <div className="my-4">
        {items.map((item, i) => {
          const content = typeof item === "object" && item.content ? item.content : String(item);
          // Check meta.checked, default to false if absent
          const isChecked = item.meta && typeof item.meta.checked === "boolean" ? item.meta.checked : false;
          

          return (
            <div key={i} className="flex items-center my-2">
              <span
                className={`mr-2 h-6 w-6 flex items-center justify-center `}
                
              >
                {isChecked ? (
              <svg fill="#000000" width="800px" height="800px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" ><title>box-tick</title><path d="M96 448Q82 448 73 439 64 430 64 416L64 96Q64 82 73 73 82 64 96 64L416 64Q430 64 439 73 448 82 448 96L448 416Q448 430 439 439 430 448 416 448L96 448ZM367 192L331 160 230 282 177 229 145 261 234 350 367 192Z" /></svg>
                ) : (
                  <svg fill="#000000" width="800px" height="800px" viewBox="-3.5 0 19 19" xmlns="http://www.w3.org/2000/svg" className="cf-icon-svg"><path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 0 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z"/></svg>
                )}
              </span>
              <span className="text-base" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          );
        })}
      </div>
    );
  }

  // Handle ordered/unordered lists
  const ListTag = style === "unordered" ? "ul" : "ol";
  return (
    <ListTag className={style === "unordered" ? "list-disc pl-5" : "list-decimal pl-5"}>
      {items.map((item, i) => {
        const content = typeof item === "object" && item.content ? item.content : String(item);
        return (
          <li key={i} className="my-4">
            {content.includes("<") ? (
              <span dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              content
            )}
          </li>
        );
      })}
    </ListTag>
  );
};


const BlogContent = ({ block }) => {
  let { type, data } = block;
  
  if (type === "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>;
  }
  
  if (type === "header") {
    if (data.level === 3) {
      return (
        <h3
          className="text-3xl font-bold"
          dangerouslySetInnerHTML={{ __html: data.text }}
        ></h3>
      );
    }
    return (
      <h2
        className="text-4xl font-bold"
        dangerouslySetInnerHTML={{ __html: data.text }}
      ></h2>
    );
  }
  
  if (type === "image") {
    return <Img url={data.file?.url || ""} caption={data.caption || ""} />;
  }
  
  if (type === "quote") {
    return <Quote quote={data.text || ""} caption={data.caption || ""} />;
  }
  
  if (type === "list") {
    return <List style={data.style || "ordered"} items={data.items || []} />;
  }
  
  // Add YouTube/embed support
  if (type === "youtube") {
    return <YouTubeEmbed data={data} />;
  }
  
  if (type === "embed") {
    // Check if it's a YouTube embed specifically
    if (data.service === "youtube" || (data.source && data.source.includes('youtube'))) {
      return <YouTubeEmbed data={data} />;
    }
    // Handle other embed types
    return <EmbedBlock data={data} />;
  }
  
  // Debug: Log unhandled block types
  console.warn(`Unhandled block type: ${type}`, data);
  
  return null;
};

export default BlogContent;