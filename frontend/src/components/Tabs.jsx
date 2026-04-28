export default function Tabs({ tabs, activeTab, onTabClick }) {
  return (
    <div className="flex space-x-2 mb-8 border-b border-zinc-800 pb-px">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabClick(tab.id, tab.locked)}
          className={`px-6 py-4 rounded-t-lg font-semibold transition-all duration-300 flex items-center gap-3 relative
            ${activeTab === tab.id 
              ? 'text-blue-400 bg-zinc-800/80' 
              : 'text-zinc-500 hover:text-zinc-300'
            }
            ${tab.locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-zinc-800/40'}
          `}
        >
          {tab.label}
          {tab.locked && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          )}
        </button>
      ))}
    </div>
  );
}
