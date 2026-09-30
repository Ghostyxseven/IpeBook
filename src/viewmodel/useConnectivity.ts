import { useEffect, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

/** `null` significa "ainda não sabemos"; só avisamos quando a falta de conexão é confirmada. */
export function isOffline(state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>) {
  return state.isConnected === false || state.isInternetReachable === false;
}

export function useConnectivity() {
  const [offline, setOffline] = useState(false);
  const [checking, setChecking] = useState(false);
  useEffect(() => NetInfo.addEventListener((state) => setOffline(isOffline(state))), []);
  return {
    offline,
    checking,
    retry: async () => {
      setChecking(true);
      try {
        setOffline(isOffline(await NetInfo.refresh()));
      } finally {
        setChecking(false);
      }
    },
  };
}
