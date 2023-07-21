import { FC, ReactElement } from "react";
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
    