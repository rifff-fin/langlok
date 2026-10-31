import { RouterProvider } from 'react-router/dom';
import { SmoothScroll } from '../lib/lenis';
import { router } from './routes';

export function App() {
  return (
    <SmoothScroll>
      <RouterProvider router={router} />
    </SmoothScroll>
  );
}
