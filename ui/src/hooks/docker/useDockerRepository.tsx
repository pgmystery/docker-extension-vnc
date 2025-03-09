import { useMemo } from 'react'
import DockerHubApi from '../../libs/dockerHub/DockerHubApi'
import DockerCli from '../../libs/docker/DockerCli'
import Repository from '../../libs/dockerHub/dockerHubApi/Repository'


export interface DockerImage {
  where: 'hub' | 'local'
  image: string
}


export default function useDockerRepository(image?: string) {
  return useMemo(() => {
    if (!image)
      return

    return {
      getAllTags: async (name?: string) => {
        const dockerHubRepository = new DockerHubApi().repository(image)
        const dockerCli = new DockerCli()

        const [tagsFromDockerHub, tagsFromLocal] = await Promise.all([
          getImageTagsFromDockerHub(dockerHubRepository, name),
          getImageTagsFromLocal(dockerCli, image, name),
        ])

        return [...new Set([...tagsFromDockerHub, ...tagsFromLocal])]
      }
    }
  }, [image])
}

async function getImageTagsFromDockerHub(dockerHubRepository: Repository, name?: string): Promise<string[]> {
  try {
    const allTags = await dockerHubRepository.getAllTags({
      name: name === undefined ? '' : name,
    })

    return allTags.results.map(tag => tag.name)
  }
  catch (_) {
    return []
  }
}

async function getImageTagsFromLocal(dockerCli: DockerCli, image: string, name?: string): Promise<string[]> {
  const images = await dockerCli.listImages({
    filters: {
      reference: [image],
    }
  })

  return images.reduce<string[]>((previousValue, currentValue) => {
    return [
      ...previousValue,
      ...currentValue.RepoTags.flatMap(repoTag => {
        if (!repoTag.startsWith(image + ':'))
          return []

        const tag = repoTag.split(':').at(-1)
        if (tag === undefined)
          return []

        if (!name)
          return tag

        return tag.includes(name) ? tag : []
      }),
    ]
  }, [])
}
