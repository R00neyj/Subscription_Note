export default function SectionHeader({ title }) {
  return (
    <div className="w-full h-[64px] flex flex-row items-center py-2 shrink-0">
      <h2 className="text-[42px] font-bold tracking-[-0.02em] leading-[1.4] text-transparent bg-clip-text bg-gradient-to-r from-[#2C25EB] to-[#2563EB] dark:from-blue-400 dark:to-blue-500 transition-all duration-300">
        {title}
      </h2>
    </div>
  )
}
