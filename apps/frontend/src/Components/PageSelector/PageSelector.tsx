import { mintNft } from "@architech/lib";
import { FC, ReactElement, useState } from "react";
import { Row } from "react-bootstrap";
import { useUser } from "../../Contexts/UserContext";
import DetailPage, { DetailState, DefaultDetailState } from "../../Pages/CreateNft/NftDetailPage";
import ImagePage from "../../Pages/CreateNft/NftImagePage";
import ReviewNftPage from "../../Pages/CreateNft/ReviewPage";
import styles from './PageSelector.module.scss'

interface Props {
    pages: string[];
    current: string;
    setPage: (page: string)=>void;
}

const PageSelector: FC<Props> = ({pages, current, setPage}): ReactElement => {
    return (<>
            { pages.map((p: string)=>
                <button type='button' onClick={()=>{setPage(p)}} disabled={current === p} className={styles.pageButton} key={p}>
                    {p}
                </button>)
            }
            </>
    )
}

export default PageSelector;
    