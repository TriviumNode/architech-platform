import { useState, ChangeEvent, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import FileSelect from "../../Components/FileSelect";
import Modal from "../../Components/Modal";
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
        console.log('response', response)
        revalidator.revalidate();
        onClose();
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || err.response?.msg || err.toString())
        }
    }

    const updateFormState = (newFormState: Partial<UpdateProfileData>) => {
        console.log('updating', newFormState)
        setFormState({...formState, ...newFormState})
    }


    return(
        <Modal open={open} onClose={onClose}>
            <form onSubmit={handleEdit}>
            <Row>
                <Col xs={6}>
                
                    <Row>
                        <label>
                            Username:<br />
                            <input  value={formState.username} onChange={(e)=> updateFormState({username: e.target.value})} />
                        </label>
                    </Row>
                    <Row>
                        <label>
                            Bio:<br />
                            <textarea value={formState.bio} onChange={(e)=> updateFormState({bio: e.target.value})}  />
                        </label>
                    </Row>
                </Col>
                <Col xs={6}>
                    <Row>
                        <label>
                            Website:<br />
                            <input  value={formState.website} onChange={(e)=> updateFormState({website: e.target.value})} />
                        </label>
                    </Row>
                    <Row>
                        <label>
                            Twitter:<br />
                            <input value={formState.twitter} onChange={(e)=> updateFormState({twitter: e.target.value})}  />
                        </label>
                    </Row>
                    <Row>
                        <label>
                            Discord:<br />
                            <input value={formState.discord} onChange={(e)=> updateFormState({discord: e.target.value})}  />
                        </label>
                    </Row>
                    <Row>
                        <label>
                            Telegram:<br />
                            <input value={formState.telegram} onChange={(e)=> updateFormState({telegram: e.target.value})}  />
                        </label>
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col xs="12">
                    <label>
                        Profile Image:<br />
                        {/* <input
                            type="file"
                            onChange={(e)=> {
                                if (e.target.files) {
                                    console.log(e.target.files[0])
                                    updateFormState({profileImage: e.target.files[0]})
                                }
                            }}
                            accept="image/*"
                        /> */}
                        <FileSelect selected={formState.profileImage} onChange={(newFile)=>updateFormState({profileImage: newFile})} />
                    </label>
                </Col>
            </Row>
            <Row style={{marginTop: '20px'}}>
                <Col xs="auto">
                    <button type="submit">Edit</button>
                </Col>
            </Row>
            </form>
        </Modal>
    )
}