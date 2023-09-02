import { faDiscord, faGithub, faTelegram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faCircle, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap"

interface Props {
    website?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    github?: string;
    color?: string;
}


const SocialLinks: FC<Props> = (props: Props): ReactElement => {

    const {
        website,
        twitter,
        discord,
        telegram,
        github,
        color,
    } = props;
    console.log('COLOR', color)
    return (
        <div className='d-flex align-items-center align-content-center' style={{gap: '24px', height: '24px'}}> 
            {
            !!twitter && 
                <div>
                    <a target='_blank' rel='noreferrer' href={`https://twitter.com/${twitter.replace('@','')}`}>
                      {/* <img src="/twitter.svg" alt='Twitter' style={{height: '24px', color: '#000'}} /> */}

                      {/* @ts-expect-error */}
                      <FontAwesomeIcon icon={faTwitter} size='2x' color={color} />
                    </a>
                </div>
            }

            {
            !!discord && 
                <div>
                  <a target='_blank' rel='noreferrer' href={discord}>
                    {/* <img src="/discord.svg" alt='Discord' style={{height: '24px'}} /> */}

                    {/* @ts-expect-error */}
                    <FontAwesomeIcon icon={faDiscord} size='2x' color={color} />
                  </a>
                </div>
            }

            {
            !!telegram && 
                <div>
                  <a target='_blank' rel='noreferrer' href={telegram}>
                    {/* <img src="/telegram.svg" alt='Telegram' style={{height: '24px'}} /> */}

                    {/* @ts-expect-error */}
                    <FontAwesomeIcon icon={faTelegram} size='2x' color={color} />
                  </a>
                </div>
            }

            {
            !!github && 
                <div>
                  <a target='_blank' rel='noreferrer' href={github}>
                    {/* <img src="/github.svg" alt='Github' style={{height: '24px'}} /> */}

                    {/* @ts-expect-error */}
                    <FontAwesomeIcon icon={faGithub} size='2x' color={color} />
                  </a>
                </div>
            }
            {
            !!website && 
                <div>
                    <a target='_blank' rel='noreferrer' href={website}>
                      {/* <img src="/website.svg" alt='Website' style={{height: '24px'}} /> */}

                      <FontAwesomeIcon icon={faGlobe} size='2x' color={color} />
                    </a>
                </div>
            }
        </div>
    )
}

export default SocialLinks;