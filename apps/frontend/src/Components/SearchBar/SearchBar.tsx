import { CSSProperties, FC, ReactElement, useState } from "react";
import { Link } from "react-router-dom";

import styles from './searchBar.module.scss';
import { toast } from "react-toastify";
import { Popover } from 'react-tiny-popover'
import Loader from "../Loader";
import { getApiUrl, search } from "../../Utils/backend";
import { Collection } from "@architech/types";
import { getCollectionName } from "../../Utils/helpers";
import { Col } from "react-bootstrap";
import PlaceholdImg from "../PlaceholdImg";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";

const CollectionResult: FC<{collection: Collection, onClick: ()=>any}> = ({ collection, onClick }: {collection: Collection, onClick: ()=>any}): ReactElement => {
  const collectionName = getCollectionName(collection)

    const imgUrl = collection.collectionProfile.profile_image ? getApiUrl(`/public/${collection.collectionProfile.profile_image}`) : undefined;
    return(
    <Link to={`/nfts/${collection.address}`}
        style={{
            display: 'flex',
        }}
        className={styles.item}
        onClick={()=>onClick()}
    >
        <Col xs={8}>
            <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
                <PlaceholdImg
                    alt=''
                    src={imgUrl}
                    style={{
                        height: '48px',
                        width: '48px',
                        borderRadius: '16px',
                        marginRight: '16px',
                    }}
                    className='coverImg'
                />
                <div style={{overflow: "hidden"}}  className='d-flex flex-column justify-content-center'>
                    <div className='oneLineLimit'>{collectionName}</div>
                    <div className='lightText11 twoLineLimit'>{collection.collectionProfile.description}</div>
                </div>
            </div>
        </Col>
        <Col style={{color: '#999999', textAlign: 'right'}} className=''>
          <FontAwesomeIcon
            size='2x'
            icon={faImages}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Collection"
            data-tooltip-place="left"
          />
          <Tooltip id="my-tooltip" />
        </Col>
    </Link>
    )
}


const SearchResults: FC<{results: any[], loading: boolean, onClick: ()=>any}> = ({results, loading, onClick}) => {
  return (
    <div className={`${styles.menu}`}>
      { loading ? 
      <div className='d-flex wide tall justify-content-center align-items-center' style={{flexGrow: 1}}>
        <Loader />
       </div> 
      : !results.length ? 
      <div className='d-flex wide tall justify-content-center align-items-center' style={{flexGrow: 1}}>
        <h2>No Results</h2>
      </div> 

      :  <>
          {results.map((result, key)=>{
            return (
              <>
                {/* <div className={styles.item}>
                  <div>
                    Result {key}
                  </div>
                </div>
                { key < results.length - 1 && <hr />} */}
                <CollectionResult collection={result} onClick={onClick} />
              </>
            )
          })}
        </>
      }

    </div>
  )
}


export default function SearchBar({style}:{style?: CSSProperties}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Collection[]>([]);

  const handleClick = () => {
    setIsOpen(false);
  }

  const handleSearch = async (e: any) => {
    e.preventDefault();
    console.log('SEACHING')
    try {
      setSearching(true);
      setIsOpen(true);
      const searchResults = await search(query);
      setResults(searchResults);
      console.log('RESULTS', searchResults)
    } catch(err: any) {
        console.error('Error searching:', err);
        toast.error(err.toString());
    } finally {
      setSearching(false);
    }
  }

  console.log('isOpen', isOpen)

  return (
    <div className={`${styles.menuContainer}`} style={style}>
      <Popover
        isOpen={isOpen}
        positions={['bottom', 'left', 'right', 'top']} // preferred positions by priority
        content={<SearchResults results={results} loading={searching} onClick={()=>handleClick()} />}
        onClickOutside={()=>setIsOpen(false)}
        
      >
        <form id="search-form" role="search" onSubmit={handleSearch} style={{position: 'relative'}}>
            <input
              id="q"
              aria-label="Search"
              placeholder="🔍 Search"
              type="search"
              name="q"
              disabled={searching}
              className={isOpen ? styles.inputOpen : undefined}
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />
            <div
              id="search-spinner"
              aria-hidden
              hidden={true}
            />
            <div
              className="sr-only"
              aria-live="polite"
            />
            <div className={styles.searchButton}>
              <button type='button' onClick={handleSearch}><FontAwesomeIcon size='xl' icon={faMagnifyingGlass} /></button>
            </div>
          </form>
        </Popover>
      {/* {isOpen && 

      } */}
    </div>
  );
}
