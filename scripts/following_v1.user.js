// ==UserScript==
// @name         Lichess Show Followed in Lobby
// @namespace    https://example.com
// @version      1.0
// @description  Shows "(F)" next to users that you follow
// @match        https://lichess.org/*
// @connect      lichess.org
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const AUTH_TOKEN = 'lip_............'; // << PUT YOUR AUTH TOKEN HERE
    const LABEL_EVERYWHERE = false;
    const MARKER_CLASS = 'lichess-follow-marker';
    const PROCESSED_ATTR = 'data-follow-processed';
    const DEBOUNCE_DELAY = 100;

    // Configurable DOM selectors
    const SELECTORS = {
        everywhere: '.hook.join td .ulink, .ulink.ulpt',
        firstOnly: '.hook.join td:first-child .ulink, .ulink.ulpt'
    };

    let followedUsers = new Set();
    let observer = null;
    let debouncing = false;

    // Extract username from element using various possible sources
    function extractUsername(element) {
        if (element.dataset?.href) {
            return element.dataset.href.replace(/^\/@\//, '').toLowerCase();
        }
        if (element.href) {
            return element.href.replace(/^.*\/@\//, '').toLowerCase();
        }
        return (element.textContent || '').trim().toLowerCase();
    }

    // Create the (F) marker element
    function createMarker() {
        const marker = document.createElement('span');
        marker.classList.add(MARKER_CLASS);
        marker.style.color = 'gold';
        marker.style.marginLeft = '4px';
        marker.textContent = '(F)';
        return marker;
    }

    // Handle a single user element
    function handleUserElement(element) {
        if (element.hasAttribute(PROCESSED_ATTR)) return;

        const userName = extractUsername(element);
        if (!userName || !followedUsers.has(userName)) return;

        // Mark as processed and ensure no duplicate markers
        element.setAttribute(PROCESSED_ATTR, 'true');
        element.querySelectorAll(`.${MARKER_CLASS}`).forEach(m => m.remove());
        element.appendChild(createMarker());
    }

    // Scan the lobby for user elements
    function rescanLobby() {
        if (!followedUsers.size) return;

        const selector = LABEL_EVERYWHERE ? SELECTORS.everywhere : SELECTORS.firstOnly;
        document.querySelectorAll(selector).forEach(handleUserElement);
    }

    // Debounced rescan scheduler
    function scheduleRescan() {
        if (debouncing) return;
        
        debouncing = true;
        setTimeout(() => {
            debouncing = false;
            rescanLobby();
        }, DEBOUNCE_DELAY);
    }

    // DOM mutation handler
    function onDomMutations(mutationList) {
        const hasRelevantChanges = mutationList.some(mutation => 
            mutation.type === 'childList' &&
            Array.from(mutation.addedNodes).some(node =>
                node.nodeType === 1 && // Element node
                (node.classList?.contains('hook') ||
                 node.classList?.contains('ulink') ||
                 node.querySelector?.('.hook, .ulink'))
            )
        );

        if (hasRelevantChanges) {
            scheduleRescan();
        }
    }

    // Initialize the observer
    function startObserving() {
        rescanLobby();
        observer = new MutationObserver(onDomMutations);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize: fetch followed users then start observing
    fetch('https://lichess.org/api/rel/following', {
        method: 'GET',
        headers: {
            'Accept': 'application/x-ndjson',
            'Authorization': 'Bearer ' + AUTH_TOKEN
        }
    })
    .then(async (resp) => {
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status} from /api/rel/following`);
        }

        const lines = (await resp.text()).trim().split('\n');
        for (const line of lines) {
            try {
                const { username } = JSON.parse(line);
                if (username) {
                    followedUsers.add(username.toLowerCase());
                }
            } catch (err) {
                console.warn('[Lichess-Follow] Parse error:', err);
            }
        }

        startObserving();
    })
    .catch(err => {
        console.error('[Lichess-Follow] Could not fetch followed list:', err);
    });

})();
