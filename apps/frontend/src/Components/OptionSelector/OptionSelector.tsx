import { FC, ReactElement, ReactNode } from "react";
import { Col, Row } from "react-bootstrap";

interface Props {
    items: {
        content: string | ReactNode;
        value: string;
    }[],
    value: string;
    onChange: (value: string) => void;
}

const OptionSelector: FC<Props> = ({ items, value, onChange }): ReactElement => {

    return (
        
        <Row>
{
    items.map((item) => {
        return (
            <Col xs="auto"
                style={{border: value === item.value ? '1px solid blue' : '1px solid gray'}}
                onClick={()=>onChange(item.value)}    
            >{item.content}</Col>
        )
    })
}
        </Row>
    )
}

export default OptionSelector