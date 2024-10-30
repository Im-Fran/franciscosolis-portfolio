import GithubStats from "@/pages/home/components/github-stats.tsx";

const Home = () => {
  const personalInfo = {
    name: "Francisco Solís",
    title: "Full Stack & Mobile Developer",
    bio: "I'm passionate about creating elegant solutions to complex problems. I have experience with many frontend, backend and mobile tools.",
    github: "Im-Fran",
    linkedin: "franciscosolismat",
    email: "fsolism@franciscosolis.cl"
  }

  return <div className={"flex flex-col items-center justify-center h-full w-full py-20 gap-5"}>
    <div className={"flex flex-col items-center justify-center gap-2.5"}>
      <h1 className={"text-4xl font-bold"}>{personalInfo.name}</h1>
      <h4 className={"text-xl text-neutral-500 dark:text-neutral-400"}>{personalInfo.title}</h4>
    </div>

    <span className={"text-md text-neutral-500 dark:text-neutral-400 my-5 max-w-md md:max-w-2xl text-center"}>{personalInfo.bio}</span>

    <GithubStats/>
  </div>
}

export default Home;