import { useEffect } from 'react'
import { useAppStore, DEFAULT_AGENT_TYPES } from '@/store/app-store'

export function useInitializeStore() {
  const { agentTypes, setAgentTypes } = useAppStore()

  useEffect(() => {
    if (agentTypes.length === 0) {
      setAgentTypes(DEFAULT_AGENT_TYPES)
    }
  }, [agentTypes, setAgentTypes])
}
