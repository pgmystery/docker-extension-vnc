import { ContainerExtended } from '../types/docker/cli/inspect'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import DockerCli from '../libs/docker/DockerCli'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { getSessionStore } from '../stores/sessionStore'
import { type VNCHandler } from './useVNC'
import useImagePullDialog from './useImagePullDialog'
import { ConnectionDataDockerContainer } from '../libs/vnc/connectionTypes/VNCDockerContainer/VNCDockerContainerBase'
import { SessionCredentials } from '../types/session'
import { dockerContainerTemplates } from '../components/dashboard/templates/defaultTemplates'
import { Template } from '../components/dashboard/templates/template'
import useConfig from './useConfig'


export const VNCExampleContainerName = 'vnc_example_container'
const UbuntuVNCDockerContainerName_OLD = 'ubuntu_vnc'
export const VNCExampleSessionName = 'example vnc container'
const VNCExampleImageLabel = 'pgmystery.vnc.extension.example'

interface ExampleContainer {
  exampleContainer?: ContainerExtended
  checkExampleContainerExist: ()=>Promise<ContainerExtended | undefined>
  sessionName: string
  imageLabel: string
  runExampleContainer: (runData: ExampleContainerRunData)=>Promise<ContainerExtended | undefined>
  connectToExampleContainer: (sessionData: ExampleContainerSessionData)=>Promise<void>
  removeExampleSession: ()=>Promise<void>
  exampleContainerTemplate?: Template
}

interface ExampleContainerRunData {
  templateId: string
  image: string
  tag: string
  options: string
  args: string
  port: number
}

interface ExampleSessionCreateData {
  templateId?: string
  port?: ConnectionDataDockerContainer['port']
  credentials?: SessionCredentials
}

export interface ExampleContainerSessionData {
  port?: number
  credentials?: SessionCredentials
}


