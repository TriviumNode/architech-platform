import React, { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem } from "@reach/menu-button";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";

import styles from './filtermenu.module.scss';
import { cw721 } from "@architech/types";

interface HoverMenuProps {
    title: string;
    options: string[];
    selected: string[];
    setOptions: (selected: string[]) => void;
}

interface TraitMenuProps {
  trait_type: string;
  traits: cw721.Trait[];
  selected_traits: Partial<cw721.Trait>[];
  onCheck: (checked: cw721.Trait) => void;
  onUncheck: (unchecked: cw721.Trait) => void;
}

export function TraitFilterMenu(props: TraitMenuProps) {
  const { trait_type, traits, selected_traits, onCheck, onUncheck } = props;
  const [isOpen, setIsOpen] = useState<boolean>();

  const handleChange = (trait: cw721.Trait, checked: boolean): void => {
    if (checked) {
      onCheck(trait);
    } else {
      onUncheck(trait);
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
        <span>{trait_type}</span> <span aria-hidden>▾</span>
      </button>
      {isOpen && 
      <div className={`${styles.menu} flex-column`}>
        <hr style={{margin: 0}} />
        <form>
          {traits.map(trait=>{
            return (
              <div key={trait.value} className='d-flex justify-content-between'>
                <div className='d-flex align-items-center'>
                  {trait.value}
                </div>
                <input type="checkbox" checked={selected_traits.findIndex(t=>t.value === trait.value) > -1} onChange={(e) => handleChange(trait, e.target.checked)} />
              </div>
            )
          })}
        </form>
      </div>
      }
    </div>
  );
}

export default function FilterMenu(props: HoverMenuProps) {
  const { title, options, selected, setOptions } = props;

  const [isOpen, setIsOpen] = useState<boolean>();

  const handleChange = (e: any): void => {
    if (e.target.checked) {
      if (selected.includes(e.target.value)) setOptions(selected);
      else setOptions([...selected, e.target.value]);
    } else {
      setOptions(selected.filter(entry => entry !== e.target.value));
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
      <div className={`${styles.menu} flex-column`}>
        <hr style={{margin: 0}} />
        <form>
          {options.map(option=>{
            return (
              <div key={option} className='d-flex justify-content-between'>
                <div className='d-flex align-items-center'>
                  {option}
                </div>
                <input type="checkbox" checked={selected.includes(option)} onChange={handleChange} />
              </div>
            )
          })}
        </form>
      </div>
      }
    </div>
  );
}
