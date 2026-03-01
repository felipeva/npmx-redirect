import { enabledItem, excludedSitesItem } from '@/lib/storage';

const REDIRECT_RULE_ID = 1;

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => syncRedirectRule());
  browser.runtime.onStartup.addListener(() => syncRedirectRule());
  enabledItem.watch(() => syncRedirectRule());
  excludedSitesItem.watch(() => syncRedirectRule());

  syncRedirectRule();
});

/**
 * Extract a plain domain from an exclusion pattern so it can be used
 * as an `excludedInitiatorDomains` entry in the redirect rule.
 *
 * Returns `null` for keyword patterns (no dots) that can't map to a domain.
 */
function extractDomain(pattern: string): string | null {
  // Strip path portion (e.g. "example.com/docs" → "example.com")
  const slashIdx = pattern.indexOf('/');
  const hostPart = slashIdx === -1 ? pattern : pattern.slice(0, slashIdx);

  if (hostPart.startsWith('*.')) return hostPart.slice(2);
  if (hostPart.startsWith('.')) return hostPart.slice(1);

  // Keyword patterns (no dots) can't be expressed as a domain
  if (!hostPart.includes('.')) return null;

  return hostPart;
}

async function syncRedirectRule() {
  const enabled = await enabledItem.getValue();
  const excluded = await excludedSitesItem.getValue();

  if (!enabled) {
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [REDIRECT_RULE_ID],
    });
    return;
  }

  // Build excludedInitiatorDomains from the exclusion list so the redirect
  // rule doesn't fire when the user clicks a link FROM an excluded page.
  const excludedDomains = excluded
    .map((s) => extractDomain(s.hostname))
    .filter((d): d is string => d !== null);

  const condition: chrome.declarativeNetRequest.RuleCondition = {
    regexFilter: '^https?://(?:www\\.)?npmjs\\.com/package/(.*)',
    resourceTypes: ['main_frame' as chrome.declarativeNetRequest.ResourceType],
  };

  if (excludedDomains.length > 0) {
    condition.excludedInitiatorDomains = excludedDomains;
  }

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [REDIRECT_RULE_ID],
    addRules: [
      {
        id: REDIRECT_RULE_ID,
        priority: 1,
        action: {
          type: 'redirect' as chrome.declarativeNetRequest.RuleActionType,
          redirect: {
            regexSubstitution: 'https://npmx.dev/package/\\1',
          },
        },
        condition,
      },
    ],
  });
}
