import { ADMINS, CATEGORIES, parseError } from "@architech/lib";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import MultiSelect from "../../../Components/MultiSelect";
//@ts-expect-error
import { Switch } from 'react-switch-input';

import styles from '../create.module.scss'
import { Collection } from "@architech/types";
import { editCollection } from "../../../Utils/backend";
import { useUser } from "../../../Contexts/UserContext";
import SmallLoader from "../../../Components/SmallLoader";

const AdminEditPage: FC<{
  collection: Collection
}> = ({collection}): ReactElement => {
  const {user} = useUser();
  const [admin_hidden, setAdminHidden] = useState(collection.admin_hidden || false);
  const [featured, setFeatured] = useState(collection.featured || false);
  const [verified, setVerified] = useState(collection.verified || false);
  const [dark_banner, setDarkBanner] = useState(collection.collectionProfile.dark_banner || false);
  const [minting_disabled, setMintingDisabled] = useState(collection.collectionMinter?.minting_disabled || false);
  const [saving, setSaving] = useState(false);



  const handleSave = async (e?: any) => {
    if (e) e.preventDefault();
    setSaving(true)
    try {
      const result = await editCollection(collection._id.toString(), { admin_hidden, featured, verified, dark_banner })
      console.log('Admin Edit Result', result)
      toast.success('Saved Admin Settings')
    } catch(err: any) {
      toast.error(parseError(err))
      console.error(err)
    }
    setSaving(false)
  }

  if (!user || !ADMINS.includes(user.address))
    return (
      <div style={{margin: '48px'}} className='d-flex flex-column'>
        <h1>Unauthorized</h1>
      </div>
    )

  return (
      <div style={{margin: '48px'}} className='d-flex flex-column'>
          <div className='d-flex' style={{justifyContent: 'space-between'}}>
              <h2 className='mb32'>Admin<br />Edits</h2>
          </div>
          
          <form className={styles.form} onSubmit={handleSave}>
              <div className='d-flex mb24'>
                  <Col>
                      <label>
                          Verified Collection
                          <div className='lightText12' style={{minHeight: '1em'}} />
                          <input type='checkbox' checked={verified} onChange={(e)=>setVerified(e.target.checked)} />
                      </label>
                  </Col>
                  <Col>
                      <label>
                          Featured Collection
                          <div className='lightText12' style={{minHeight: '1em'}} />
                          <input type='checkbox' checked={featured} onChange={(e)=>setFeatured(e.target.checked)} />
                      </label>
                  </Col>
                  <Col>
                      <label>
                          Admin Hidden
                          <div className='lightText12'>Hide this collection from the public.</div>
                          <input type='checkbox' checked={admin_hidden} onChange={(e)=>setAdminHidden(e.target.checked)} />
                      </label>
                  </Col>
              </div>
              <div className='d-flex mb24'>
                  <Col>
                      <label>
                          Dark Banner
                          <div className='lightText12' style={{minHeight: '1em'}}>Invert colors of text over banner.</div>
                          <input type='checkbox' checked={dark_banner} onChange={(e)=>setDarkBanner(e.target.checked)} />
                      </label>
                  </Col>
                  { !!collection.collectionMinter &&
                    <Col>
                        <label>
                            Disable Minting
                            <div className='lightText12' style={{minHeight: '1em'}} />
                            <input type='checkbox' checked={minting_disabled} onChange={(e)=>setMintingDisabled(e.target.checked)} />
                        </label>
                    </Col>
                  }
              </div>
              <div className='d-flex'>
                <button type='submit' disabled={saving}>Save Changes {saving && <SmallLoader />}</button>
              </div>
          </form>
      </div>
  )
}

export default AdminEditPage;