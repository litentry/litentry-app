import {useQueryClient, useQuery, useMutation} from 'react-query';
import * as AsyncStorage from 'src/service/AsyncStorage';
import messaging from '@react-native-firebase/messaging';

export const PUSH_NOTIFICATION_TOPICS = [
  {id: 'treasury.Proposed', label: 'New Treasury Proposal'},
  {id: 'tips.NewTip', label: 'Tip Suggestion'},
  {id: 'democracy.Started', label: 'New referendum has begun!'},
];

const SELECTED_PUSH_TOPICS_QUERY_KEY = 'selected_push_topics';

export function usePushTopics() {
  const queryClient = useQueryClient();

  const {data, isLoading, isError} = useQuery(SELECTED_PUSH_TOPICS_QUERY_KEY, () =>
    AsyncStorage.getItem<string[]>(SELECTED_PUSH_TOPICS_QUERY_KEY, []),
  );

  const {mutateAsync: toggleTopic} = useMutation<
    void,
    unknown,
    {id: string; subscribe: boolean},
    {previousTopics: string[]}
  >(
    async ({id, subscribe}) => {
      if (!data) {
        throw new Error('DATA NOT LOADED YET!');
      }
      const updatedData = subscribe ? [...data, id] : data.filter((t) => t !== id);
      await AsyncStorage.setItem(SELECTED_PUSH_TOPICS_QUERY_KEY, updatedData);

      if (subscribe) {
        messaging().subscribeToTopic(id);
      } else {
        messaging().unsubscribeFromTopic(id);
      }
    },
    {
      onSettled: () => queryClient.invalidateQueries(SELECTED_PUSH_TOPICS_QUERY_KEY),

      /**
       * optimistic update
       * more info: https://react-query.tanstack.com/guides/optimistic-updates#updating-a-list-of-todos-when-adding-a-new-todo
       * */
      onMutate: async ({id, subscribe}) => {
        await queryClient.cancelQueries(SELECTED_PUSH_TOPICS_QUERY_KEY);
        const previousTopics = queryClient.getQueryData<string[]>(SELECTED_PUSH_TOPICS_QUERY_KEY) ?? [];
        queryClient.setQueryData<string[]>(SELECTED_PUSH_TOPICS_QUERY_KEY, (previousData) => {
          if (!previousData) {
            return [];
          }
          return subscribe ? [...previousData, id] : previousData.filter((t) => t !== id);
        });
        return {previousTopics};
      },
      onError: (err, vars, context) => {
        console.error(err);
        if (context?.previousTopics) {
          queryClient.setQueryData(SELECTED_PUSH_TOPICS_QUERY_KEY, context.previousTopics);
        }
      },
    },
  );

  return {
    topics: PUSH_NOTIFICATION_TOPICS.map((t) => ({...t, selected: !!data?.includes(t.id)})),
    toggleTopic,
    isError,
    isLoading,
  };
}
