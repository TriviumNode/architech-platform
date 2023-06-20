import React, { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem } from "@reach/menu-button";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";

import styles from './filtermenu.module.scss';

interface HoverMenuProps {
    title: string;
    options: string[];
    selected: string[];
    setOptions: (selected: string[]) => void;
}

export default function FilterMenu(props: HoverMenuProps) {
  const { title, options, selected, setOptions } = props;

  const [isOpen, setIsOpen] = useState<boolean>();

  const handleChange = (e: any) => {
    if (e.target.checked) {
      if (selected.includes(e.target.value)) return selected;
      else return [...selected, e.target.value];
    } else {
      return selected.filter(entry => entry !== e.target.value)
    }
  }

  return (
    <div className={styles.menuContainer} id="lalala">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={isOpen ? styles.openButton : undefined}
      >
        <span>{title}</span> <span aria-hidden>▾</span>
      </button>
      {isOpen && 
      <div className={`${styles.menu}`}>
        <form>
          {options.map(option=>{
            return (
              <div className='d-flex justify-content-between'>
                <div>
                  {option}
                </div>
                <input type="checkbox" value={option} onChange={handleChange} />
              </div>
            )
          })}
        </form>
      </div>
      }
    </div>
  );
}
