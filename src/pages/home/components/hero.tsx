import {Button} from "@/components/ui/button/button.tsx";
import {Mail} from "lucide-react";
import {SiGithub, SiInstagram} from "@icons-pack/react-simple-icons";
import {useTranslation} from "react-i18next";

// ponytail: simple-icons removed SiLinkedin (LinkedIn brand request), inline svg replaces it
const LinkedInIcon = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.558V9h3.556v11.452z"/>
  </svg>
)

export const Hero = () => {

  const {t} = useTranslation()

  const openEmail = () => {
    const emailBase64 = "ZnNvbGlzbUBmcmFuY2lzY29zb2xpcy5jbA=="
    const email = atob(emailBase64)
    window.open(`mailto:${email}`, '_self')
  }

  const links = [
    {
      content: <>
        <SiGithub size={16}/>
        GitHub
      </>,
      href: 'https://github.com/Im-Fran',
    },
    {
      content: <>
        <LinkedInIcon size={16}/>
        LinkedIn
      </>,
      href: 'https://linkedin.com/in/fsolism',
    },
    {
      content: <>
        <SiInstagram size={14}/>
        Instagram
      </>,
      href: 'https://instagram.com/fran.dev_',
    },
    {
      content: <>
        <Mail size={16}/>
        {t('hero:contact')}
      </>,
      onClick: openEmail,
    }
  ]

  return <section className="relative w-full">
    <div className="absolute inset-0 bg-linear-to-b from-blue-100/40 to-white/95 dark:from-blue-950/30 dark:to-black/95 z-10"/>

    <div className="container mx-auto px-4 py-20 relative z-20">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <div
            className="absolute -inset-1 bg-linear-to-r/oklch from-blue-400 to-purple-400 dark:from-blue-600 dark:to-purple-600 rounded-full blur opacity-60 dark:opacity-70"></div>
          <div className="relative">
            <img
              src="/profile-picture.webp"
              alt={t('hero:avatar_alt')}
              width={180}
              height={180}
              className="w-64 h-64 rounded-full border-4 border-white dark:border-black object-cover object-center shadow-lg"
            />
          </div>
        </div>

        <div className="text-center md:text-left">
          <h1
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
            Francisco Solís Maturana
          </h1>
          <h2 className="text-xl md:text-2xl mt-2 text-gray-700 dark:text-gray-300">{t('personal_info:title')}</h2>
          <h3 className="text-lg md:text-xl mt-2 text-gray-600 dark:text-gray-500">🇨🇱 Santiago, Chile</h3>
          <p className="mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
            {t('personal_info:bio')}
          </p>

          <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
            {links.map((link, idx) => <Button key={idx} onClick={() => link.href ? window.open(link.href, '_blank') : link?.onClick?.call(null)} variant={"outline"} size={"sm"} className="group border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 overflow-hidden transition-all duration-300">
              <span className="flex items-center">
                <span className="flex-shrink-0">{link.content.props.children[0]}</span>
                <span className="max-w-0 whitespace-nowrap overflow-hidden transition-all duration-300 group-hover:max-w-xs group-hover:ml-2">
                  {link.content.props.children[1]}
                </span>
              </span>
            </Button>)}
          </div>
        </div>
      </div>
    </div>
  </section>
}