import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { HTMLAttributes, ReactNode } from "react";
import {RouterProvider} from "react-router-dom";
import router from "@/router.tsx";
import '@/lib/main.css'
import "@radix-ui/themes/styles.css";
import i18next from "i18next";
import I18NextLocalStorageBackend from "i18next-localstorage-backend";
import resourcesToBackend from "i18next-resources-to-backend";
import {initReactI18next} from "react-i18next";

export type BaseProperties = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
};

i18next
  .use(initReactI18next)
  .use(resourcesToBackend((lang: string, namespace: string) => import(`./translations/${lang}/${namespace}.json`)))
  .init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'personal_info', 'projects', 'skills', 'experience', 'github_stats', 'hero', 'certifications'],
    backend: {
      backends: [I18NextLocalStorageBackend],
      backendOptions: [
        { expirationTime: 7 * 24 * 60 * 60 * 1000 }, // 7 days
      ]
    }
  })

i18next.loadLanguages(['en', 'es'])

createRoot(document.getElementById('root')!).render(<StrictMode><RouterProvider router={router}/></StrictMode>)
