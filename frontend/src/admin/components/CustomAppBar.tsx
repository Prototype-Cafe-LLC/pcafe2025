import { AppBar, AppBarProps, useGetIdentity } from 'react-admin'
import { HomeIcon } from '@radix-ui/react-icons'
import styles from './CustomAppBar.module.css'

export const CustomAppBar = (props: AppBarProps) => {
  const { data: identity, isLoading } = useGetIdentity()

  return (
    <AppBar {...props}>
      <div className={styles.spacer} />

      {/* User Info */}
      {!isLoading && identity && (
        <div className={styles.userInfo}>
          <p className={styles.userText}>
            Welcome, {identity.fullName || identity.username || 'Admin'}
          </p>
        </div>
      )}

      <a
        href="/"
        className={styles.homeButton}
      >
        <HomeIcon className={styles.homeIcon} />
        Back to Main Site
      </a>
    </AppBar>
  )
}