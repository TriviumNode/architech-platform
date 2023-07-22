import { faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import Modal from "../../../Components/Modal";

import styles from './TasksModal.module.scss'

export type Task = {
    onClick: ()=>void;
    content: string;
}
        
const TasksModal: FC<{
    open: boolean;
    close: ()=>void;
    content?: any;
    tasks: Task[]
}> = ({open, close, content, tasks}): ReactElement => {
    return (        
        <Modal open={open} locked={true} onClose={()=>{}} style={{maxWidth: '350px'}} >
            <div style={{textAlign: 'center', padding: '16px'}}>
                {content}
            </div>
            <div className={`d-flex flex-column gap8 ${styles.buttonContainer}`}>
                { tasks.map((a,i)=>
                    <button
                        key={i}
                        onClick={()=>{a.onClick(); close();}}
                    >
                        <Col>{a.content}</Col>
                        <Col xs='auto' className='ml8'><FontAwesomeIcon icon={faCircleChevronRight} size='2x' /></Col>
                    </button>
                )}
            </div>
        </Modal>
    )
}

export default TasksModal;