export default function useExampleContainer(vncHandler: VNCHandler | null): ExampleContainer {
  const [exampleContainer, setExampleContainer] = useState<ContainerExtended>()
  const ddClient = useMemo(createDockerDesktopClient, [])
  const sessionStore = useMemo(getSessionStore, [])
  const sessions = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot)
  const pullDockerImage = useImagePullDialog()
  const [exampleContainerTemplate, setExampleContainerTemplate] = useState<Template | undefined>()
  const [{ proxyContainerLabelAudioOutput, proxyContainerLabelAudioInput, audioOutputEnvVarName, audioInputEnvVarName }] = useConfig()

  useEffect(() => {
    checkExampleContainerExist()
  }, [])

  useEffect(() => {
    if (!exampleContainer)
      return setExampleContainerTemplate(undefined)

    getDefaultTemplate().then(defaultTemplate => setExampleContainerTemplate(defaultTemplate))
  }, [exampleContainer])

  function getExampleContainer() {
    const dockerCli = new DockerCli()

    return new Promise<ContainerExtended | undefined>((resolve) => {
      const promises = [
        dockerCli.getContainerFromInspect(VNCExampleContainerName, { throwError: false }),
        dockerCli.getContainerFromInspect(UbuntuVNCDockerContainerName_OLD, { throwError: false }),
      ];

      let pending = promises.length;

      for (const p of promises) {
        p.then(value => {
          if (!value) {
            pending--;

            if (pending > 0)
              return
          }

          resolve(value);
        });
      }
    });
  }

  async function checkExampleContainerExist() {
    const exampleContainer = await getExampleContainer()
    setExampleContainer(exampleContainer)

    return exampleContainer
  }

    async function createExampleSession(createData: ExampleSessionCreateData) {
    if (!createData.templateId) {
      // TODO: Try to clean up
      throw new Error('templateId is required')
    }

    await removeExampleSession()

    const templateData = dockerContainerTemplates.get(createData.templateId)

    if (!templateData)
      throw new Error(`Template "${createData.templateId}" not found`)

    return sessionStore.add({
      name: VNCExampleSessionName,
      connection: {
        type: 'container',
        data: {
          container: VNCExampleContainerName,
          port: createData.port || templateData.vncPort,
        },
      },
      credentials: {
        username: createData.credentials?.username || '',
        password: createData.credentials?.password || '',
      },
    })
  }

  async function runExampleContainer(runData: ExampleContainerRunData) {
    const fullImageName = runData.image + ':' + runData.tag
    const dockerCli = new DockerCli()

    if (!await dockerCli.imageExist(fullImageName))
      await pullDockerImage(fullImageName)

    const extraConfig: string[] = []
    const imageLabels = await dockerCli.image.getImageLabels(fullImageName)

    if (imageLabels?.[proxyContainerLabelAudioOutput] === 'true') {
      extraConfig.push('-e', `${audioOutputEnvVarName}="true"`)
    }

    if (imageLabels?.[proxyContainerLabelAudioInput] === 'true') {
      extraConfig.push('-e', `${audioInputEnvVarName}="true"`)
    }

    const runCommands = [
      runData.options,
      ...extraConfig,
      '--detach',
      '--name', VNCExampleContainerName,
      '--label', `${VNCExampleImageLabel}="${runData.templateId}"`,
      '--label', 'com.docker.compose.project=""',
      '--label', 'com.docker.desktop.extension="false"',
      fullImageName,
      runData.args,
    ]

    const execResult = await dockerCli.execCli('run', runCommands)

    if (execResult.stderr) {
      ddClient.desktopUI.toast.error(execResult.stderr)

      return
    }

    return checkExampleContainerExist()
  }

  async function connectToExampleContainer(sessionData: ExampleContainerSessionData = {}) {
    if (!vncHandler)
      throw new Error('vncHandler is not initialized')

    let exampleContainer = await checkExampleContainerExist()

    if (!exampleContainer) {
      // TODO: Try to create the example container from the session
      ddClient.desktopUI.toast.error('Can\'t find the example docker container...')

      throw new Error('exampleContainer is not initialized')
    }

    setExampleContainer(exampleContainer)

    // If the container is not running, start it.
    if (exampleContainer.State.Status !== 'running') {
      const dockerCli = new DockerCli()
      const execResult = await dockerCli.start(exampleContainer.Id)

      if (execResult.stderr)
        throw new Error(execResult.stderr)

      exampleContainer = await checkExampleContainerExist()

      if (!exampleContainer)
        throw new Error('exampleContainer is not initialized')

      if (exampleContainer.State.Status !== 'running')
        throw new Error(`exampleContainer "${exampleContainer.Id}" can't be started. Please check the logs for more details.`)
    }

    const exampleSessionItem = sessions.find(session => session.name === VNCExampleSessionName)
    let exampleSession = await exampleSessionItem?.getInfo()

    if (!exampleSession) {
      exampleSession = await createExampleSession({
        templateId: exampleContainer.Config.Labels[VNCExampleImageLabel],
        port: sessionData?.port,
        credentials: sessionData?.credentials,
      })
    }

    await vncHandler.connect(exampleSession)
  }

  async function removeExampleSession() {
    const exampleSessionItem = sessions.find(session => session.name === VNCExampleSessionName)

    if (exampleSessionItem)
      await sessionStore.delete(exampleSessionItem.id)
  }

  async function getDefaultTemplate() {
    const exampleContainer = await getExampleContainer()
    if (!exampleContainer)
      return

    const templateId = exampleContainer.Config.Labels[VNCExampleImageLabel]
    return dockerContainerTemplates.get(templateId)
  }

  return {
    exampleContainer,
    checkExampleContainerExist,
    sessionName: VNCExampleSessionName,
    imageLabel: VNCExampleImageLabel,
    runExampleContainer,
    connectToExampleContainer,
    removeExampleSession,
    exampleContainerTemplate,
  }
}
