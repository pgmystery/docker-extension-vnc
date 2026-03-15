import { CachedImageData } from '../../icons/CachedImage'
import SvgIcon from '@mui/material/SvgIcon/SvgIcon'


interface Template {
  title: string
  categoryId: string
  image: string // docker image name
  defaultTag?: string
  description: string
  vncPort: number // internal container port exposed by the image
  credentials?: {
    username: string
    password: string
  }
  github?: string
  chips?: string[] // quick badges
  IconComponent: typeof SvgIcon
  // optional additional ports to expose [host:container]
  extraPorts?: Array<{ host: number; container: number; label?: string }>
  // optional env vars
  env?: Array<{ key: string; value: string }>
  skeleton?: CachedImageData
  isOfficial?: boolean
  hasAudioOutput?: boolean
  hasAudioInput?: boolean
  requireKvm?: boolean
  extraFlags?: string[]
}

interface TemplateData extends Template {
  id: string
}

type Templates = Map<string, Template>;

export type TemplateCategory = {
  id: string;
  label: string;
  IconComponent: typeof SvgIcon;
  templates: Templates;
};
