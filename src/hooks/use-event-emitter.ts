import * as React from 'react';
import { Subscription } from 'rxjs';
import { EventEmitter } from '../utils/event-emitter';

export function useEventEmitter(): [
  EventEmitter,
  {
    on: <T extends {}>(
      key: string,
      callback: (res: T) => void,
    ) => Subscription | undefined;
    removeAll: () => void;
  },
] {
  const [eventEmitter] = React.useState<EventEmitter>(new EventEmitter());
  const subscriptionRef = React.useRef<Subscription>();

  const on = React.useCallback(
    <T>(key: string, callback: (res: T) => void): Subscription | undefined => {
      if (!eventEmitter) return;
      const sub = eventEmitter.on<T>(key).subscribe((res) => {
        callback(res);
      });
      subscriptionRef.current?.add(sub);
      return sub;
    },
    [eventEmitter],
  );

  const removeAll = React.useCallback(() => {
    subscriptionRef.current?.unsubscribe();
  }, []);

  React.useEffect(() => {
    console.log('init event emitter');
    subscriptionRef.current = new Subscription();
    return () => {
      console.log('destroy event emitter');
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  return [eventEmitter, { on, removeAll }];
}
