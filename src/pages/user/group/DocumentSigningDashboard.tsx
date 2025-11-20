import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material'
import {
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import PendingSignatures from '@/components/group/PendingSignatures'
import SignedDocuments from '@/components/group/SignedDocuments'
import type { UUID } from '@/models/booking'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`signing-tabpanel-${index}`}
      aria-labelledby={`signing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function DocumentSigningDashboard() {
  const { groupId } = useParams<{ groupId: string }>()
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (!groupId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Group ID not found
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#7a9b76', mb: 1 }}>
          Document Signing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage document signatures and track signing progress
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="signing tabs"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
            },
          }}
        >
          <Tab
            icon={<PendingIcon />}
            iconPosition="start"
            label="Pending Signatures"
            id="signing-tab-0"
            aria-controls="signing-tabpanel-0"
          />
          <Tab
            icon={<CheckCircleIcon />}
            iconPosition="start"
            label="Signed Documents"
            id="signing-tab-1"
            aria-controls="signing-tabpanel-1"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <PendingSignatures groupId={groupId as UUID} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <SignedDocuments groupId={groupId as UUID} />
      </TabPanel>
    </Box>
  )
}
