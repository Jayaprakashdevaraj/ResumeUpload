import React from 'react';
import SearchBar from '../components/SearchBar';
import { SearchModeNav } from '../../sidebar/SearchModeNav';
import HybridWeightPanel from '../../sidebar/HybridWeightPanel';
import ResultsList from '../../../components/results/ResultsList';
import ResultsToolbar from '../components/ResultsToolbar';
import { useSearchStore } from '../../../lib/stores/search.store';
import RerankPanel from '../components/RerankPanel';
import ChatPanel from '../../chat/components/ChatPanel';

export default function SearchPage() {
  const results = useSearchStore((s) => s.results);
  const searchType = useSearchStore((s) => s.searchType);
  const isSearching = useSearchStore((s) => s.isSearching);
  const lastQuery = useSearchStore((s) => s.lastQuery);
  const [filtered, setFiltered] = React.useState(results);

  React.useEffect(() => setFiltered(results), [results]);

  return (
    <div className="p-6 grid grid-cols-4 gap-6">
      <aside className="col-span-1">
        <div className="mb-4">
          <SearchBar />
        </div>
        <div className="mb-4">
          <SearchModeNav />
        </div>
        <div>
          <HybridWeightPanel />
        </div>
        <div className="mt-6 border-t pt-4">
          <div className="text-sm font-semibold mb-2">Chat</div>
          <div className="h-64">
            <ChatPanel />
          </div>
        </div>
      </aside>
      <main className="col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-text-muted">{isSearching ? 'Searching...' : `Results for "${lastQuery || ''}"`}</div>
          <div className="flex items-center gap-4">
            <ResultsToolbar results={results} onChange={(r) => setFiltered(r)} />
            <RerankPanel />
          </div>
        </div>
        <ResultsList results={filtered} searchType={searchType} duration={0} query={lastQuery} />
      </main>
    </div>
  );
}
