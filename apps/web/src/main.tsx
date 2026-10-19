import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import { AppLayout } from './App.tsx'
import { AuthGuard } from './components/AuthGuard.tsx'
import { AuthSessionLoader } from './components/AuthSessionLoader.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'
import { WorkspacePage } from './pages/WorkspacePage.tsx'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <AuthSessionLoader><AuthGuard><AppLayout /></AuthGuard></AuthSessionLoader>,
    children: [
      { index: true, element: <WorkspacePage /> },
      { path: 'applicants', element: <WorkspacePage /> },
      { path: 'jobs', element: <WorkspacePage /> },
      { path: 'team', element: <WorkspacePage /> },
      { path: 'departments', element: <WorkspacePage /> },
      { path: 'activity', element: <WorkspacePage /> },
      { path: 'settings', element: <WorkspacePage /> },
      { path: '*', element: <WorkspacePage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
