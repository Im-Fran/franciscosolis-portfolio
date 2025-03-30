import {Calendar, MapPin} from "lucide-react"

import {Badge} from "@/components/ui/badge/badge"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"

export type ExperienceCardProps = {
  title: string
  company: string
  period: string
  location: string
  description: string
}

/**
 * ExperienceCard component displays information about a work experience
 * with title, company, period, location, and description
 */
export const ExperienceCard = ({title, company, period, location, description}: ExperienceCardProps) => {
  // Technologies to detect in the description
  const technologies = [
    "Laravel",
    "Vue.js",
    "React",
    "TypeScript",
    "PostgreSQL",
    "Flutter",
    "Docker",
    "AWS",
    "Node.js",
    "JavaScript",
    "TailwindCSS",
    "Redis",
    "Ubuntu",
  ]

  // Find technologies mentioned in the description
  const mentionedTechnologies = technologies.filter((tech) => description.toLowerCase().includes(tech.toLowerCase()))

  return <Card
    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600/70 transition-all overflow-hidden hover:shadow-md hover:shadow-blue-300/20 dark:hover:shadow-blue-900/20">
    <CardHeader className="pb-2 w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
        <div>
          <CardTitle className="text-xl text-gray-800 dark:text-white">{title}</CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">{company}</CardDescription>
        </div>
        <div className="flex flex-col items-start md:items-end text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md">
            <Calendar size={14} className="text-blue-600 dark:text-blue-400"/>
            <span>{period}</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md">
            <MapPin size={14} className="text-blue-600 dark:text-blue-400"/>
            <span>{location}</span>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="mt-2 space-y-4">
        <div className="relative pl-6 border-l-2 border-blue-400/50 dark:border-blue-600/50">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
          <div className="absolute -left-1.5 top-0">
            <div className="h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-600"></div>
          </div>
        </div>

        {mentionedTechnologies.length > 0 && <div className="flex flex-wrap gap-2 mt-4">
          {mentionedTechnologies.map((tech, index) => (
            <Badge key={index} variant="outline"
                   className="bg-gray-100 dark:bg-gray-800/50 text-xs border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              {tech}
            </Badge>
          ))}
        </div>}
      </div>
    </CardContent>
  </Card>
}