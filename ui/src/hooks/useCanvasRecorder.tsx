import { useMemo, useRef, useState } from 'react'
import { fixWebmDuration } from "@fix-webm-duration/fix"


const MIME_TYPES_EXTENSION = [
  {
    mimeType: "webm",
    extension: ".webm",
  },
  {
    mimeType: "mp4",
    extension: ".mp4",
  },
  {
    mimeType: "ogg",
    extension: ".ogg",
  },
  {
    mimeType: "ogg",
    extension: ".ogg",
  },
  {
    mimeType: "x-matroska",
    extension: ".mkv",
  },
  {
    mimeType: "3gpp",
    extension: ".3gp",
  },
  {
    mimeType: "3gpp2",
    extension: ".3gp",
  },
  {
    mimeType: "3gp2",
    extension: ".3gp",
  },
  {
    mimeType: "mpeg",
    extension: ".mpg",
  },
  {
    mimeType: "quicktime",
    extension: ".mov",
  },
]
const MIME_TYPES_CODECS = [
  'vp8',
  'vp9',
  'vp10',
  'h265',
  'h264',
  'h263',
  'avc1',
  'av1',
  'theora',
  'cccc',
  'mp4v.oo',
  'MP4v-es',
  'MPEG-1',
  'MPEG-2',
]
export const DEFAULT_FPS: number = 30
export const DEFAULT_TIMESLICE: number = 1024

export type CanvasRecorderState = 'offline' | 'recording' | 'pending'

export interface CanvasRecorderSettings {
  mimeType: string
  fps: number
  timeslice: number | undefined
}

export interface CanvasRecorder {
  start: (canvas: HTMLCanvasElement, recorderSettings: CanvasRecorderSettings)=>void
  stop: (filename: string)=>void
  pause: ()=>(void | undefined)
  resume: ()=>(void | undefined)
  mimeType: string | undefined
  getFileExtension: ()=>(string | undefined)
  state: CanvasRecorderState
  mediaRecorder?: MediaRecorder
}


export default function useCanvasRecorder(): CanvasRecorder {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | undefined>()
  const chunksRef = useRef<Blob[]>([])
  const [mimeType, setMimeType] = useState<string | undefined>()
  const [state, setState] = useState<CanvasRecorderState>('offline')
  const [startTime, setStartTime] = useState<number>(0)

  function download(videoUrl: string, filename: string) {
    const link = document.createElement('a')

    link.href = videoUrl
    link.download = filename
    link.click()
  }

  function start(canvas: HTMLCanvasElement, options: CanvasRecorderSettings) {
    if (mediaRecorder)
        mediaRecorder.stop()

    const { mimeType, fps, timeslice } = options
    setMimeType(mimeType)
    const videoStream = canvas.captureStream(fps)
    const newMediaRecorder = new MediaRecorder(videoStream, {
      mimeType,
      videoBitsPerSecond: 8000000,
    })

    newMediaRecorder.onstart = () => setState('recording')
    newMediaRecorder.onerror = () => setState('offline')
    newMediaRecorder.ondataavailable = e => chunksRef.current.push(e.data)

    setMediaRecorder(newMediaRecorder)

    chunksRef.current = []
    setState('pending')
    newMediaRecorder.start(timeslice)
    setStartTime(Date.now())
  }

  function stop(filename: string, mediaRecorder?: MediaRecorder, ) {
    if (!mediaRecorder)
      return

    if (mediaRecorder.state === 'inactive' && !state)
      return

    mediaRecorder.onstop = async () => {
      const duration = Date.now() - startTime
      setState('offline')

      if (chunksRef.current.length === 0) {
        return
      }
      else if (chunksRef.current.length === 1) {
        if (chunksRef.current[0].size === 0)
          return
      }

      let blob = new Blob(chunksRef.current, {
        type: mimeType,
      })

      if (mediaRecorder.mimeType.startsWith('video/webm'))
        blob = await fixWebmDuration(blob, duration)

      chunksRef.current = []
      mediaRecorder.stream.getTracks().forEach(track => track.stop())

      download(URL.createObjectURL(blob), filename)
    }

    mediaRecorder.stop()
  }

  function getFileExtension(mediaRecorder?: MediaRecorder) {
    if (!mediaRecorder)
      return

    const mimeTypeExtensionString = mediaRecorder.mimeType.split('/')[1].split(';')[0]
    const mimeTypeExtension = MIME_TYPES_EXTENSION.find(ext => ext.mimeType === mimeTypeExtensionString)

    return mimeTypeExtension?.extension
  }

  return useMemo(() => ({
    start,
    stop: (filename: string) => stop(filename, mediaRecorder),
    pause: () => mediaRecorder?.pause(),
    resume: () => mediaRecorder?.resume(),
    mimeType,
    getFileExtension: () => getFileExtension(mediaRecorder),
    state,
    mediaRecorder,
  }), [mediaRecorder, mimeType, state])
}

export function getMediaRecorderMimeTypes(): string[] {
  return MIME_TYPES_EXTENSION.reduce<string[]>((previousValue, currentValue) => {
    const mimeType = `video/${currentValue.mimeType}`

    if (!MediaRecorder.isTypeSupported(mimeType))
      return previousValue

    return [
      ...previousValue,
      currentValue.mimeType,
    ]
  }, [])
}

export function getMediaRecorderMimeTypeCodecs(mimeTypeExtension: string): string[] {
  const mimeType = `video/${mimeTypeExtension}`

  return MIME_TYPES_CODECS.filter(codec => MediaRecorder.isTypeSupported(`${mimeType};codecs="${codec}"`))
}
