import {useEffect, useState} from "react";
import axios from "axios";
import {StatCard} from "@/components/state-card.tsx";
import {useTranslation} from "react-i18next";

export const GithubStats = () => {
  const {t} = useTranslation()

  // Replace with actual GitHub stats or fetch from GitHub API
  const [githubStats, setGithubStats] = useState<Stats>({
    repositories: null,
    stars: null,
    followers: null,
    total_commits: null,
    pull_requests: null
  });

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

  return <section className="py-16">
    <div className="container mx-auto px-4">
      <div className={"flex flex-col items-center justify-center mb-8"}>
        <h2 className={"text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white"}>{t('github_stats:title')}</h2>
        <span className={"text-md md:text-lg text-center text-gray-600 dark:text-gray-300"}>{t('github_stats:description')}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(githubStats).map(([key, value]) => <StatCard key={key} title={t(`github_stats:${key}`)} value={value || '--'}/>)}
      </div>
    </div>
  </section>
}

export type Stats = {
  repositories: number | null;
  stars: number | null;
  followers: number | null;
  total_commits: number | null;
  pull_requests: number | null;
}