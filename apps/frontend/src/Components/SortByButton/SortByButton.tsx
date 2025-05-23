import React, { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem, MenuPopover, MenuItems } from "@reach/menu-button";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import { positionMatchWidth } from "@reach/popover";
import styles from './SortByButton.module.scss';
import { SortOption } from "@architech/types";

interface SortByProps {
  selectedOption: SortOption | undefined,
  setSelected: (option: SortOption)=>void;
  sortOptions: 'COLLECTION' | 'TOKEN'
}

export const collectionSortOptions: SortOption[] = ["Name", "Recently Created", "Most Viewed"];
export const tokenSortOptions: SortOption[] = ["Token ID", ...collectionSortOptions, "Lowest Price", "Highest Price"];

export default function SortByButton(props: SortByProps) {
  let { selectedOption, setSelected } = props;

  let [isOverButton, setIsOverButton] = useState(false);
  let [isOverList, setIsOverList] = useState(false);
  let [isOpen, setIsOpen] = useState<boolean>();
  let [isTouchInput, setIsTouchInput] = useState<boolean>();
  let [hasClicked, setHasClicked] = useState<boolean>();
  let button: RefObject<HTMLButtonElement> = useRef(null);

  const sortOptions = props.sortOptions === 'TOKEN' ? tokenSortOptions : collectionSortOptions;

  // useLayoutEffect(() => {
  //   if (!button.current) return;
  //   if (isOpen && !isOverButton && !isOverList && !isTouchInput) {
  //     button.current.click();
  //     setIsOpen(false);
  //   } else if (!isOpen && (isOverButton || isOverList) && !isTouchInput) {
  //     button.current.click();
  //     setIsOpen(true);
  //   }
  // }, [isOverButton, isOverList]);

  useEffect(() => {
    setIsTouchInput(false);
    setHasClicked(false);
  }, [hasClicked]);

  return (
    <Menu>
      <MenuButton
        ref={button}
        onTouchStart={() => {
          setIsTouchInput(true);
        }}
        onMouseEnter={event => {
          setIsOverButton(true);
        }}
        onMouseLeave={event => {
          setIsOverButton(false);
        }}
        onClick={() => {
          setHasClicked(true);
          setIsOpen(!isOpen);
        }}
        onKeyDown={() => {
          setIsOpen(!isOpen);
        }}
        style={{background: '#FFFFFF00', color: '#000', fontSize: '16px'}}
      >
        <span className='mr8'>Sort By{selectedOption ? `: ${selectedOption}` : ''}</span><span aria-hidden>▾</span>
        {/* <span aria-hidden>▾</span> */}
      </MenuButton>
      <MenuPopover position={positionMatchWidth}
                style={{
                  // transition: "all .2s ease",
                  // opacity: (!isOpen) ? "0" : "1",
                }}>
        <MenuItems
          className={`d-flex flex-column card gap16 mt8 mb8 ${styles.menu} ${styles.box}`}
          style={{
            width: 'calc(100%-32px)',
            padding: '8px',
            // transition: "all .5s",
            // opacity: (!isOpen) ? "0" : "1",
          }}
          onMouseEnter={event => {
            setIsOverList(true);
          }}
          onMouseLeave={event => {
            setIsOverList(false);
          }}
        >
          { sortOptions.map(so=>{
            return (
              <MenuItem
              key={so}
              onSelect={() => {
                setIsOpen(false);
              }}
            >
              <button type='button' onClick={()=>setSelected(so)}>
                {so}
              </button>
            </MenuItem>
            )
          })}
          {/* <MenuItem
            onSelect={() => {
              setIsOpen(false);
            }}
          >
              <Link to={`/profile/${wallet?.address}`}>My Profile</Link>
          </MenuItem> */}
        </MenuItems>
      </MenuPopover>
    </Menu>
  );
}
