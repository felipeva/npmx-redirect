import { enabledItem, excludedSitesItem } from '@/lib/storage';
import { matchesPattern } from '@/lib/match-pattern';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  async main() {
    let observer: MutationObserver | null = null;

    const NPMJS_PATTERN = /^https?:\/\/(www\.)?npmjs\.com\/package\//;
    const NPMX_PATTERN = /^https:\/\/npmx\.dev\/package\//;

    function activate() {
      if (observer) return;
      rewriteNpmLinks();
      observer = new MutationObserver(() => rewriteNpmLinks());
      observer.observe(document.body, { childList: true, subtree: true });
    }

    function deactivate() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      revertNpmLinks();
    }

    function rewriteNpmLinks() {
      const links = document.querySelectorAll<HTMLAnchorElement>('a[href*="npmjs.com/package/"]');
      for (const link of links) {
        if (NPMJS_PATTERN.test(link.href)) {
          link.href = link.href.replace(NPMJS_PATTERN, 'https://npmx.dev/package/');
        }
      }
    }

    function revertNpmLinks() {
      const links = document.querySelectorAll<HTMLAnchorElement>('a[href*="npmx.dev/package/"]');
      for (const link of links) {
        if (NPMX_PATTERN.test(link.href)) {
          link.href = link.href.replace(NPMX_PATTERN, 'https://www.npmjs.com/package/');
        }
      }
    }

    async function sync() {
      const enabled = await enabledItem.getValue();
      const excluded = await excludedSitesItem.getValue();
      const { hostname, pathname } = location;
      const isExcluded = excluded.some((s) => matchesPattern(hostname, pathname, s.hostname));

      if (enabled && !isExcluded) {
        activate();
      } else {
        deactivate();
      }
    }

    enabledItem.watch(() => sync());
    excludedSitesItem.watch(() => sync());

    await sync();
  },
});
