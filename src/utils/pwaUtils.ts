const STORAGE_KEY = "pwa-install-prompt";
const INITIAL_DELAY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_DELAY = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface PromptState {
  dismissed: boolean;
  dismissCount: number;
  lastDismissed: number;
  permanentlyDismissed: boolean;
}

export function getPromptState(): PromptState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function savePromptState(state: PromptState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function shouldShowInstallPrompt(): boolean {
  const state = getPromptState();

  if (!state) return true;
  if (state.permanentlyDismissed) return false;

  const delay = Math.min(
    INITIAL_DELAY * Math.pow(2, state.dismissCount),
    MAX_DELAY
  );
  const timeSinceLastDismiss = Date.now() - state.lastDismissed;

  return timeSinceLastDismiss >= delay;
}

export function markAppInstalled(): void {
  const state: PromptState = {
    dismissed: true,
    dismissCount: 0,
    lastDismissed: Date.now(),
    permanentlyDismissed: true,
  };
  savePromptState(state);
}
