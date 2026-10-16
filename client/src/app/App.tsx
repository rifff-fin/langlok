import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router/dom';
import { SmoothScroll } from '../lib/lenis';
import { router } from './routes';

export function App() {
  return (
    <HelmetProvider>
      <SmoothScroll>
        <RouterProvider router={router} />
      </SmoothScroll>
    </HelmetProvider>
  );
}
