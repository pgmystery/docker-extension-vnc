import { useCallback, useMemo } from 'react'


export default function useInputDevices() {
  const getInputDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    if (!navigator?.mediaDevices?.enumerateDevices) {
      return [];
    }

    // Some browsers only provide device labels after permissions are granted.
    // We try a lightweight permission request if we don't have an active stream.
    if (navigator.mediaDevices.getUserMedia) {
      try {
        const tmp = await navigator.mediaDevices.getUserMedia({ audio: true });

        tmp.getTracks().forEach(t => t.stop());
      } catch {
        // ignore
      }
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === 'audioinput');
  }, []);

  return useMemo(() => ({
    getInputDevices,
  }), [])
}
