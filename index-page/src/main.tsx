import 'current-device';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from "react-router-dom";
import './i18n';
import { Paths } from './Paths';
import './style.scss';
import './utils/fingerprint';
const router = createHashRouter(Paths.Routes);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)




