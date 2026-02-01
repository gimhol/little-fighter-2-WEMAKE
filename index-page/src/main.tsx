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

let i = 0;

let xd = (Math.random() > 0.5) ? 1 : -1
let yd = (Math.random() > 0.5) ? 1 : -1
console.log({ xd, yd })

setInterval(() => {
  i = (i + 1) % 32
  document.documentElement.style.backgroundPosition = `${xd * i}px ${yd * i}px`
}, 30);