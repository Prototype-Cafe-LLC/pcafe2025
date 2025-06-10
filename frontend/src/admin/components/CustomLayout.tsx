import { Layout, LayoutProps } from 'react-admin'
import { CustomAppBar } from './CustomAppBar'

export const CustomLayout = (props: LayoutProps) => {
  return <Layout {...props} appBar={CustomAppBar} />
}