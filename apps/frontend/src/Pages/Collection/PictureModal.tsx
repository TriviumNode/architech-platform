import { useState, ChangeEvent, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../Components/Modal";
import { updateCollectionImage } from "../../Utils/backend";

interface BannerModalProps {
    open: boolean;
    onClose: () => any;
    collectionId: string;
}

export default function PictureModal({open, collectionId, onClose}: BannerModalProps) {
    const revalidator = useRevalidator();
    const [image, setImage] = useState<File>() 

    const saveImage = async(e: any) => {
        e.preventDefault();
        if (!image) {
            return;
        }
        try {
            const result = await updateCollectionImage(collectionId, image)
            revalidator.revalidate();
            setImage(undefined)
            onClose()
        } catch(err: any){
            toast.error(err.message);
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImage(e.target.files[0]);
        }
    };

    return(
        <Modal open={open} onClose={onClose}>
            <Row>
            <Col xs={12} md={6}>
                <form onSubmit={saveImage}>
                    <Row>
                        <Col xs="auto">
                            <span>Image:</span>
                        </Col>
                        <Col xs="auto">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </Col>
                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        <Col xs="auto">
                            <button type="submit" disabled={!image}>Save Image</button>
                        </Col>
                    </Row>
                </form>
                </Col>
            </Row>
        </Modal>
    )
}