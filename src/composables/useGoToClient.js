import { goToClient, useNavigation } from './useNavigation'

export { goToClient }

export function useGoToClient() {
  return {
    goToClient,
  }
}

export default useGoToClient
