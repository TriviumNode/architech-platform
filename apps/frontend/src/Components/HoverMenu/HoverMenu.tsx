import React, { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem, MenuPopover, MenuItems } from "@reach/menu-button";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import { positionMatchWidth } from "@reach/popover";
import styles from './hoverMenu.module.scss';

interface HoverMenuProps {
    content: any;
}

export default function ProfileMenu(props: HoverMenuProps) {
  let { content } = props;
  const {user: wallet, loadingConnectWallet} = useUser()

  let [isOverButton, setIsOverButton] = useState(false);
  let [isOverList, setIsOverList] = useState(false);
  let [isOpen, setIsOpen] = useState<boolean>();
  let [isTouchInput, setIsTouchInput] = useState<boolean>();
  let [hasClicked, setHasClicked] = useState<boolean>();
  let button: RefObject<HTMLButtonElement> = useRef(null);

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
      >
        {content}
        {/* <span aria-hidden>▾</span> */}
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
              <Link to={`/profile/${wallet?.address}`}>My Profile</Link>
          </MenuItem>
          <MenuItem
            onSelect={() => {
              setIsOpen(false);
            }}
          >
              <Link to={`/nfts/createcollection`}>Create Collection</Link>
          </MenuItem>
          <MenuItem
            onSelect={() => {
              setIsOpen(false);
            }}
          >
              <Link to={`/nfts/create`}>Create NFT</Link>
          </MenuItem>
          <MenuItem
            onSelect={() => {
              setIsOpen(false);
            }}
          >
              <Link to={`nfts/import`}>Import Collection</Link>
          </MenuItem>
        </MenuItems>
      </MenuPopover>
    </Menu>
  );
}
