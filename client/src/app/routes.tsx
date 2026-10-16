import { createBrowserRouter } from 'react-router';
import { RootLayout } from './RootLayout';
import { Home } from '../pages/Home';
import { CustomBranding } from '../pages/CustomBranding';
import { ReCan } from '../pages/ReCan';
import { Story } from '../pages/Story';
import { Contact } from '../pages/Contact';
import { NotFound } from '../pages/NotFound';
import { DevPin } from '../pages/DevPin';

// Phase 6 adds /admin.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/custom-branding', element: <CustomBranding /> },
      { path: '/recan', element: <ReCan /> },
      { path: '/story', element: <Story /> },
      { path: '/contact', element: <Contact /> },
      ...(import.meta.env.DEV ? [{ path: '/dev', element: <DevPin /> }] : []),
      { path: '*', element: <NotFound /> },
    ],
  },
]);
