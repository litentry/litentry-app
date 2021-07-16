import React from 'react';
import {Platform} from 'react-native';
import {usePushTopics} from './usePushTopics';
import {useIsFirstAppStart} from 'src/hook/useIsFirstAppStart';

export function useTurnOnAllNotificationsOnAppStartForAndroid() {
  const {toggleTopic, topics, isLoading: topicsLoading} = usePushTopics();
  const {data: isFirstAppStart, isLoading: firstAppStartLoading} = useIsFirstAppStart();

  const isRunnedOnceRef = React.useRef(false);

  const isLoaded = !firstAppStartLoading && !topicsLoading && isFirstAppStart;
  const shouldToggle =
    isLoaded && isFirstAppStart && Platform.OS === 'android' && !isRunnedOnceRef.current && topics.length > 0;

  // toggle all topics to true on first app start
  // on IOS we will do that after push permission granted
  React.useEffect(() => {
    (async () => {
      if (shouldToggle) {
        isRunnedOnceRef.current = true;
        for (const topic of topics) {
          await toggleTopic({id: topic.id, subscribe: true});
        }
      }
    })();
  }, [shouldToggle, toggleTopic, topics]);
}
