import React from 'react';
import { HiOutlinePlus } from "react-icons/hi2";

const AddButton = ({ onClick, text }) => {
  return (
      <button
          onClick={onClick}
          type="button"
          className="group relative w-[180px] h-[48px] cursor-pointer flex items-center justify-between
                 border border-white/10 bg-background rounded-xl overflow-hidden
                 shadow-[4px_4px_0px_var(--primary)] transition-all duration-300
                 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      >
        <span className="pl-5 text-sm font-space text-foreground font-bold tracking-tight transition-all duration-300 group-hover:opacity-0 group-hover:-translate-x-3">
        {text}
      </span>

        <span className="absolute right-0 h-full w-[48px]
                       border-l border-destructive/60
                       flex items-center justify-center transition-all duration-500 ease-in-out
                       group-hover:w-full group-hover:bg-primary group-hover:border-none">
        <HiOutlinePlus
            className="text-primary text-xl transition-all duration-500 group-hover:text-card group-hover:scale-125 group-hover:rotate-90"
        />
      </span>
      </button>
  );
};

export default AddButton;