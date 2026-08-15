import { cn } from '../lib/utils'

export default function SectionHeader({ title, className }) {
  return (
    <div className={cn("h-fit flex flex-row items-center py-2 shrink-0", className || "w-full")}>
      <h2 className="text-[24px] md:text-[32px] font-extrabold leading-[1.4] text-transparent bg-clip-text bg-gradient-to-r from-[#2C25EB] to-[#2563EB] dark:from-blue-400 dark:to-blue-500 transition-all duration-300">
        {title}
      </h2>
    </div>
  )
}
