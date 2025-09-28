import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => (
  <>
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })
