import { SyntheticEvent, useEffect, useState } from 'react'
import useDockerRepository from '../../../hooks/docker/useDockerRepository'
import AutocompleteSearch from '../AutocompleteSearch'
import { BaseTextFieldProps } from '@mui/material/TextField/TextField'


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
  const [tagColor, setTagColor] = useState<BaseTextFieldProps['color']>()

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
    if (tag === '')
      setTagColor(undefined)
    else
      setTagColor(isValidTag ? 'success' : 'error')

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
      color={ tagColor }
      sx={theme => ({
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: tagColor && theme.palette[tagColor].main,
          },
        },
      })}
    />
  )
}
