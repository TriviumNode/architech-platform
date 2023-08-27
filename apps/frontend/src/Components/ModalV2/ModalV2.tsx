import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSProperties, useCallback, useEffect, useMemo, useRef } from "react";
import styles from "./Modal.module.scss";

interface ModalProps {
    open: boolean;
    locked?: boolean;
    onClose: () => any;
    children: any;
    style?: CSSProperties;
    title?: any;
    closeButton?: boolean;
}

export default function ModalV2({ open, locked = false, onClose, children, style, title, closeButton = !locked }: ModalProps) {
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
      className={dialogClasses}
      onClose={onClose}
      onCancel={onCancel}
      onClick={onClick}
      onAnimationEnd={onAnimEnd}
    >
      <div className={styles["modal__container"]}>
        {!!title &&
          <div>
            <div className='d-flex justify-content-between align-items-center pr8'>
              {title}
              {closeButton && <FontAwesomeIcon icon={faXmark} size='lg' color='#222' onClick={()=>onClose()}  style={{cursor: 'pointer'}} /> }
            </div>
            <hr />
          </div>
        }
        {children}
      </div>
    </dialog>
  );
}
