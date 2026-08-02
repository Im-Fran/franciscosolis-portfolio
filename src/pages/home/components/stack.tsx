import {useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {BrowserIcon, HardDrivesIcon, DeviceMobileIcon, StackIcon, TerminalIcon, CloudIcon, ShieldCheckIcon, RobotIcon} from "@phosphor-icons/react";
import {Card, CardTitle, CardBody} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Modal} from "@/components/ui/modal.tsx";
import {Carousel} from "@/components/ui/carousel.tsx";
import {useScrollReveal} from "@/pages/home/hooks/useScrollReveal.ts";
import {getFeaturedProjectsByToolbox, type ToolboxCategory} from "@/pages/home/components/projects/projects.data.ts";

type StackGroup = { name: string; tools: string[] };
type StackCategory = { key: ToolboxCategory; tools?: string[]; groups?: StackGroup[] };

const icons: Record<ToolboxCategory, typeof BrowserIcon> = {
  frontend: BrowserIcon,
  backend: HardDrivesIcon,
  mobile: DeviceMobileIcon,
  apis: StackIcon,
  sysadmin: TerminalIcon,
  cloud: CloudIcon,
  security: ShieldCheckIcon,
  ai: RobotIcon,
};

export const Stack = () => {
  const {t} = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);
  const [activeCategory, setActiveCategory] = useState<ToolboxCategory | null>(null);

  const categories = t("stack:categories", {returnObjects: true}) as StackCategory[];
  const relatedProjects = activeCategory ? getFeaturedProjectsByToolbox(activeCategory) : [];
  const activeGroups = categories.find((category) => category.key === activeCategory)?.groups;

  return (
    <section id="stack" ref={sectionRef} className="container mx-auto px-4 py-24">
      <p className="reveal text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-3">
        {t("stack:kicker")}
      </p>
      <h2 className="reveal text-[clamp(30px,4vw,46px)] text-text mb-3">
        {t("stack:title")}
      </h2>
      <p className="reveal text-sm text-neutral-400 mb-10">
        {t("stack:subtitle")}
      </p>

      <div className="reveal-stagger">
        <Carousel slideClassName="w-[260px] sm:w-[300px]">
          {categories.map((category) => {
            const Icon = icons[category.key];
            return (
              <Card key={category.key} elevation="sm" className="reveal-item fs-hoverable w-full flex-1 flex flex-col">
                <button
                  type="button"
                  data-fs-hover
                  onClick={() => setActiveCategory(category.key)}
                  className="flex flex-1 flex-col w-full h-full text-left"
                >
                  <CardBody className="flex flex-1 flex-col justify-between h-full">
                    <div>
                      <Icon size={28} className="text-accent-300 mb-4"/>
                      <CardTitle>{t(`stack:categoryLabels.${category.key}`)}</CardTitle>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(category.groups ? category.groups.map((group) => group.name) : category.tools ?? []).map((tool) => (
                          <Badge key={tool} variant="outline">{tool}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </button>
              </Card>
            );
          })}
        </Carousel>
      </div>

      <Modal
        open={activeCategory !== null}
        onClose={() => setActiveCategory(null)}
        title={activeCategory ? t(`stack:categoryLabels.${activeCategory}`) : undefined}
      >
        {activeGroups && (
          <div className="mb-6 space-y-4">
            {activeGroups.map((group) => (
              <div key={group.name}>
                <p className="text-sm text-text">{group.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.tools.map((tool) => (
                    <Badge key={tool} variant="outline">{tool}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">{t("stack:modal_projects_label")}</p>
        {relatedProjects.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">{t("stack:modal_empty")}</p>
        ) : (
          <div className="mt-3 space-y-3">
            {relatedProjects.map((project) => (
              <a
                key={project.id}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                data-fs-hover
                className="block rounded-[var(--radius-sm)] border border-neutral-800 p-4 transition-colors hover:border-accent-700"
              >
                <p className="text-text">{project.title}</p>
                <p className="mt-1 text-sm text-neutral-400">{project.description}</p>
              </a>
            ))}
          </div>
        )}
      </Modal>
    </section>
  );
};
