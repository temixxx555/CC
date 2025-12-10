const LoadMoreData = ({ state, fetchData, additionalParam }) => {
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <div className="flex justify-center py-6">
        <button
          className="text-dark-grey p-3 px-6 hover:bg-grey/30 rounded-full flex items-center gap-2 border border-grey hover:border-dark-grey transition-all font-medium"
          onClick={() => fetchData({ ...additionalParam, page: state.page + 1 })}
        >
          <i className="fi fi-rr-refresh"></i>
          Load More
        </button>
      </div>
    );
  }
};

export default LoadMoreData;