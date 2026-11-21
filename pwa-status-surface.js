(() => {
  if (navigator.standalone !== true && !window.matchMedia('(display-mode: standalone)').matches) return;
  if (!CSS.supports('-webkit-touch-callout', 'none') || !CSS.supports('-webkit-background-clip', 'text')) return;
  if (document.querySelector('.proto-pwa-status-surface, .docs-pwa-status-surface')) return;
  const surface = document.createElement('div');
  surface.className = 'proto-pwa-status-surface';
  surface.setAttribute('aria-hidden', 'true');
  surface.style.cssText = 'position:fixed;inset:0 0 auto;height:11px;z-index:2147483647;background-color:inherit;-webkit-background-clip:text;background-clip:text;pointer-events:none';
  document.body.append(surface);
})();
