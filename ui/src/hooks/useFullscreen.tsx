import { RefObject, useLayoutEffect, useState } from 'react'


export default function useFullscreen(): [boolean, (ref: RefObject<HTMLElement>)=>void, ()=>boolean] {
  const checkIfFullscreen = () => getBrowserFullscreenElementProp() != null
  const [isFullscreen, setIsFullscreen] = useState(
    getBrowserFullscreenElementProp() != null
  )

  const requestFullscreen = (ref: RefObject<HTMLElement>) => {
    if (ref.current == null) return

    ref.current
      .requestFullscreen()
      .then(() => setIsFullscreen(getBrowserFullscreenElementProp() != null))
      .catch(() => setIsFullscreen(false))
  }

  useLayoutEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(getBrowserFullscreenElementProp() != null)

    addEventListener('fullscreenchange', onFullscreenChange)

    return () => removeEventListener('fullscreenchange', onFullscreenChange)
  })

  return [isFullscreen, requestFullscreen, checkIfFullscreen]
}

function getBrowserFullscreenElementProp() {
  if (typeof document.fullscreenElement !== "undefined") {
    return document.fullscreenElement
  }

  // @ts-ignore
  else if (typeof document.mozFullScreenElement !== "undefined") {
    // @ts-ignore
    return document.mozFullScreenElement
  }

  // @ts-ignore
  else if (typeof document.msFullscreenElement !== "undefined") {
    // @ts-ignore
    return document.msFullscreenElement
  }

  // @ts-ignore
  else if (typeof document.webkitFullscreenElement !== "undefined") {
    // @ts-ignore
    return document.msFullscreenElement
  }

  else {
    throw new Error("fullscreenElement is not supported by this browser")
  }
}
