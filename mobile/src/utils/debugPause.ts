// utils/debugPause.ts
let globalResolve: (() => void) | null = null;

export function triggerTerminalResume() {
  if (globalResolve) {
    globalResolve();
    globalResolve = null;
  }
}

export function useDebugPause() {
  const pauseDebug = (info: any): Promise<void> => {
    // Prints only the raw object passed to it and a simple step over instruction
    console.log('\n--- PAUSED ---');
    console.log(JSON.stringify(info, null, 2));
    console.log('👉 Tap [STEP OVER ⏭️] on your device to continue.');
    console.log('--------------\n');

    return new Promise<void>((resolve) => {
      globalResolve = resolve;
    });
  };

  return { pauseDebug };
}