import { faDiscord, faGithub, faTwitter, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faGlobe, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, ReactElement } from "react";
import { Tooltip } from "react-tooltip";

interface Props {
    website: string | undefined;
    twitter: string | undefined;
    discord: string | undefined;
    telegram: string | undefined;
    github?: string;
    color?: string;
}


const SocialLinks: FC<Props> = (props: Props): ReactElement => {
  let {
    website,
    twitter,
    discord,
    telegram,
    github,
    color,
  } = props;

  if (website && !website.startsWith('http')) website = `https://${website}`
  if (twitter && !twitter.includes('twitter.com') && !twitter.includes('x.com')) twitter = `https://twitter.com/${twitter.replace('@','')}`

  return (
    <div className='d-flex align-items-center align-content-center' style={{gap: '24px', height: '24px'}}> 
      {
      !!twitter && 
        <div>
          <a target='_blank' rel='noreferrer' /*href={`https://x.com/${twitter.replace('@','')}`}*/ href={twitter}>
            {/* @ts-expect-error */}
            <FontAwesomeIcon icon={faXTwitter} size='2x' color={color}
              data-tooltip-id="socials-tooltip"
              data-tooltip-content="Twitter"
              data-tooltip-place="top"
            />
          </a>
        </div>
      }

      {
      !!discord && 
        <div>
          <a target='_blank' rel='noreferrer' href={discord}>
            {/* @ts-expect-error */}
            <FontAwesomeIcon icon={faDiscord} size='2x' color={color}
              data-tooltip-id="socials-tooltip"
              data-tooltip-content="Discord"
              data-tooltip-place="top"
            />
          </a>
        </div>
      }

      {
      !!telegram && 
        <div>
          <a target='_blank' rel='noreferrer' href={telegram}>
            <FontAwesomeIcon icon={faPaperPlane} size='2x' color={color}
              data-tooltip-id="socials-tooltip"
              data-tooltip-content="Telegram"
              data-tooltip-place="top"
            />
          </a>
        </div>
      }

      {
      !!github && 
        <div>
          <a target='_blank' rel='noreferrer' href={github}>
            {/* @ts-expect-error */}
            <FontAwesomeIcon icon={faGithub} size='2x' color={color}
              data-tooltip-id="socials-tooltip"
              data-tooltip-content="GitHub"
              data-tooltip-place="top"
            />
          </a>
        </div>
      }
      {
      !!website && 
        <div>
          <a target='_blank' rel='noreferrer' href={website}>
            <FontAwesomeIcon icon={faGlobe} size='2x' color={color}
              data-tooltip-id="socials-tooltip"
              data-tooltip-content="Website"
              data-tooltip-place="top"
            />
          </a>
        </div>
      }
      <Tooltip id="socials-tooltip" />
    </div>
  )
}

export default SocialLinks;