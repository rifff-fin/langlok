import { createBrowserRouter } from 'react-router';
import { RootLayout } from './RootLayout';
import { Home } from '../pages/Home';
import { NotFound } from '../pages/NotFound';
import { DevPin } from '../pages/DevPin';
import { DevStudio } from '../pages/DevStudio';
import { DevBird } from '../pages/DevBird';

// The home page ships in the main bundle; the inner pages (and the inquiry form's
// validation) load when visited.
// Phase 6 adds /admin.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      {
        path: '/custom-branding',
        lazy: async () => ({ Component: (await import('../pages/CustomBranding')).CustomBranding }),
      },
      { path: '/recan', lazy: async () => ({ Component: (await import('../pages/ReCan')).ReCan }) },
      { path: '/story', lazy: async () => ({ Component: (await import('../pages/Story')).Story }) },
      {
        path: '/contact',
        lazy: async () => ({ Component: (await import('../pages/Contact')).Contact }),
      },
      ...(import.meta.env.DEV
        ? [
            { path: '/dev', element: <DevPin /> },
            { path: '/dev/studio', element: <DevStudio /> },
            { path: '/dev/bird', element: <DevBird /> },
          ]
        : []),
      { path: '*', element: <NotFound /> },
    ],
  },
]);
