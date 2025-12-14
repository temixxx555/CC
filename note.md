You can make use of a context to track the note location


        <Link to={`/blog/${id}`}>
          <div className='mt-3'>
            {/* Title */}
            <h1 className='text-lg font-semibold text-dark-grey line-clamp-2 mb-2 hover:underline'>
              {title}
            </h1>

            {/* Preview Text */}
            {previewText ? (
              <p className='text-dark text-[15px] leading-relaxed line-clamp-3 mb-3'>
                {previewText.slice(0, 210)}...
              </p>
            ) : (
              <p className='text-gray-500 italic text-[15px] mb-3'>
                Read more...
              </p>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className='flex gap-2 mb-3 flex-wrap'>
                {tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className='bg-blue-50 text-gray-500 px-3 py-1 rounded-full text-xs font-medium'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>