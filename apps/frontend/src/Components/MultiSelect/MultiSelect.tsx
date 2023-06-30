import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem } from "@reach/menu-button";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";

import styles from './MultiSelect.module.scss';
import Badge from "../Badge";
import useOutsideClick from "../../Hooks/useOutsideClick";

interface MultiSelectProps {
    title: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    style?: CSSProperties;
    className?: string;
}

export default function MultiSelect(props: MultiSelectProps) {
  const { title, options, selected, style, className, onChange } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef(null);

  const onClickOutside = () => {
    console.log('CLICK OUTSIDE!!')
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      //@ts-expect-error
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside && onClickOutside();
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);
  

  const handleChange = (e: any) => {
    if (e.target.checked) {
      if (selected.includes(e.target.value)) onChange(selected); //this shouldnt ever happen
      else onChange([...selected, e.target.value]);
    } else {
      onChange(selected.filter(entry => entry !== e.target.value))
    }
  }


  return (
    <div ref={ref} className={`${styles.menuContainer} ${className}`} style={style}>
      <button
        type='button'
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={isOpen ? styles.openButton : undefined}
      >
        {selected.length ? 
          <div className='d-flex gap8'>
            {selected.map(item=>
              <Badge key={item} >{item}</Badge>
            )}
          </div>
        :
          <span>{title}</span>
        }
        <span aria-hidden>▾</span>
      </button>
      {isOpen && 
      <div className={`${styles.menu}`}>
          {options.map((option, key)=>{
            return (
              <React.Fragment key={option}>
                <div className={styles.item}>
                  <div>
                    {option}
                  </div>
                  <div style={{minWidth: '24px'}}>
                    <input className='wide' type="checkbox" checked={selected.includes(option)} value={option} onChange={handleChange} />
                  </div>
                </div>
                { key < options.length - 1 ? <hr /> : undefined}
              </React.Fragment>
            )
          })}
      </div>
      }
    </div>
  );
}
