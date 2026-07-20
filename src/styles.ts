export function injectNeuralGardenStyles(): void {
  const styleId = "neural-garden-style";
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .neural-garden-home {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 0 24px;
    }
    .neural-garden-home > h2 {
      text-align: center;
      margin: 0;
    }
    .ng-categories {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ng-category-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .ng-weekly-recap-row {
      width: min(420px, 100%);
      align-self: center;
    }
    .ng-search,
    .ng-task-manager {
      background: transparent;
    }
    .ng-search {
      margin-top: 7px;
    }
    .ng-search h3 {
      margin: 0 0 4px;
      color: var(--text-normal);
    }
    .ng-search-results {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-height: 24px;
    }
    .ng-search-row {
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid var(--background-modifier-border);
      cursor: pointer;
    }
    .ng-search-row:hover {
      border-color: #ec9a63;
    }
    .ng-search-title {
      font-weight: 600;
    }
    .ng-search-path {
      font-size: 12px;
      color: var(--text-muted);
    }
    .ng-task-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .ng-task-heading h3 {
      margin: 0;
      color: var(--text-normal);
      font-size: 1.1rem;
      font-weight: 600;
    }
    .ng-overdrive-button {
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid;
      background: transparent;
      cursor: pointer;
    }
    .ng-overdrive-button.is-active {
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.3);
      background: rgba(0, 240, 255, 0.1);
    }
    .ng-overdrive-button.is-inactive {
      filter: saturate(0.6) brightness(0.8);
    }
    .ng-task-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px;
      border-radius: 10px;
      border: 2px solid rgba(236, 154, 99, 0.6);
      background-color: rgba(0, 0, 0, 0.02);
    }
    .ng-task-input {
      border: 1px solid var(--background-modifier-border);
      background-color: var(--background-primary);
      color: var(--text-normal);
      border-radius: 8px;
      padding: 8px;
      width: 100%;
    }
    .ng-inline-input {
      padding: 4px 6px;
    }
    .ng-effort-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .ng-effort-label {
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1;
    }
    .ng-progress-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      width: clamp(132px, 30%, 204px);
      margin-left: auto;
    }
    .ng-progress {
      position: relative;
      height: 12px;
      border-radius: 999px;
      width: 100%;
      background: var(--background-modifier-border);
      overflow: hidden;
    }
    .ng-progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 250ms ease;
      animation: ng-energy-flow 2.2s linear infinite;
    }
    .ng-warning {
      color: #f8b719;
      font-size: 16px;
      line-height: 1;
    }
    .ng-effort-buttons {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 6px;
    }
    .ng-effort-button {
      border: 1px solid;
      border-radius: 999px;
      background: transparent;
      padding: 6px 10px;
      cursor: pointer;
      transition: background-color 200ms ease, transform 120ms ease;
      width: 100%;
      color: var(--text-normal);
    }
    .ng-effort-button:hover {
      border-color: var(--ng-btn-active);
      background: var(--ng-btn-hover-bg);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-btn-active) 40%, transparent);
    }
    .ng-effort-button.is-pulsing {
      animation: ng-pulse 450ms ease;
    }
    .ng-effort-button.is-shaking {
      animation: ng-shake 250ms ease;
    }
    .ng-task-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }
    .ng-task-row {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto auto;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 10px;
      transition: background-color 250ms ease, opacity 300ms ease, transform 300ms ease;
    }
    .ng-task-row:hover {
      background: color-mix(in srgb, var(--background-modifier-hover) 85%, transparent);
    }
    .ng-task-row.ng-row-disappearing {
      animation: ng-fade-out 720ms ease forwards;
    }
    .ng-task-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ng-badge-wrap {
      position: relative;
    }
    .ng-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 70px;
      padding: 2px 6px;
      border: 1px solid;
      background: transparent;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
      white-space: nowrap;
      flex-shrink: 0;
      opacity: 0.95;
    }
    .ng-row-button {
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      padding: 4px 8px;
      background: transparent;
      cursor: pointer;
    }
    .ng-edit {
      border: none !important;
      background: transparent !important;
      color: color-mix(in srgb, var(--text-normal) 64%, black);
      font-size: 0.8em;
      padding: 2px 4px;
      box-shadow: none !important;
      appearance: none;
    }
    .ng-edit:hover,
    .ng-edit:focus,
    .ng-edit:active {
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    .ng-delete {
      color: color-mix(in srgb, #ff6565 64%, black);
      border: none !important;
      background: transparent !important;
      padding: 4px 2px;
      cursor: pointer;
      font-weight: 700;
      line-height: 1;
      font-size: 0.8em;
      box-shadow: none !important;
      appearance: none;
    }
    .ng-delete:hover,
    .ng-delete:focus,
    .ng-delete:active {
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    .ng-break-panel {
      padding: 16px;
      border-radius: 10px;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .ng-break-panel h4 {
      margin: 0;
      color: var(--text-normal);
      font-size: 1.43rem;
      font-weight: 600;
    }
    .ng-break-button {
      border: 1px solid #ec9a63;
      border-radius: 10px;
      padding: 17px 29px;
      background: transparent;
      cursor: pointer;
    }
    .ng-break-intro-title,
    .ng-break-intro-copy,
    .ng-break-intro-button {
      opacity: 0;
      animation-fill-mode: forwards;
    }
    .ng-break-intro-title {
      animation: ng-break-intro-fade 1s ease-out forwards;
    }
    .ng-break-intro-copy {
      animation: ng-break-intro-fade 2s ease-out 1s forwards;
    }
    .ng-break-intro-button {
      animation: ng-break-intro-fade 1s ease-out 2.1s forwards;
    }
    .ng-break-timer {
      font-size: 38px;
      line-height: 1;
      font-weight: 700;
    }
    .ng-break-copy {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.97em;
    }
    .ng-break-copy-animated {
      animation: ng-break-message 12s ease-out;
      font-size: 0.97em;
      color: color-mix(in srgb, var(--text-normal) 88%, white);
      font-weight: 600;
    }
    .ng-resting {
      filter: saturate(0.1);
    }
    .ng-overdrive {
      --ng-accent: #00F0FF;
    }
    .ng-overdrive .ng-task-form,
    .ng-overdrive .ng-task-row,
    .ng-overdrive .ng-search-row,
    .ng-overdrive .ng-break-panel {
      border-color: rgba(0, 240, 255, 0.6);
    }
    .ng-break-locked .ng-task-form {
      opacity: 0.9;
    }
    .ng-empty {
      color: var(--text-muted);
      font-size: 1rem;
      text-align: center;
      font-style: italic;
      padding: 8px 0;
    }
    .ng-task-empty {
      font-size: 0.96rem;
    }
    @keyframes ng-energy-flow {
      from { background-position: 0% 50%; }
      to { background-position: 200% 50%; }
    }
    @keyframes ng-pulse {
      0% { background-color: transparent; }
      25% { background-color: rgba(255, 255, 255, 0.24); }
      100% { background-color: transparent; }
    }
    @keyframes ng-shake {
      0% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
      100% { transform: translateX(0); }
    }
    @keyframes ng-fade-out {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-6px); }
    }
    @keyframes ng-break-intro-fade {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes ng-break-message {
      0% { opacity: 0; }
      25% { opacity: 1; }
      75% { opacity: 1; }
      100% { opacity: 0; }
    }
    @media (max-width: 680px) {
      .ng-category-grid {
        grid-template-columns: 1fr;
      }
      .ng-task-row {
        grid-template-columns: minmax(0, 1fr) auto;
        grid-auto-rows: auto;
      }
      .ng-effort-buttons {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}
