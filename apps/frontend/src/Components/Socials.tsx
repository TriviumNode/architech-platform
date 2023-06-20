import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap"

interface Props {
    website?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    github?: string;
}


const SocialLinks: FC<Props> = (props: Props): ReactElement => {

    const {
        website,
        twitter,
        discord,
        telegram,
        github,
    } = props;
    return (
        <div className='d-flex align-items-center align-content-center' style={{gap: '24px', height: '24px'}}> 
            {
            !!twitter && 
                <div>
                    <a target='_blank' rel='noreferrer' href={twitter}><img src="/twitter.svg" alt='Twitter' style={{height: '24px'}} /></a>
                </div>
            }

            {
            !!discord && 
                <div>
                <a target='_blank' rel='noreferrer' href={discord}><img src="/discord.svg" alt='Discord' style={{height: '24px'}} /></a>
                </div>
            }

            {
            !!telegram && 
                <div>
                <a target='_blank' rel='noreferrer' href={telegram}><img src="/telegram.svg" alt='Telegram' style={{height: '24px'}} /></a>
                </div>
            }

            {
            !!github && 
                <div>
                <a target='_blank' rel='noreferrer' href={github}><img src="/github.svg" alt='Github' style={{height: '24px'}} /></a>
                </div>
            }
            {
            !!website && 
                <div>
                    <a target='_blank' rel='noreferrer' href={website}><img src="/website.svg" alt='Website' style={{height: '24px'}} /></a>
                </div>
            }
        </div>
    )
}

export default SocialLinks;