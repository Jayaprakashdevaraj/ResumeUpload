import { renderHook, act } from '@testing-library/react';
import useSearch from '../../../hooks/use-search';
import searchApi from '../../../lib/api/search.api';

describe('useSearch hook', () => {
  it('calls search API when event is dispatched', async () => {
    const spy = vi.spyOn(searchApi as any, 'searchResumes').mockResolvedValue({ results: [], query: 'foo' });

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      window.dispatchEvent(new CustomEvent('recruitbot:search', { detail: { query: 'foo' } }));
      // allow microtasks
      await Promise.resolve();
    });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
