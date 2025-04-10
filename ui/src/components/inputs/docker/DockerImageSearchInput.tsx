import DockerCli from '../../../libs/docker/DockerCli'
import { SyntheticEvent, useMemo, useState } from 'react'
import { DockerImage } from '../../../hooks/docker/useDockerRepository'
import AutocompleteSearch from '../AutocompleteSearch'


interface DockerImageSearchInputProps {
  initSelectedImage: string | undefined
  setSelectedImage: (image: string | undefined) => void
}


export default function DockerImageSearchInput({setSelectedImage, initSelectedImage}: DockerImageSearchInputProps) {
  const dockerCli = useMemo(() => new DockerCli(), [])
  const [images, setImages] = useState<DockerImage[]>([])
  const [value, setValue] = useState<string>(initSelectedImage || '')
  const [isSearching, setIsSearching] = useState<boolean>(false)

  async function handleInputChange(_: SyntheticEvent, value: string) {
    setValue(value)

    if (value === '') {
      setSelectedImage(undefined)
      return setImages([])
    }

    setIsSearching(true)

    const imagesFromHubPromise = getImagesFromHub(value)
    const imagesLocallyPromise = getImagesLocally(value)

    const [imagesFromHub, imagesLocally] = await Promise.all([imagesFromHubPromise, imagesLocallyPromise])
    const foundImages = [
      ...imagesFromHub,
      ...imagesLocally,
    ]
    setImages(foundImages)

    setIsSearching(false)
    setSelectedImage(foundImages.some(image => image.image === value) ? value : undefined)
  }

  async function getImagesFromHub(value: string): Promise<DockerImage[]> {
    const searchResult = await dockerCli.search(value)

    return searchResult.map(image => ({where: 'HUB', image: image.Name}))
  }

  async function getImagesLocally(value: string): Promise<DockerImage[]> {
    const locallyImages = await dockerCli.listImages({
      filters: {
        reference: [`*${ value }*`],
      }
    })

    return locallyImages.reduce<DockerImage[]>((previousValue, currentValue) => {
      return [...new Set([
        ...previousValue,
        ...currentValue.RepoTags.flatMap<DockerImage>(image => {
          const imageName: DockerImage = {where: 'LOCAL', image: image.split(':')[0]}

          if (previousValue.find(image => image.image === imageName.image))
            return []

          return imageName
        }),
      ])]
    }, [])
  }

  return (
    <AutocompleteSearch
      fullWidth
      freeSolo
      groupBy={ option => option.where }
      getOptionLabel={ option => typeof option === "string" ? option : option.image }
      options={ images }
      loading={ isSearching }
      inputValue={ value }
      onInputChange={ handleInputChange }
      isSearching={ isSearching }
      label="Search for the Docker Image you want to use*"
      name="connection.data.image"
    />
  )
}
