import React, { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem, MenuPopover, MenuItems } from "@reach/menu-button";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import { positionMatchWidth } from "@reach/popover";
import styles from './hoverMenu.module.scss';
import SmallLoader from "../SmallLoader";
import { toast } from "react-toastify";
import { ADMINS, claimRewards } from "@architech/lib";
import ArchDenom from "../ArchDenom";

//@ts-expect-error
import { Switch } from 'react-switch-input';
import ArchRewardsClaim from "../ArchRewardsClaim/ArchRewardsClaim";

interface HoverMenuProps {
    content: any;
}

export default function ProfileMenu(props: HoverMenuProps) {
  let { content } = props;
  const {user, balances, devMode, toggleDevMode, refreshBalances} = useUser()

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
        style={{
          fontSize: '16px',
          lineHeight: '150%',
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
          <ArchRewardsClaim />

          <MenuItem
            onSelect={() => {
              setIsOpen(false);
            }}
          >
              <Link to={`/profile/${user?.address}`}>My Profile</Link>
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
          {(!!user && ADMINS.includes(user.address)) &&
          <>
            <MenuItem
              onSelect={() => {
                setIsOpen(false);
              }}
            >
                <Link to={`admindash`}>Admin Dashboard</Link>
            </MenuItem>
            <div className='d-flex'>
              <span>Developer Mode</span>
              <Switch
                checked={devMode}
                onChange={(e: any) => toggleDevMode()}
              />
            </div>
          </>
          }
        </MenuItems>
      </MenuPopover>
    </Menu>
  );
}
