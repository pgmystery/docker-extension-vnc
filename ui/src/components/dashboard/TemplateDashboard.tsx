import React, { useState } from 'react'
import { defaultTemplates } from './templates/defaultTemplates'
import {
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import TemplateTabContent from './tabs/TemplateTabContent'
import HubTabContent from './tabs/HubTabContent'


export interface TemplateDashboardProps {
  checkExampleContainerExist: ()=>Promise<ContainerExtended | undefined>
}


export default function TemplateDashboard({ checkExampleContainerExist }: TemplateDashboardProps) {
  const [tab, setTab] = useState(0)

  return (
    <Container fixed maxWidth={false} sx={{ paddingBottom: '10px' }} >
      <Typography variant="h1" sx={{ marginBottom: '20px' }}>Start with a template</Typography>

      {/* Category Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2,
          ".MuiTab-root": { textTransform: "none", fontWeight: 700 },
        }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {defaultTemplates.map((c) => (
          <Tab key={c.id} label={<Stack direction="row" spacing={1} alignItems="center"><c.IconComponent /><span>{c.label}</span></Stack>} />
        ))}
        {/*<Tab key={defaultTemplates.length} label={<Stack direction="row" spacing={1} alignItems="center"><HubIcon /><span>HUB</span></Stack>} />*/}
      </Tabs>

      { tab < defaultTemplates.length
        ? <TemplateTabContent
            category={defaultTemplates[tab]}
            checkExampleContainerExist={checkExampleContainerExist}
          />
        : <HubTabContent

          />
      }

    </Container>
  )
}
