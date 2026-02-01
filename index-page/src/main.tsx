import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from "react-router-dom";
import './i18n';
import './index.module.scss';
import { Paths } from './Paths';

const router = createHashRouter(Paths.Routes);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
