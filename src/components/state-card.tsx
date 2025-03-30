import { Card, CardContent } from "@/components/ui/card"
import CountUp from "react-countup";

export type StatCardProps = {
  title: string
  value: string | number
  className?: string
}

export const StatCard = ({ title, value, className = "" }: StatCardProps) => <Card className={`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all py-2 shadow-sm ${className}`}>
  <CardContent className={"flex flex-col items-center justify-center w-full h-full"}>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
    <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
      {typeof value === 'number' ? <CountUp end={value} duration={5}/> : value}
    </p>
  </CardContent>
</Card>