import { useState } from "react";

const InputBox = ({disable=false, name, type, id, value, placeholder, icon }) => {
const [passwordVisible,setpasswordVisible]= useState(false)

  return (
    <div className='relative w-[100%] mb-4 '>
      <input
        type={type == "password" ? passwordVisible ? "text" : "password" : "text" }
        name={name}
        placeholder={placeholder}
        defaultValue={value} //if you just use the normal value method ,it will not work
        id={id}
        className='input-box '
        disabled={disable}
      />
      <i className={"fi " + icon + " input-icon"}></i>

      {type === "password" ? <i className={`fi  + ${!passwordVisible ? "fi-rr-eye-crossed" : "fi-rr-eye "} + input-icon left-[auto] right-4 cursor-pointer `}
      onClick={()=> setpasswordVisible(currentVal => !currentVal)}
      ></i> : ""}
    </div>
  );
};
export default InputBox;
