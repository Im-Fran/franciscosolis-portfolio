import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ShimmerText} from "shimmer-effects-react";
import {useEffect, useState} from "react";
import axios from "axios";
import {i18n} from "@/translations/translations.ts";

const GithubStats = () => {

  // Replace with actual GitHub stats or fetch from GitHub API
  const [githubStats, setGithubStats] = useState<Stats>({repositories: null, stars: null, followers: null, total_commits: null, pull_requests: null});

  useEffect(() => {
    const apiURL = import.meta.env['VITE_API_URL']
    const loadGithub = async () => await axios.get(`${apiURL}/github`)
    const loadGithubStats = async () => await axios.get(`${apiURL}/github/stats`)

    loadGithub().then(({data}) => setGithubStats(prev => ({
      ...prev,
      repositories: data.repos.total,
      followers: data.followers,
    })))

    loadGithubStats().then(({data}) => setGithubStats(prev => ({
      ...prev,
      stars: data.starsEarned,
      total_commits: data.totalCommits,
      pull_requests: data.prs
    })))
  }, [])

  const [translations, setTranslations] = useState<Translations>(i18n.translations[i18n.locale].github_stats)

  useEffect(() => i18n.onChange(() => setTranslations(i18n.translations[i18n.locale].github_stats)), []);

  return <section className={"flex flex-col items-start justify-center gap-4 w-full"}>
    <div className={"flex flex-col items-start justify-center"}>
      <h2 className={"text-2xl font-semibold"}>{translations.title}</h2>
      <h4 className={"text-md text-neutral-500 dark:text-neutral-400"}>{translations.description}</h4>
    </div>

    <div className={"grid grid-cols-2 md:grid-cols-4 gap-4"}>
      {Object.entries(githubStats).map(([key, value]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className={"text-lg capitalize"}>{`${translations[key] || key.split("_").join(" ")}`}</CardTitle>
          </CardHeader>
          <CardContent className={"w-full"}>
            <ShimmerText width={40} height={30} mode={"light"} line={1} loading={value == null}>
              <p className={"text-3xl font-bold"}>{value}</p>
            </ShimmerText>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>;
}

interface Translations {
  title: string | undefined | null;
  description: string | undefined | null;

  repositories: string | undefined | null;
  stars: string | undefined | null;
  followers: string | undefined | null;
  total_commits: string | undefined | null;
  pull_requests: string | undefined | null;

  [key: string]: string | undefined | null
}

interface Stats {
  repositories: number | null;
  stars: number | null;
  followers: number | null;
  total_commits: number | null;
  pull_requests: number | null;
}

export default GithubStats;