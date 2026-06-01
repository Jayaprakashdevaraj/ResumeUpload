import React from 'react';
import BrandAvatar from '../common/BrandAvatar';
import SearchModeNav from '../../features/sidebar/SearchModeNav';
import HybridWeightPanel from '../../features/sidebar/HybridWeightPanel';
import ResultsLimitSelect from '../../features/sidebar/ResultsLimitSelect';
import ClearChatButton from '../../features/sidebar/ClearChatButton';
import { useSearchStore } from '../../lib/stores/search.store';
import { AnimatePresence } from 'framer-motion';

export function Sidebar() {
  const { searchType } = useSearchStore();

  return (
    <aside className="w-[260px] shrink-0 bg-bg-surface border-r border-white/[0.07] flex flex-col p-5 gap-4 overflow-y-auto">
      <BrandAvatar />

      <div className="text-xs font-medium text-text-muted">Search Mode</div>
      <SearchModeNav />

      <AnimatePresence>
        {searchType === 'hybrid' && (
          <div className="pt-2">
            <HybridWeightPanel />
          </div>
        )}
      </AnimatePresence>

      <div className="mt-auto">
        <div className="text-xs font-medium text-text-muted mb-2">Results limit</div>
        <ResultsLimitSelect />
        <ClearChatButton />
        <footer className="text-xs text-text-muted pt-4">RecruitBot v2.0</footer>
      </div>
    </aside>
  );
}

export default Sidebar;
