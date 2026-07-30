import {useEffect, useState} from "react";
import axios from "axios";
import {StatCard} from "@/legacy/components/state-card.tsx";
import {useTranslation} from "react-i18next";
import type {HttpResponse} from "@/interfaces";

export const GithubStats = () => {
  const {t} = useTranslation()

  const [githubStats, setGithubStats] = useState<Stats>({
    repositories: null,
    stars: null,
    followers: null,
    total_commits: null,
    pull_requests: null
  });

  useEffect(() => {
    axios.get<HttpResponse<{ repositories: number; followers: number }>>('/api/stats/github/profile').then(({data}) => {
      if (!data.data) return
      const {repositories, followers} = data.data
      setGithubStats((prev) => ({...prev, repositories, followers}))
    })

    axios.get<HttpResponse<number>>('/api/stats/github/stars').then(({data}) => {
      if (data.data == null) return
      setGithubStats((prev) => ({...prev, stars: data.data as number}))
    })

    axios.get<HttpResponse<number>>('/api/stats/github/pull-requests').then(({data}) => {
      if (data.data == null) return
      setGithubStats((prev) => ({...prev, pull_requests: data.data as number}))
    })

    axios.get<HttpResponse<number>>('/api/stats/github/total-commits').then(({data}) => {
      if (data.data == null) return
      setGithubStats((prev) => ({...prev, total_commits: data.data as number}))
    })
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