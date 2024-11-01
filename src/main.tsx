import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HTMLAttributes, ReactNode } from "react";
import {RouterProvider} from "react-router-dom";
import router from "@/router.tsx";
import 'tailwindcss/tailwind.css'
import "@radix-ui/themes/styles.css";

export type BaseProperties = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
};

createRoot(document.getElementById('root')!).render(<StrictMode><RouterProvider router={router}/></StrictMode>)
