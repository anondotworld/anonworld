import { useQuery } from '@tanstack/react-query'
import { useNotifications } from './use-notifications'

const LOCAL_STORAGE_KEY = 'anon:notifications:last-seen'

const getLastSeen = () => {
  const count = localStorage.getItem(LOCAL_STORAGE_KEY)
  return count ? Number.parseInt(count) : 0
}

export function useNotificationsCount() {
  const { data: notifications } = useNotifications()
  const props = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const lastSeen = getLastSeen()
      const newNotifications = notifications?.filter(
        (n) => new Date(n.timestamp).getTime() > lastSeen
      )
      return newNotifications?.length ?? 0
    },
    enabled: !!notifications,
  })

  return {
    ...props,
    markSeen: () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, new Date().getTime().toString())
      props.refetch()
    },
  }
}
