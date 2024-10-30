import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ShimmerText} from "shimmer-effects-react";
import {useEffect, useState} from "react";
import axios from "axios";

const GithubStats = () => {

  // Replace with actual GitHub stats or fetch from GitHub API
  const [githubStats, setGithubStats] = useState<{
    repositories: number | null,
    stars: number | null,
    followers: number | null,
    total_commits: number | null,
    pull_requests: number | null,
  }>({repositories: null, stars: null, followers: null, total_commits: null, pull_requests: null});

  useEffect(() => {
    const loadGithub = async () => await axios.get('https://franciscosolis-portfolio-api.franciscosolis.workers.dev/github')
    const loadGithubStats = async () => await axios.get('https://franciscosolis-portfolio-api.franciscosolis.workers.dev/github/stats')

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

  return <div className={"flex flex-col items-start justify-center gap-4"}>
    <h3 className={"text-2xl font-bold"}>GitHub Stats</h3>

    <div className={"grid grid-cols-2 md:grid-cols-4 gap-4"}>
      {Object.entries(githubStats).map(([key, value]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="text-lg capitalize">{key.split('_').join(' ')}</CardTitle>
          </CardHeader>
          <CardContent>
            {value === null ? <ShimmerText width={40} height={30} mode={"light"} line={1}/> :
              <p className="text-3xl font-bold">{value}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>;
}

export default GithubStats;