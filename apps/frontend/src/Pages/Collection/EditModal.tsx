import { useState, ChangeEvent, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import FileSelect from "../../Components/FileSelect";
import Modal from "../../Components/Modal";
import { ImportCollectionData } from "../../Interfaces/interfaces";
import { editCollection, importCollection, updateCollectionImage } from "../../Utils/backend";

interface Props {
    open: boolean;
    onClose: () => any;
    collectionId: string;
}

const defaultFormState: Partial<ImportCollectionData> = {
    name: '',
    description: '',
    hidden: true,
    profileImage: undefined,
    bannerImage: undefined,
}

export default function EditModal({open, collectionId, onClose}: Props) {
    const revalidator = useRevalidator();

    const [formState, setFormState] = useState<Partial<ImportCollectionData>>(defaultFormState);

    const handleEdit = async(e: any) => {
        e.preventDefault();
        try {
        const response = await editCollection(collectionId, formState);
        console.log('response', response)
        revalidator.revalidate();
        onClose();
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || err.response?.msg || err.toString())
        }
    }

    const updateFormState = (newFormState: Partial<ImportCollectionData>) => {
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
                            Collection Name:<br />
                            <input  value={formState.name} onChange={(e)=> updateFormState({name: e.target.value})} />
                        </label>
                    </Row>
                    <Row>
                        <label>
                            Description:<br />
                            <textarea value={formState.description} onChange={(e)=> updateFormState({description: e.target.value})}  />
                        </label>
                    </Row>
                    <Row>
                        <label>
                            Hidden:<br />
                            <input type="checkbox" checked={formState.hidden} onChange={(e)=> updateFormState({hidden: e.target.checked})}  />
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
                </Col>
            </Row>
            <Row>
                <Col xs="6">
                    <label>
                        Collection Image:<br />
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
                <Col xs="6">
                    <label>
                        Collection Banner:<br />
                        {/* <input
                            type="file"
                            onChange={(e)=> {
                                if (e.target.files) {
                                    console.log(e.target.files[0])
                                    updateFormState({bannerImage: e.target.files[0]})
                                }
                            }}
                            accept="image/*"
                        /> */}
                        <FileSelect selected={formState.bannerImage} onChange={(newFile)=>updateFormState({bannerImage: newFile})} />
                    </label>
                </Col>
            </Row>
            <div className='lightText12' style={{margin: '4px 8px 0 8px'}}>
                File types supported: JPG, PNG, SVG. Max size: 2 MB<br />
                Banner: 1080 x 350
            </div>
            <Row style={{marginTop: '20px'}}>
                <Col xs="auto">
                    <button type="submit">Edit</button>
                </Col>
            </Row>
            </form>
        </Modal>
    )
}