import TemplateDashboard from './TemplateDashboard'
import ExampleContainerDashboard from './ExampleContainerDashboard'
import VNCViewSkeleton from '../VNCView/VNCViewSkeleton'
import { SessionStore } from '../../stores/sessionStore'
import useExampleContainer from '../../hooks/useExampleContainer'
import { useContext, useEffect, useState } from 'react'
import { VNCContext } from '../../contexts/VNCContext'


interface DashboardProps {
  appLoading: boolean
  sessionStore: SessionStore
}


export default function Dashboard({ appLoading, sessionStore }: DashboardProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const vncHandler = useContext(VNCContext)
  const { exampleContainer, checkExampleContainerExist } = useExampleContainer(vncHandler)

  useEffect(() => {
    if (appLoading)
      return

    checkExampleContainerExist().finally(() => setLoading(false))
  }, [appLoading])

  if (appLoading || loading)
    return (
      <VNCViewSkeleton />
    )

  if (exampleContainer)
    return <ExampleContainerDashboard
      exampleContainer={ exampleContainer }
      checkExampleContainerExist={ checkExampleContainerExist }
      sessionStore={ sessionStore }
    />

  return <TemplateDashboard checkExampleContainerExist={checkExampleContainerExist} />
}
