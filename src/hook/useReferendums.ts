import {useApi} from 'context/ChainApiContext';
import {useQuery} from 'react-query';

export function useReferendums() {
  const {api} = useApi();

  return useQuery('referendums', () => api?.derive.democracy.referendums());
}
