import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppContainer } from '@/components/layout/AppContainer'

const RootLayout = () => (
  <>
    <AppContainer>
      <Outlet />
    </AppContainer>
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })
