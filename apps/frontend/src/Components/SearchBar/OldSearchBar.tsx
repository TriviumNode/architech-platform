import React, { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem, MenuPopover, MenuItems } from "@reach/menu-button";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import { positionMatchWidth } from "@reach/popover";
import styles from './searchBar.module.scss';
import SmallLoader from "../SmallLoader";
import { toast } from "react-toastify";
import { claimRewards } from "@architech/lib";
import { NonceRequestDto } from "@architech/types";

export default function SearchBar() {
  let [isOverButton, setIsOverButton] = useState(false);
  let [isOverList, setIsOverList] = useState(false);
  let [isOpen, setIsOpen] = useState<boolean>();
  let [isTouchInput, setIsTouchInput] = useState<boolean>();
  let [hasClicked, setHasClicked] = useState<boolean>();
  let button: RefObject<HTMLButtonElement> = useRef(null);

  const [loading, setLoading] = useState(false);

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

  const handleSearch = async (e: any) => {
    e.preventDefault();
    console.log('aaa')
    setLoading(true);
    setIsOpen(true);
  }

  // useEffect(() => {
  //   setIsTouchInput(false);
  //   setHasClicked(false);
  // }, [hasClicked]);

  return (
    <Menu>
      <MenuButton
        // ref={button}
        // onTouchStart={() => {
        //   setIsTouchInput(true);
        // }}
        // onMouseEnter={event => {
        //   setIsOverButton(true);
        // }}
        // onMouseLeave={event => {
        //   setIsOverButton(false);
        // }}
        // onClick={() => {
        //   setHasClicked(true);
        //   setIsOpen(!isOpen);
        // }}
        // onKeyDown={() => {
        //   setIsOpen(!isOpen);
        // }}
        style={{
          background: '#00000000',
          border: 'none',
          padding: 0,
        }}
      >
          <form id="search-form" role="search" onSubmit={handleSearch}>
            <input
              id="q"
              aria-label="Search"
              placeholder="🔍 Search"
              type="search"
              name="q"
              disabled={loading}
            />
            <div
              id="search-spinner"
              aria-hidden
              hidden={true}
            />
            <div
              className="sr-only"
              aria-live="polite"
            />
          </form>
      </MenuButton>
      <MenuPopover position={positionMatchWidth}
                style={{
                  // transition: "all .2s ease",
                  // opacity: (!isOpen) ? "0" : "1",
                }}>
        <MenuItems
          className={`d-flex flex-column card gap16 mt8 ${styles.menu} ${styles.box}`}
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
          <MenuItem
            onSelect={() => {
              setIsOpen(false);
            }}
          >
              <Link to={`/nfts`}>Example Collection</Link>
          </MenuItem>
        </MenuItems>
      </MenuPopover>
    </Menu>
  );
}
