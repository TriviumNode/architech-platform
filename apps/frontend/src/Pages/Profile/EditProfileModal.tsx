import { useState, ChangeEvent, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import FileSelect from "../../Components/FileSelect";
import Modal from "../../Components/Modal";
import ModalV2 from "../../Components/ModalV2";
import { UpdateProfileData } from "../../Interfaces/interfaces";
import { editCollection, editProfile } from "../../Utils/backend";

interface Props {
    open: boolean;
    onClose: () => any;
    userId: string;
}

const defaultFormState: Partial<UpdateProfileData> = {
    username: '',
    bio: '',
    profileImage: undefined,
    discord: '',
    telegram: '',
    twitter: '',
    website: '',
}

export default function EditProfileModal({open, userId, onClose}: Props) {
    const revalidator = useRevalidator();

    const [formState, setFormState] = useState<Partial<UpdateProfileData>>(defaultFormState);

    const handleEdit = async(e: any) => {
        e.preventDefault();
        try {
        const response = await editProfile(userId, formState);
        revalidator.revalidate();
        onClose();
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || err.response?.msg || err.toString())
        }
    }

    const updateFormState = (newFormState: Partial<UpdateProfileData>) => {
        setFormState({...formState, ...newFormState})
    }


    return(
        <ModalV2 open={open} onClose={onClose} title='Edit Profile' closeButton={true}>
            <form onSubmit={handleEdit} className='mt16'>
            <Row className='rowGap8'>
                <Col xs={12} md={6} className='d-flex flex-column gap8'>
                    <Row>
                        <label>
                            Username:<br />
                            <input  value={formState.username} onChange={(e)=> updateFormState({username: e.target.value})} />
                        </label>
                    </Row>
                    <Row>
                      <label>
                        Profile Image:<br />
                        <FileSelect selected={formState.profileImage} onChange={(newFile)=>updateFormState({profileImage: newFile})} />
                      </label>
                    </Row>
                    <Row style={{flexGrow: 1}}>
                        <label className='d-flex flex-column'>
                            Bio:<br />
                            <textarea value={formState.bio} onChange={(e)=> updateFormState({bio: e.target.value})} style={{boxSizing: 'border-box', height: '100%'}} /*style={{width: 'calc(100% - 32px)'}}*/  />
                        </label>
                    </Row>
                </Col>
                <Col xs={12} md={6}>
                    <Row className='mb8 rowGap8'>
                      <Col xs={6} md={12}>
                        <label>
                          Website:<br />
                          <input  value={formState.website} onChange={(e)=> updateFormState({website: e.target.value})} />
                        </label>
                      </Col>
                      <Col xs={true} md={12}>
                        <label>
                          Twitter:<br />
                          <input value={formState.twitter} onChange={(e)=> updateFormState({twitter: e.target.value})}  />
                        </label>
                      </Col>
                    </Row>

                    <Row className='rowGap8'>
                      <Col xs={6} md={12}>
                        <label>
                          Discord:<br />
                          <input value={formState.discord} onChange={(e)=> updateFormState({discord: e.target.value})}  />
                        </label>
                      </Col>
                      <Col xs={true} md={12}>
                        <label>
                          Telegram:<br />
                          <input value={formState.telegram} onChange={(e)=> updateFormState({telegram: e.target.value})}  />
                        </label>
                      </Col>
                    </Row>
                </Col>
            </Row>
            <Row style={{marginTop: '20px'}}>
                <Col xs="auto">
                    <button type="submit">Edit</button>
                </Col>
            </Row>
            </form>
        </ModalV2>
    )
}