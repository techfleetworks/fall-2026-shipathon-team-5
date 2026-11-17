import { renderCard } from '@/utils/card';
import { RESULT_MESSAGE, type ResultMessage } from '@/utils/types';

// Right-click flow for any site. Not injected into every page: the background worker
// injects it only after the user picks "Check with Veritas" (see background.ts).
export default defineContentScript({
  registration: 'runtime',
  main() {
    const w = window as unknown as { __veritasLoaded?: boolean; __veritasSocial?: boolean };
    // Already injected, or a social-site script is drawing cards on this page.
    if (w.__veritasLoaded || w.__veritasSocial) return;
    w.__veritasLoaded = true;

    browser.runtime.onMessage.addListener((msg: ResultMessage) => {
      if (msg?.type !== RESULT_MESSAGE) return;
      const img = [...document.images].find(
        (i) => i.currentSrc === msg.state.srcUrl || i.src === msg.state.srcUrl,
      );
      renderCard(msg.state, img);
    });
  },
});
