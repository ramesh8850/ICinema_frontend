/**
 * Polyfill for SockJS and other libraries expecting Node.js 'global'
 */
(window as any).global = window;
