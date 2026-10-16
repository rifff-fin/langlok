import { createBrowserRouter } from 'react-router';
import { RootLayout } from './RootLayout';
import { Home } from '../pages/Home';
import { DevPin } from '../pages/DevPin';

// Phase 1 adds /custom-branding, /recan, /story, /contact; Phase 6 adds /admin.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      ...(import.meta.env.DEV ? [{ path: '/dev', element: <DevPin /> }] : []),
    ],
  },
]);
