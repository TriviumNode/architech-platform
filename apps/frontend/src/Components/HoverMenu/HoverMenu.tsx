import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuPopover, MenuItems } from "@reach/menu-button";
import { Link } from "react-router-dom";
import { positionMatchWidth } from "@reach/popover";
import styles from './hoverMenu.module.scss';

interface HoverMenuProps {
  children: any;
  links: HoverMenuLink[]
}

export type HoverMenuLink = {
  text: string;
  link: string;
}

export default function HoverMenu({ children, links }: HoverMenuProps) {
  let [isOverButton, setIsOverButton] = useState(false);
  let [isOverList, setIsOverList] = useState(false);
  let [isOpen, setIsOpen] = useState<boolean>();
  let [isTouchInput, setIsTouchInput] = useState<boolean>();
  let [hasClicked, setHasClicked] = useState<boolean>();
  let button: RefObject<HTMLButtonElement> = useRef(null);

  const isOver = useRef(isOverButton || isOverList);

  isOver.current = isOverButton || isOverList

  useLayoutEffect(() => {
    if (!button.current) return;
    if (isOpen && !isOverButton && !isOverList && !isTouchInput) {
      // Close Menu

      // button.current.dispatchEvent(new Event("mousedown", { bubbles: true }));
      setTimeout(() => {
        if (!button.current) return;
        if (isOver.current) return;
        button.current.dispatchEvent(new Event("mousedown", { bubbles: true }));
      }, 500);
      setIsOpen(false);
    } else if (!isOpen && (isOverButton || isOverList) && !isTouchInput) {
      // Open Menu
      button.current.dispatchEvent(new Event("mousedown", { bubbles: true }));
      setIsOpen(true);
    }
  }, [isOpen, isOverButton, isOverList, isTouchInput]);

  useEffect(() => {
    setIsTouchInput(false);
    setHasClicked(false);
  }, [hasClicked]);
  console.log('IsOverList', isOverList)

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
        // onClick={() => {
        //   console.log('CLICK!')
        //   setHasClicked(true);
        //   setIsOpen(!isOpen);
        // }}
        onKeyDown={() => {
          setIsOpen(!isOpen);
        }}
        style={{
          fontSize: '16px',
          lineHeight: '150%',
        }}
      >
        {children}
        {/* <span aria-hidden>▾</span> */}
      </MenuButton>
      <MenuPopover position={positionMatchWidth} >
        <MenuItems
          className={`d-flex flex-column card gap16 mt8 ${styles.menu} ${styles.box}`}
          style={{
            width: 'calc(100%-32px)',
            padding: '8px',
          }}
          // onMouseEnter={event => {
          //   setIsOverList(true);
          // }}
          // onMouseLeave={event => {
          //   setIsOverList(false);
          // }}
        >
          {links.map((l, i)=>
            <MenuItem
              onSelect={() => {
                setIsOpen(false);
              }}
              key={i}
            >
                <Link to={l.link}>{l.text}</Link>
            </MenuItem>
          )}
          {/* <MenuItem
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
          </MenuItem> */}
        </MenuItems>
      </MenuPopover>
    </Menu>
  );
}
