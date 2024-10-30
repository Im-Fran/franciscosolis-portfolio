import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'tailwindcss/tailwind.css'
import { HTMLAttributes, ReactNode } from "react";
import {RouterProvider} from "react-router-dom";
import router from "@/router.tsx";

export type BaseProperties = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
};

createRoot(document.getElementById('root')!).render(<StrictMode><RouterProvider router={router}/></StrictMode>)
