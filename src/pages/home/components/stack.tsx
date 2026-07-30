import {useRef} from "react";
import {useTranslation} from "react-i18next";
import {Browser, HardDrives, DeviceMobile, Stack as StackIcon} from "@phosphor-icons/react";
import {Card, CardTitle, CardBody} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {useScrollReveal} from "@/pages/home/hooks/useScrollReveal.ts";

type StackCategory = { name: string; tools: string[] };

const icons = [Browser, HardDrives, DeviceMobile, StackIcon];

export const Stack = () => {
  const {t} = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  const categories = t("stack:categories", {returnObjects: true}) as StackCategory[];

  return (
    <section id="stack" ref={sectionRef} className="container mx-auto px-4 py-24">
      <p className="reveal text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-3">
        {t("stack:kicker")}
      </p>
      <h2 className="reveal text-[clamp(30px,4vw,46px)] text-text mb-10">
        {t("stack:title")}
      </h2>

      <div className="reveal-stagger grid gap-6" style={{gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"}}>
        {categories.map((category, index) => {
          const Icon = icons[index % icons.length];
          return (
            <Card key={category.name} elevation="sm" className="reveal-item fs-hoverable transition-transform">
              <CardBody>
                <Icon size={28} className="text-accent-300 mb-4"/>
                <CardTitle>{category.name}</CardTitle>
                <div className="mt-4 flex flex-wrap gap-2">
                  {category.tools.map((tool) => (
                    <Badge key={tool} variant="outline">{tool}</Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
