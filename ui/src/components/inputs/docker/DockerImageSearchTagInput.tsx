import { SyntheticEvent, useEffect, useState } from 'react'
import useDockerRepository from '../../../hooks/docker/useDockerRepository'
import AutocompleteSearch from '../AutocompleteSearch'


interface DockerImageSearchTagInputProps {
  repository?: string
  tag: string,
  setTag: (tag: string)=>void
  onTagIsValidChange?: (isValid: boolean)=>void
}


export default function DockerImageSearchTagInput({ repository, tag, setTag, onTagIsValidChange }: DockerImageSearchTagInputProps) {
  const [isValidTag, setIsValidTag] = useState<boolean>(false)
  const dockerRepository = useDockerRepository(repository)
  const [tags, setTags] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)

  useEffect(() => {
    if (!dockerRepository || tag === '')
      return

    setIsSearching(true)
    dockerRepository.getAllTags(tag)
                    .then(allTags => setIsValidTag(allTags.includes(tag)))
                    .finally(() => setIsSearching(false))
  }, [])

  useEffect(() => {
    if (!repository) {
      setTags([])
      setTag('')
      setIsValidTag(false)
    }
    else
      if (dockerRepository)
        dockerRepository.getAllTags().then(allTags => setTags(allTags))
  }, [repository])

  useEffect(() => {
    onTagIsValidChange?.(isValidTag)
  }, [isValidTag])

  async function handleInputChange(_: SyntheticEvent, value: string) {
    if (!dockerRepository)
      return

    setTag(value)
    setIsSearching(true)

    const allTags = await dockerRepository.getAllTags(value)
    setTags(allTags)

    setIsSearching(false)
    setIsValidTag(allTags.includes(value))
  }

  function getValidColor() {
    if (tag === '')
      return undefined
    else
      return isValidTag ? 'success' : 'error'
  }

  return (
    <AutocompleteSearch
      fullWidth
      freeSolo
      options={tags}
      loading={isSearching}
      onInputChange={handleInputChange}
      disabled={!repository}
      inputValue={tag}
      isSearching={ isSearching }
      label="Select a Image-Tag*"
      name="connection.data.imageTag"
      color={ getValidColor() }
    />
  )
}
