import router from '@/router';

/**
 * Checks if the click event requested opening in a new tab:
 * - Ctrl key pressed (Windows / Linux)
 * - Meta key pressed (Command on Mac)
 * - Middle click (button === 1 or which === 2)
 * Falls back to window.event if event object was omitted in template call.
 */
export function isNewTabEvent(event) {
  const evt = event || (typeof window !== 'undefined' ? window.event : null);
  if (!evt) return false;
  return Boolean(
    evt.ctrlKey ||
    evt.metaKey ||
    evt.button === 1 ||
    evt.which === 2
  );
}

/**
 * Opens a URL in a new tab and focuses it.
 *
 * @param {string} url - The URL to open in a new tab
 */
export function openInNewTab(url) {
  if (typeof window === 'undefined' || !url) return;

  let fullUrl = url;
  try {
    fullUrl = new URL(url, window.location.origin).href;
  } catch (e) {
    fullUrl = url;
  }

  const newTab = window.open(fullUrl, '_blank');
  if (newTab && typeof newTab.focus === 'function') {
    try {
      newTab.focus();
    } catch (e) {
      // ignore
    }
  }
  return newTab;
}

/**
 * Safely extracts an account number from string, number, or object.
 */
export function extractAccountNumber(input) {
  if (input === null || input === undefined) return '';
  // Avoid treating DOM Event objects as input
  if (typeof input === 'object' && ('target' in input || 'currentTarget' in input)) {
    return '';
  }
  if (typeof input === 'object') {
    return String(input.account_number || input.account || input.account_id || input.id || '').trim();
  }
  return String(input).trim();
}

/**
 * Safely extracts client search term (email, name, or id) from string, number, or object.
 */
export function extractClientSearch(input) {
  if (input === null || input === undefined) return '';
  if (typeof input === 'object' && ('target' in input || 'currentTarget' in input)) {
    return '';
  }
  if (typeof input === 'object') {
    return String(input.email || input.user?.email || input.search || input.client_name || input.name || input.id || '').trim();
  }
  return String(input).trim();
}

/**
 * Global function to navigate to Trading Accounts module.
 * Opens in a new active tab so the user is immediately navigated/switched
 * to the trading account search page without losing their current page state.
 *
 * @param {string|number|object} accountNumber
 * @param {MouseEvent} [event]
 */
export function goToTradingAccount(accountNumber, event) {
  // Argument swap guard if called like (event, accountNumber)
  if (accountNumber && typeof accountNumber === 'object' && ('target' in accountNumber || 'currentTarget' in accountNumber)) {
    const temp = accountNumber;
    accountNumber = event;
    event = temp;
  }

  const account = extractAccountNumber(accountNumber);
  if (!account) return;

  const evt = event || (typeof window !== 'undefined' ? window.event : null);
  if (evt && typeof evt.preventDefault === 'function') {
    evt.preventDefault();
  }
  if (evt && typeof evt.stopPropagation === 'function') {
    evt.stopPropagation();
  }

  const routeData = router.resolve({
    path: '/trading-accounts',
    query: { search: account },
  });

  openInNewTab(routeData.href);
}

/**
 * Global function to navigate to Clients module.
 * Opens in a new active tab so the user is immediately navigated/switched
 * to the clients search page without losing their current page state.
 *
 * @param {string|object} emailOrSearch
 * @param {MouseEvent} [event]
 */
export function goToClient(emailOrSearch, event) {
  // Argument swap guard if called like (event, emailOrSearch)
  if (emailOrSearch && typeof emailOrSearch === 'object' && ('target' in emailOrSearch || 'currentTarget' in emailOrSearch)) {
    const temp = emailOrSearch;
    emailOrSearch = event;
    event = temp;
  }

  const target = extractClientSearch(emailOrSearch);
  if (!target) return;

  const evt = event || (typeof window !== 'undefined' ? window.event : null);
  if (evt && typeof evt.preventDefault === 'function') {
    evt.preventDefault();
  }
  if (evt && typeof evt.stopPropagation === 'function') {
    evt.stopPropagation();
  }

  const routeData = router.resolve({
    path: '/clients',
    query: { search: target },
  });

  openInNewTab(routeData.href);
}

export function useNavigation() {
  return {
    goToTradingAccount,
    goToClient,
    openInNewTab,
    isNewTabEvent,
  };
}

export default useNavigation;
