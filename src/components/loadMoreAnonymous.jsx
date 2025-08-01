const LoadMoreAnonymous = ({ state, fetchData, additionalParam }) => {
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <button
        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
        onClick={() => fetchData({ ...additionalParam, page: state.page + 1 })}
      >
        Load more
      </button>
    );
  }

  return null;
};

export default LoadMoreAnonymous;
