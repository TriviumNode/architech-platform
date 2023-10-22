import { CSSProperties, useCallback, useEffect, useMemo, useRef } from "react";
import styles from "./Modal.module.scss";

interface ModalProps {
    open: boolean;
    locked?: boolean;
    onClose: () => any;
    children: any;
    style?: CSSProperties;
    innerStyle?: CSSProperties;
    title?: string;
    closeButton?: boolean;
    className?: string;
}

export default function Modal({ open, locked, onClose, children, style, innerStyle, title, closeButton, className }: ModalProps) {
  const modalRef = useRef(null);

  // work out which classes should be applied to the dialog element
  const dialogClasses = useMemo(() => {
    const _arr = [styles["modal"]];
    if (!open) _arr.push(styles["modal--closing"]);

    return _arr.join(" ");
  }, [open]);

  // Eventlistener: trigger onclose when cancel detected
  const onCancel = useCallback(
    (e: any) => {
      e.preventDefault();
      if (!locked) onClose();
    },
    [locked, onClose]
  );

  // Eventlistener: trigger onclose when click outside
  const onClick = useCallback(
    ({ target }: { target: any}) => {
      const { current: el } = modalRef;
      if (target === el && !locked) onClose();
    },
    [locked, onClose]
  );

  // Eventlistener: trigger close click on anim end
  const onAnimEnd = useCallback(() => {
    const { current: el } = modalRef;
    //@ts-expect-error
    if (!open) el.close();
  }, [open]);

  // when open changes run open/close command
  useEffect(() => {
    const { current: el } = modalRef;
    if (open) {
      //@ts-expect-error
      el.close();
      //@ts-expect-error
      el.showModal();
    }
  }, [open]);

  return (
    <dialog
      style={style}
      ref={modalRef}
      className={`${dialogClasses} ${className}`}
      onClose={onClose}
      onCancel={onCancel}
      onClick={onClick}
      onAnimationEnd={onAnimEnd}
    >
      <div className={styles["modal__container"]} style={innerStyle}>
        {!!title &&
        <div>
          {title}
          <hr />
        </div>
}
        {children}
      </div>
    </dialog>
  );
}
