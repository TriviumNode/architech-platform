import React, { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem } from "@reach/menu-button";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";

import styles from './SelectMenu.module.scss';

export interface SelectOption {
  content: any;
  value: any;
}

interface SelectMenuProps {
    title: any;
    options: SelectOption[];
    selected: SelectOption | undefined;
    select: (Option: SelectOption) => void;
    className?: string;
}

export default function SelectMenu({ title, options, selected, select, className }: SelectMenuProps) {
  console.log('options!', options)

  const [isOpen, setIsOpen] = useState<boolean>();

  const handleClick = (option: SelectOption) => {
      select(option);
      setIsOpen(false);
  }

  // const handleChange = (e: any) => {
  //   if (e.target.checked) {
  //     if (selected.includes(e.target.value)) return selected;
  //     else return [...selected, e.target.value];
  //   } else {
  //     return selected.filter(entry => entry !== e.target.value)
  //   }
  // }

  return (
    <div className={`${styles.menuContainer} ${className}`} id="lalala">
      <button
        type='button'
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={isOpen ? styles.openButton : undefined}
      >
        <span>{selected ? selected.content : title}</span> <span aria-hidden>▾</span>
      </button>
      {isOpen && 
      <div className={`${styles.menu}`}>
          {options.map(option=>{
            return (
              <button type='button' className={`${styles.menuOption}`} onClick={()=>handleClick(option)}>
                  {option.content}
              </button>
            )
          })}
      </div>
      }
    </div>
  );
}
