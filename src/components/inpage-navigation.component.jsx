import { useEffect, useRef, useState } from "react";
export let ActiveTabButons
export let activeTabLineRef
const InPageNavigation = ({
  defaultHidden = [],
  routes,
  defaultActiveIndex = 0,
  children,
}) => {
  let [InPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);
  ActiveTabButons = useRef();
  activeTabLineRef = useRef();
  const changePageState = (btn, i) => {
    let { offsetWidth, offsetLeft } = btn;
    activeTabLineRef.current.style.width = offsetWidth + "px";
    activeTabLineRef.current.style.left = offsetLeft + "px";
    setInPageNavIndex(i);
  };
  useEffect(() => {
    changePageState(ActiveTabButons.current, defaultActiveIndex);
  }, [setInPageNavIndex]);
  
  return (
    <>
      <div className='relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto'>
        {routes.map((route, i) => {
          return (
            <button
              ref={i == defaultActiveIndex ? ActiveTabButons : null}
              onClick={(e) => {
                changePageState(e.target, i);
              }}
              key={i}
              className={`px-4 p-4 capitalize ${
                InPageNavIndex == i ? "text-black" : "text-dark-grey "
              } ${defaultHidden.includes(route) ? "md:hidden" : ""}`}
            >
              {route}
            </button>
          );
        })}
        <hr
          ref={activeTabLineRef}
          className={`absolute bottom-0 duration-3000 ${
            defaultHidden.includes(routes[InPageNavIndex]) ? "md:hidden" : ""
          }`}
        />
      </div>

      {Array.isArray(children) ? children[InPageNavIndex] : children}
    </>
  );
};
export default InPageNavigation;
