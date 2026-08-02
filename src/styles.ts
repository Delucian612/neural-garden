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
    .ng-weekly-available-hint {
      text-align: center;
      color: #00f0ff;
      font-size: 0.92rem;
      letter-spacing: 0.02em;
      margin-bottom: 2px;
    }
    .ng-weekly-recap-row {
      width: min(420px, 100%);
      align-self: center;
    }
    .ng-search,
    .ng-task-manager {
      background: transparent;
    }
    .ng-home-support {
      border-top: 1px solid color-mix(in srgb, var(--background-modifier-border) 78%, transparent);
      margin-top: 10px;
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ng-home-hints-strip {
      margin-top: 4px;
      margin-bottom: -8px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 46px;
    }
    .ng-home-support h3 {
      margin: 0;
      text-align: center;
      color: var(--text-normal);
    }
    .ng-home-support-heading {
      text-align: center !important;
      color: var(--text-normal) !important;
      font-size: 1.3em;
    }
    .ng-home-support-copy {
      font-size: 0.86rem;
      color: var(--text-muted);
      text-align: center;
      font-style: italic;
    }
    .ng-home-support-notes {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
    }
    .ng-home-support-note {
      border: none;
      border-radius: 9px;
      padding: 8px 10px;
      cursor: pointer;
      transition: color 180ms ease;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      width: fit-content;
      min-width: 220px;
      max-width: min(100%, 560px);
      font-size: 1.3em;
      line-height: 1.32;
      color: color-mix(in srgb, #39e05a 56%, var(--text-normal));
    }
    .ng-home-support-note:hover {
      background: transparent;
      color: color-mix(in srgb, #39e05a 88%, var(--text-normal));
    }
    .ng-home-support-hint {
      opacity: 0;
      min-height: 42px;
      padding: 8px 10px;
      font-style: italic;
      transition: opacity 2200ms ease;
      color: var(--text-normal);
      text-align: center;
      font-size: 1.3em;
    }
    .ng-home-support-hint.is-visible {
      opacity: 1;
    }
    .ng-weekly-overlay {
      margin: 12px auto;
      width: min(660px, 100%);
      display: flex;
      justify-content: center;
      pointer-events: none;
    }
    .ng-weekly-overlay-card {
      width: 100%;
      border: 1px solid color-mix(in srgb, #00f0ff 48%, var(--background-modifier-border));
      border-radius: 12px;
      padding: 18px 18px 16px;
      background: color-mix(in srgb, var(--background-primary) 90%, transparent);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
    }
    .ng-weekly-overlay-title {
      margin: 0;
      opacity: 0;
      animation: ng-fade-in-slow 600ms ease forwards;
    }
    .ng-weekly-overlay-generate {
      border: none !important;
      background: transparent !important;
      color: var(--text-normal);
      box-shadow: none !important;
      cursor: pointer;
      font-size: 0.98rem;
      transition: color 140ms ease;
    }
    .ng-weekly-overlay-generate:hover {
      color: #00f0ff;
    }
    .ng-weekly-breath-label,
    .ng-weekly-breath-count {
      opacity: 1;
      transition: opacity 1200ms ease;
    }
    .ng-weekly-breath-label {
      font-size: 1.1rem;
    }
    .ng-weekly-breath-count {
      font-size: 1.6rem;
      line-height: 1;
    }
    .ng-weekly-breath-label.is-fading,
    .ng-weekly-breath-count.is-fading {
      opacity: 0;
    }
    .ng-weekly-view {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0 24px;
    }
    .ng-weekly-intro h3 {
      margin: 0;
      text-align: center;
      font-size: 1.46rem;
      color: var(--text-normal);
    }
    .ng-weekly-intro-subtitle {
      margin-top: 2px;
      text-align: center;
      font-size: 1.02rem;
      font-style: italic;
      color: var(--text-muted);
    }
    .ng-weekly-section {
      border: 1px solid var(--background-modifier-border);
      border-radius: 12px;
      padding: 12px;
      background: color-mix(in srgb, var(--background-primary) 15%, transparent);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: opacity 840ms ease, transform 840ms ease;
    }
    .ng-weekly-section.ng-weekly-scroll-hidden {
      opacity: 0;
      transform: translateY(10px);
    }
    .ng-weekly-section.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .ng-weekly-section h4 {
      margin: 0;
      text-align: center;
      color: var(--text-normal);
      font-size: 1.3rem;
    }
    .ng-weekly-section-heading {
      letter-spacing: 0.01em;
    }
    .ng-weekly-section.is-hidden,
    .ng-weekly-symptom.is-hidden,
    .ng-weekly-fragment-hidden {
      opacity: 0;
      transform: translateY(6px);
    }
    .ng-weekly-symptom {
      display: grid;
      gap: 4px;
      transition: opacity 840ms ease, transform 840ms ease;
    }
    .ng-weekly-symptom .ng-journal-progress {
      transition: opacity 1200ms ease, transform 1200ms ease;
    }
    .ng-weekly-symptom .ng-journal-metric-label {
      transition: opacity 1100ms ease, transform 1100ms ease;
    }
    .ng-weekly-view .ng-journal-progress-fill {
      transition: width 1200ms ease, background-color 700ms ease;
    }
    .ng-weekly-symptom-copy,
    .ng-weekly-inline-copy {
      font-size: 0.92rem;
      color: var(--text-muted);
      text-align: center;
      transition: opacity 850ms ease, transform 850ms ease;
    }
    .ng-weekly-symptom-copy {
      transition: opacity 1200ms ease, transform 1200ms ease;
    }
    .ng-weekly-fragment-hidden {
      pointer-events: none;
    }
    .ng-weekly-emotion-counters {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .ng-weekly-emotion-counters-sep {
      opacity: 0.7;
      margin: 0 3px;
    }
    .ng-weekly-emotion-cloud {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      min-height: 88px;
    }
    .ng-weekly-emotion-balance {
      position: relative;
      height: 12px;
      border-radius: 999px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, #ff6565 70%, transparent) 0%,
        color-mix(in srgb, #ff6565 24%, transparent) 50%,
        color-mix(in srgb, #39e05a 24%, transparent) 50%,
        color-mix(in srgb, #39e05a 70%, transparent) 100%
      );
      overflow: hidden;
      margin-bottom: 4px;
    }
    .ng-weekly-emotion-pointer {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--text-normal);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--background-primary) 72%, transparent);
    }
    .ng-weekly-emotion-token {
      display: inline-flex;
      align-items: center;
      line-height: 1;
      white-space: nowrap;
      border-radius: 999px;
      padding: 6px 10px;
      transition: opacity 900ms ease, transform 900ms cubic-bezier(0.15, 1.35, 0.25, 1);
      animation-name: ng-weekly-float;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease-in-out;
      transform-origin: center;
    }
    .ng-weekly-emotion-token.is-negative {
      color: color-mix(in srgb, #ff6565 80%, var(--text-normal));
      background: color-mix(in srgb, #ff6565 14%, transparent);
      border: 1px solid color-mix(in srgb, #ff6565 28%, transparent);
    }
    .ng-weekly-emotion-token.is-positive {
      color: color-mix(in srgb, #39e05a 82%, var(--text-normal));
      background: color-mix(in srgb, #39e05a 14%, transparent);
      border: 1px solid color-mix(in srgb, #39e05a 28%, transparent);
    }
    .ng-weekly-tracker-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      border-radius: 8px;
      padding: 6px 8px;
      background: color-mix(in srgb, var(--background-primary) 25%, transparent);
    }
    .ng-weekly-tracker-cloud {
      min-height: 58px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      align-items: center;
    }
    .ng-weekly-tracker-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 5px 7px;
      border: 1px solid color-mix(in srgb, #ec9a63 40%, var(--background-modifier-border));
      background: color-mix(in srgb, #ec9a63 11%, transparent);
      color: var(--text-normal);
      animation-name: ng-weekly-float;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease-in-out;
      transition: opacity 900ms ease, transform 900ms cubic-bezier(0.15, 1.35, 0.25, 1);
      transform-origin: center;
    }
    .ng-weekly-tracker-pill.ng-weekly-fragment-hidden,
    .ng-weekly-emotion-token.ng-weekly-fragment-hidden {
      transform: scale(0.62) translateY(10px);
    }
    .ng-weekly-tracker-pill.is-winner {
      box-shadow: 0 0 0 1px color-mix(in srgb, #f5d742 60%, transparent), 0 0 18px color-mix(in srgb, #f5d742 25%, transparent);
      background: color-mix(in srgb, #f5d742 12%, transparent);
    }
    .ng-weekly-tracker-row.is-winner {
      box-shadow: 0 0 0 1px color-mix(in srgb, #f5d742 60%, transparent), 0 0 18px color-mix(in srgb, #f5d742 25%, transparent);
    }
    .ng-weekly-tracker-count {
      color: #ec9a63;
      font-weight: 700;
    }
    .ng-weekly-support-chip {
      border: 1px solid color-mix(in srgb, #39e05a 45%, var(--background-modifier-border));
      border-radius: 999px;
      padding: 6px 10px;
      text-align: center;
      color: color-mix(in srgb, #39e05a 65%, var(--text-normal));
    }
    .ng-weekly-support-link {
      all: unset;
      appearance: none;
      -webkit-appearance: none;
      color: #8fcf9d;
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1.3;
      text-decoration: none;
      padding: 0;
      margin: 0;
      font-weight: 500;
      display: inline;
    }
    .ng-weekly-support-link:hover {
      color: #47fc82;
    }
    .ng-weekly-support-link:focus,
    .ng-weekly-support-link:focus-visible {
      outline: none !important;
      box-shadow: none !important;
    }
    .ng-weekly-support-intro {
      transition: opacity 1700ms ease, transform 1700ms ease;
    }
    .ng-weekly-support-reason {
      color: #FF6565;
    }
    .ng-weekly-critical-section,
    .ng-weekly-highlights-section {
      gap: 10px;
    }
    .ng-weekly-critical-day,
    .ng-weekly-highlight {
      display: grid;
      justify-items: center;
      gap: 4px;
      padding: 8px 4px;
      transition: opacity 900ms ease, transform 900ms ease;
    }
    .ng-weekly-critical-date,
    .ng-weekly-highlight-day {
      color: var(--text-normal);
      font-size: 1.2em;
      font-weight: 600;
      text-align: center;
    }
    .ng-weekly-critical-symptom {
      color: color-mix(in srgb, #ff6565 82%, var(--text-normal));
    }
    .ng-weekly-highlight-text {
      color: color-mix(in srgb, #39e05a 78%, var(--text-normal));
    }
    .ng-weekly-critical-symptoms {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 5px;
    }
    .ng-weekly-critical-symptom {
      font-size: 0.85rem;
    }
    .ng-weekly-critical-symptom + .ng-weekly-critical-symptom::before {
      content: "·";
      margin-right: 5px;
    }
    .ng-weekly-highlights-subtext {
      font-style: italic;
    }
    .ng-weekly-highlight-text {
      text-align: center;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
    .ng-weekly-next-tasks {
      display: grid;
      gap: 7px;
    }
    .ng-weekly-next-task-row {
      display: grid;
      grid-template-columns: minmax(140px, 0.8fr) minmax(260px, 1.2fr) 24px;
      align-items: center;
      gap: 8px;
    }
    .ng-weekly-next-task-input {
      min-width: 0;
      width: 100%;
      padding: 7px 9px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      background: transparent !important;
      box-shadow: none !important;
    }
    .ng-weekly-task-efforts {
      flex-wrap: nowrap;
      min-width: 0;
      gap: 3px;
    }
    .ng-weekly-task-effort {
      flex: 1 1 0;
      min-width: 0;
      padding: 4px 5px;
      white-space: nowrap;
    }
    .ng-weekly-task-effort.is-active {
      border-color: var(--ng-task-effort-color);
      background: color-mix(in srgb, var(--ng-task-effort-color) 16%, transparent);
      color: var(--ng-task-effort-color);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-task-effort-color) 24%, transparent);
    }
    .ng-weekly-task-delete {
      display: grid;
      width: 24px;
      height: 24px;
      padding: 0;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      color: color-mix(in srgb, #ff6565 72%, var(--text-normal));
      cursor: pointer;
      place-items: center;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .ng-weekly-task-delete:hover,
    .ng-weekly-task-delete:focus-visible {
      color: #ff6565;
      outline: none;
    }
    .ng-weekly-next-task-input:focus,
    .ng-weekly-next-task-input:focus-visible {
      border-color: color-mix(in srgb, var(--background-modifier-border) 65%, var(--text-normal) 35%) !important;
      box-shadow: none !important;
      outline: none;
    }
    @media (max-width: 520px) {
      .ng-weekly-next-task-row {
        grid-template-columns: 1fr;
      }
      .ng-weekly-next-task-input {
        width: 100%;
      }
    }
    .ng-weekly-task-status {
      display: flex;
      justify-content: center;
      gap: 3px;
    }
    .ng-weekly-task-status-value {
      font-weight: 700;
      text-transform: capitalize;
    }
    .ng-weekly-task-status-value.is-increased {
      color: color-mix(in srgb, #ec9a63 60%, var(--text-normal));
    }
    .ng-weekly-task-status-value.is-decreased {
      color: color-mix(in srgb, #ec9a63 60%, var(--text-normal));
    }
    .ng-weekly-task-status-value.is-unchanged {
      color: inherit;
      font-weight: 600;
    }
    .ng-weekly-task-status-value.is-at-max {
      color: #00F0FF;
      font-weight: 700;
    }
    .ng-weekly-support-row {
      display: grid;
      gap: 4px;
      justify-items: center;
      padding: 4px 0;
      transition: opacity 640ms ease, transform 640ms ease;
    }
    .ng-weekly-preview-card {
      margin-top: 4px;
    }
    .ng-weekly-preview-emotions {
      margin-top: 8px;
    }
    .ng-weekly-preview-tracker-cloud {
      margin-top: 14px;
      margin-bottom: 6px;
      gap: 6px;
    }
    .ng-weekly-preview-pill {
      padding: 5px 9px;
      font-size: 0.82rem;
      min-height: 24px;
    }
    @keyframes ng-weekly-float {
      from { transform: translateY(0px); }
      to { transform: translateY(-8px); }
    }
    @keyframes ng-fade-in-slow {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ng-search {
      margin-top: 0;
    }
    .ng-search h3 {
      margin: 0 0 4px;
      color: var(--text-normal);
      text-align: center;
    }
    .neural-garden-home .ng-search .ng-search-heading {
      font-size: 1rem;
    }
    .ng-search-heading {
      text-align: center !important;
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
    .ng-mylearning-search {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin: 0;
    }
    .ng-mylearning-search > .ng-task-input,
    .ng-mylearning-search > .ng-search-results {
      width: 60%;
      box-sizing: border-box;
    }
    .ng-mylearning-search > .ng-search-results {
      min-height: 0;
      margin-top: 0;
      gap: 0;
    }
    .ng-search-title {
      font-weight: 600;
      font-size: 0.95rem;
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
    .ng-home-category-button,
    .ng-journal-nav-button,
    .ng-journal-mode-button,
    .ng-journal-create-button {
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #ec9a63;
      background: transparent;
      font-size: 14px;
      width: 100%;
      cursor: pointer;
      color: var(--text-normal);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }
    .ng-journal-nav-button,
    .ng-journal-mode-button,
    .ng-journal-create-button {
      width: auto;
    }
    .ng-home-category-button:hover,
    .ng-journal-nav-button:hover,
    .ng-journal-mode-button:hover,
    .ng-journal-create-button:hover {
      border-color: #ffd2b0;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.25);
    }
    .ng-journal-create-button {
      width: auto;
    }
    .ng-journal-mode-button {
      width: auto;
    }
    .ng-journaling {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 14px 24px;
      max-width: 720px;
      margin: 0 auto;
    }
    .ng-journal-topbar,
    .ng-journal-daily-header {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: flex-start;
      flex-wrap: wrap;
    }
    .ng-journal-month-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      margin-top: 8px;
      margin-bottom: 8px;
    }
    .ng-journal-topbar {
      align-items: flex-start;
    }
    .ng-journal-topbar-left,
    .ng-journal-topbar-right {
      display: inline-flex;
      align-items: center;
    }
    .ng-journal-topbar-right {
      margin-left: auto;
    }
    .ng-journal-title-wrap {
      flex: 1;
      text-align: center;
    }
    .ng-journaling .ng-journal-title-wrap {
      flex-basis: 100%;
      order: 2;
      width: 100%;
      text-align: center;
      margin-top: -2px;
    }
    .ng-journaling .ng-journal-topbar {
      flex-wrap: wrap;
    }
    .ng-journal-entry-page .ng-journal-title-wrap {
      flex-basis: 100%;
      order: 2;
      width: 100%;
      text-align: center;
      margin-top: -2px;
    }
    .ng-journal-entry-page .ng-journal-topbar {
      flex-wrap: wrap;
    }
    .ng-journal-title-wrap h2,
    .ng-journal-title-wrap h3,
    .ng-journal-placeholder h3,
    .ng-journal-entry-card h3,
    .ng-journal-trackers h3,
    .ng-journal-daily-header h3 {
      margin: 0;
    }
    .ng-journal-entry-page .ng-journal-title-wrap h3 {
      color: var(--text-normal);
      text-align: center;
      font-weight: 500;
      font-size: 1.5rem;
      margin-top: 12px;
    }
    .ng-journal-entry-page .ng-journal-title-wrap h2 {
      margin-bottom: 0;
      font-size: 156%;
    }
    .ng-journal-entry-card h3 {
      color: var(--text-normal);
      margin-bottom: 12px;
    }
    .ng-journal-preview-summary {
      margin: 0 0 16px;
      text-align: center;
      color: var(--text-normal);
      font-size: 1.2rem;
      font-weight: 600;
    }
    .ng-journal-readonly-note,
    .ng-journal-metric-feedback,
    .ng-journal-metric-explain,
    .ng-journal-body-copy {
      color: var(--text-muted);
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .ng-journal-body-preview {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 10;
      line-clamp: 10;
    }
    .ng-journal-modebar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .ng-journal-mode-button.is-active {
      border-color: #ec9a63;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.18);
    }
    .ng-journal-create-button.is-highlighted {
      border-color: #00f0ff;
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.18);
    }
    .ng-journal-create-button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .ng-journal-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
      align-items: start;
    }
    .ng-journal-calendar-panel,
    .ng-journal-detail-panel,
    .ng-journal-trackers,
    .ng-journal-placeholder,
    .ng-journal-entry-card {
      border: 1px solid var(--background-modifier-border);
      border-radius: 14px;
      padding: 14px;
      background: color-mix(in srgb, var(--background-primary) 18%, transparent);
    }
    .ng-journal-calendar-panel,
    .ng-journal-detail-panel,
    .ng-journal-trackers,
    .ng-journal-entry-card {
      background: color-mix(in srgb, var(--background-primary) 12%, transparent);
    }
    .ng-journal-calendar-panel {
      width: 100%;
      padding-top: 8px;
      margin-top: 10px;
    }
    .ng-journal-calendar-header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      margin-bottom: 10px;
    }
    .ng-journal-calendar-header h3 {
      color: var(--text-normal);
      margin: 0;
      justify-self: start;
    }
    .ng-journal-month-controls {
      justify-self: center;
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      justify-content: center;
    }
    .ng-journal-month-stepper {
      all: unset;
      width: auto;
      height: auto;
      padding: 0;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0;
      background: transparent !important;
      color: var(--text-normal);
      font-size: 0.95rem;
      line-height: 1;
      display: inline;
      cursor: pointer;
      transform: translateY(-2px);
      appearance: none;
      -webkit-appearance: none;
      outline: none !important;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-month-stepper:hover,
    .ng-journal-month-stepper:focus-visible {
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      background: transparent !important;
    }
    .ng-journal-month-selector {
      justify-self: center;
      min-width: 180px;
      padding: 7px 14px;
      border-radius: 999px;
      border: 1px solid rgba(236, 154, 99, 0.5);
      background: color-mix(in srgb, var(--background-primary) 20%, transparent);
      color: var(--text-normal);
      font-size: 0.92rem;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
    }
    .ng-journal-month-selector:hover,
    .ng-journal-month-selector:focus-visible {
      border-color: #ffd2b0;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.18);
      outline: none;
    }
    .ng-journal-create-button {
      justify-self: end;
    }
    .ng-journal-month-label {
      font-size: 1.2rem;
      font-weight: 600;
      line-height: 1;
    }
    .ng-journal-trackers h3 {
      color: var(--text-normal);
    }
    .ng-journal-detail-panel {
      margin-top: 18px;
      border: none;
      border-radius: 0;
      padding: 0;
      background: transparent;
    }
    .ng-journal-calendar-grid {
      display: grid;
      grid-template-columns: minmax(54px, 62px) repeat(7, minmax(0, 1fr));
      gap: 4px 6px;
    }
    .ng-journal-calendar-weekday {
      text-align: center;
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .ng-journal-calendar-weekday {
      text-align: center;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: var(--text-muted);
      padding: 2px 0 4px;
    }
    .ng-journal-calendar-week-header {
      color: var(--text-normal);
      opacity: 0.8;
      margin-right: 10px;
    }
    .ng-journal-week-cell {
      position: relative;
      min-height: 30px;
      padding: 4px 6px;
      border-radius: 9px;
      border: 1px solid rgba(236, 154, 99, 0.45);
      background: color-mix(in srgb, var(--background-primary) 16%, transparent);
      color: var(--text-normal);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.78rem;
      font-weight: 600;
      transition: all 0.15s ease;
      margin-right: 10px;
    }
    .ng-journal-week-cell.is-available {
      border-color: #00f0ff;
      background: color-mix(in srgb, var(--background-primary) 16%, transparent);
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.18);
    }
    .ng-journal-week-cell.is-generated {
      border-color: #39e05a;
      background: color-mix(in srgb, #39e05a 10%, var(--background-primary));
      box-shadow: 0 0 0 2px rgba(57, 224, 90, 0.18);
    }
    .ng-journal-week-cell.is-available::after {
      content: "+";
      position: absolute;
      top: 1px;
      right: 3px;
      font-size: 0.94rem;
      line-height: 1;
      font-weight: 700;
      color: #00f0ff;
      opacity: 0.95;
      pointer-events: none;
    }
    .ng-journal-week-cell:hover:not(:disabled) {
      border-color: #ffd2b0;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.18);
    }
    .ng-journal-week-cell:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .ng-journal-day-cell {
      position: relative;
      min-height: 30px;
      padding: 5px 3px;
      border-radius: 8px;
      border: 1px solid rgba(236, 154, 99, 0.38);
      background: transparent;
      color: var(--text-normal);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .ng-journal-day-cell:hover {
      border-color: #ffd2b0;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.18);
    }
    .ng-journal-day-cell.is-outside-month {
      opacity: 0.35;
    }
    .ng-journal-day-cell.has-entry {
      border-color: rgba(236, 154, 99, 0.5);
      background: rgba(236, 154, 99, 0.07);
    }
    .ng-journal-day-cell.is-today {
      border-color: #0e8f9f;
      box-shadow: 0 0 0 1.4px rgba(14, 143, 159, 0.16);
    }
    .ng-journal-day-cell.is-selected {
      border-color: #00f0ff;
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.22);
    }
    .ng-journal-day-number {
      font-size: 0.76rem;
      font-weight: 600;
    }
    .ng-journal-day-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: #ec9a63;
      position: absolute;
      bottom: 4px;
      right: 4px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.14);
    }
    .ng-journal-entry-page .ng-journal-metrics {
      margin-top: 0;
    }
    .ng-journal-metric {
      display: grid;
      gap: 2px;
    }
    .ng-journal-metric-meta {
      display: grid;
      gap: 2px;
    }
    .ng-journal-metric-label,
    .ng-journal-task-heading {
      font-weight: 600;
      font-size: 1.1rem;
    }
    .ng-journal-metric-explain {
      font-size: 0.9rem;
    }
    .ng-journal-progress {
      position: relative;
      height: 24px;
      border-radius: 999px;
      width: 100%;
      background: var(--background-modifier-border);
      overflow: hidden;
      cursor: ew-resize;
      margin-bottom: 10px;
    }
    .ng-journal-progress-readonly {
      cursor: default;
    }
    .ng-journal-progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 200ms ease, background-color 220ms ease;
      width: 0;
    }
    .ng-journal-progress-thumb {
      display: none;
    }
    .ng-journal-emotions,
    .ng-journal-note-section,
    .ng-journal-tasks,
    .ng-journal-body,
    .ng-journal-meta-grid {
      margin-top: 14px;
      display: grid;
      gap: 8px;
    }
    .ng-journal-emotions,
    .ng-journal-tasks {
      margin-top: 18px;
    }
    .ng-journal-emotions h4,
    .ng-journal-tasks-header h4,
    .ng-journal-task-group h5 {
      text-align: center;
      color: var(--text-normal);
    }
    .ng-journal-emotions h4,
    .ng-journal-tasks-header h4 {
      font-size: 1.2rem;
      margin: 0;
    }
    .ng-journal-entry-page .ng-journal-emotions h4 {
      font-size: 1.56rem;
    }
    .ng-journal-entry-page .ng-journal-tasks-header h4 {
      font-size: 1.56rem;
    }
    .ng-journal-tasks-header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
    }
    .ng-journal-task-edit-button {
      position: absolute;
      right: 0;
      display: grid;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--text-muted);
      place-items: center;
    }
    .ng-journal-task-edit-button:hover {
      color: var(--text-normal);
      background: transparent !important;
      box-shadow: none !important;
    }
    .ng-journal-task-edit-button svg {
      width: 15px;
      height: 15px;
    }
    .ng-journal-task-editor {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
      align-items: center;
      padding: 7px 0;
      border: 0;
      background: transparent;
    }
    .ng-journal-task-editor > .ng-task-input,
    .ng-journal-good-thing-input {
      padding: 5px 7px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      background: transparent !important;
      box-shadow: none !important;
      font-size: 0.82rem;
    }
    .ng-journal-task-editor > .ng-task-input {
      width: min(100%, 234px);
    }
    .ng-journal-task-editor > .ng-task-input:focus,
    .ng-journal-task-editor > .ng-task-input:focus-visible,
    .ng-journal-good-thing-input:focus,
    .ng-journal-good-thing-input:focus-visible {
      border-color: color-mix(in srgb, var(--background-modifier-border) 65%, var(--text-normal) 35%) !important;
      background: transparent !important;
      box-shadow: none !important;
      outline: none;
    }
    .ng-journal-task-efforts {
      display: inline-flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px;
    }
    .ng-journal-task-effort {
      padding: 3px 7px;
      border: 1px solid color-mix(in srgb, var(--ng-task-effort-color) 45%, var(--background-modifier-border));
      border-radius: 999px;
      background: transparent;
      box-shadow: none;
      color: color-mix(in srgb, var(--ng-task-effort-color) 72%, var(--text-normal));
      font-size: 0.68rem;
    }
    .ng-journal-task-effort:hover {
      border-color: var(--ng-task-effort-color);
      background: color-mix(in srgb, var(--ng-task-effort-color) 10%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-task-effort-color) 24%, transparent);
      color: var(--ng-task-effort-color);
    }
    .ng-journal-task-delete {
      display: grid;
      width: 24px;
      height: 24px;
      padding: 0;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--text-error) !important;
      place-items: center;
    }
    .ng-journal-task-delete:hover {
      background: transparent !important;
      box-shadow: none !important;
      color: var(--text-error) !important;
    }
    .ng-journal-task-delete svg {
      width: 13px;
      height: 13px;
    }
    .ng-journal-good-thing {
      display: grid;
      justify-items: center;
      gap: 7px;
      margin-top: 18px;
    }
    .ng-journal-good-thing h4 {
      margin: 0;
      text-align: center;
      color: var(--text-normal);
      font-size: 1.56rem;
    }
    .ng-journal-good-thing-input {
      width: min(49%, 294px);
      text-align: center;
    }
    .ng-journal-good-thing-value {
      text-align: center;
      color: var(--text-muted);
    }
    .ng-journal-entry-page .ng-journal-task-group h5 {
      font-size: 1.2rem;
    }
    .ng-journal-entry-page .ng-journal-task-group + .ng-journal-task-group {
      margin-top: 20px;
    }
    .ng-journal-entry-page .ng-journal-task-badge {
      min-width: 70px;
      padding: 2px 6px;
      font-size: 0.62rem;
    }
    .ng-journal-emotion-note {
      color: var(--text-muted);
      margin-top: -4px;
      font-size: 0.92rem;
      text-align: center;
    }
    .ng-journal-emotion-group {
      display: grid;
      justify-items: center;
    }
    .ng-journal-emotion-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .ng-journal-emotion-button {
      padding: 8px 10px;
    }
    .ng-journal-emotion-button {
      background: transparent;
      border: 1px solid;
      color: var(--text-normal);
    }
    .ng-journal-emotion-button:not(.is-active) {
      color: color-mix(in srgb, var(--text-normal) 70%, black 30%);
      filter: none;
    }
    .ng-journal-emotion-button.pleasant {
      border-color: #39e05a;
    }
    .ng-journal-emotion-button.unpleasant {
      border-color: #ff6565;
    }
    .ng-journal-emotion-button.pleasant:not(.is-active) {
      border-color: color-mix(in srgb, #39e05a 48%, black 52%);
    }
    .ng-journal-emotion-button.unpleasant:not(.is-active) {
      border-color: color-mix(in srgb, #ff6565 48%, black 52%);
    }
    .ng-journal-emotion-button.is-active.pleasant {
      background: rgba(57, 224, 90, 0.16);
      color: var(--text-normal);
    }
    .ng-journal-emotion-button.is-active.unpleasant {
      background: rgba(255, 101, 101, 0.16);
      color: var(--text-normal);
    }
    .ng-journal-emotion-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .ng-journal-emotion-chip {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--background-modifier-border);
      border-radius: 999px;
      padding: 5px 10px;
      margin: 0;
    }
    .ng-journal-emotion-chip.pleasant {
      border-color: #39e05a;
      color: #39e05a;
    }
    .ng-journal-emotion-chip.unpleasant {
      border-color: #ff6565;
      color: #ff6565;
    }
    .ng-journal-entry-card .ng-journal-emotion-chip {
      filter: saturate(80%);
    }
    .ng-journal-note-input {
      min-height: 90px;
      width: 100%;
      resize: vertical;
      border-radius: 10px;
      border: 1px solid var(--background-modifier-border);
      background: transparent;
      color: var(--text-normal);
      padding: 30px 10px 10px;
    }
    .ng-journal-note-section {
      position: relative;
    }
    .ng-journal-character-count {
      position: absolute;
      top: 6px;
      left: 12px;
      font-size: 0.72rem;
      color: var(--text-muted);
      pointer-events: none;
    }
    .ng-journal-tracker-head {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      margin-bottom: 12px;
    }
    .ng-journal-tracker-head h3 {
      margin: 0;
      grid-column: 2;
      text-align: center;
    }
    .ng-journal-tracker-add-toggle {
      all: unset;
      grid-column: 3;
      justify-self: end;
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 600;
      color: color-mix(in srgb, #ec9a63 55%, white);
      transition: color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-tracker-add-toggle:hover,
    .ng-journal-tracker-add-toggle:focus-visible {
      color: #ec9a63;
    }
    .ng-journal-tracker-add-row {
      margin-bottom: 14px;
    }
    .ng-journal-tracker-color-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
    }
    .ng-journal-tracker-color-option {
      width: 22px;
      height: 22px;
      flex: 0 0 auto;
      border-radius: 50%;
      cursor: pointer;
      border: 1px solid transparent;
      box-sizing: border-box;
      transition: transform 140ms ease, box-shadow 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-tracker-color-option:hover {
      transform: scale(1.15);
    }
    .ng-journal-tracker-color-option:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.45);
    }
    .ng-journal-tracker-list {
      display: grid;
      gap: 3px;
    }
    .ng-journal-tracker-row {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      border-radius: 8px;
      padding: 1px 4px;
      transition: background-color 140ms ease;
    }
    .ng-journal-tracker-row:not(.ng-journal-tracker-header):hover {
      background: color-mix(in srgb, var(--background-modifier-hover) 55%, transparent);
    }
    .ng-journal-tracker-label {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      padding: 4px 0;
    }
    .ng-journal-tracker-title {
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ng-journal-tracker-label .ng-journal-tracker-color-chip {
      width: 14px;
      height: 14px;
    }
    .ng-journal-tracker-color-chip {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
      border-radius: 50%;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-tracker-color-chip:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.45);
    }
    .ng-journal-tracker-color-hidden {
      position: absolute;
      width: 0;
      height: 0;
      padding: 0;
      border: none;
      opacity: 0;
      pointer-events: none;
    }
    .ng-journal-tracker-block {
      display: grid;
      gap: 8px;
      justify-items: center;
      margin-top: 18px;
    }
    .ng-journal-tracker-block h4 {
      margin: 0;
      color: var(--text-normal);
      text-align: center;
      font-size: 1.2rem;
    }
    .ng-journal-entry-page .ng-journal-tracker-block h4 {
      font-size: 1.56rem;
    }
    .ng-journal-tracker-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .ng-journal-tracker-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 999px;
      font-size: 0.85rem;
      color: var(--text-normal);
      transition: border-color 140ms ease, background-color 140ms ease;
    }
    .ng-journal-tracker-chip-dot {
      width: 10px;
      height: 10px;
      flex: 0 0 auto;
      border-radius: 50%;
    }
    .ng-journal-tracker-chip.is-active {
      border-color: var(--ng-tracker-color, #ec9a63);
      background: color-mix(in srgb, var(--ng-tracker-color, #ec9a63) 14%, transparent);
    }
    .ng-journal-tracker-chip.ng-journal-tracker-chip-preview {
      border-color: var(--ng-tracker-color, #ec9a63);
      background: transparent;
    }
    .ng-journal-tracker-chip.is-clickable {
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-tracker-chip.is-clickable:hover {
      border-color: var(--ng-tracker-color, #ec9a63);
    }
    .ng-journal-tracker-chip.is-clickable:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-tracker-color, #ec9a63) 45%, transparent);
    }
    .ng-journal-tracker-label-empty {
      border: none;
      background: transparent;
      box-shadow: none;
    }
    .ng-journal-tracker-cells {
      display: grid;
      gap: 0;
    }
    .ng-journal-tracker-header {
      position: sticky;
      top: 0;
      z-index: 2;
      padding-bottom: 2px;
      margin-bottom: 4px;
      border-bottom: 1px solid var(--background-modifier-border);
      background: color-mix(in srgb, var(--background-primary) 16%, transparent);
      backdrop-filter: blur(6px);
    }
    .ng-journal-tracker-header-cell {
      display: grid;
      place-items: center;
      padding: 2px 0 6px;
      color: var(--text-faint);
    }
    .ng-journal-tracker-header-cell .ng-journal-tracker-day {
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      transform: translateY(1px);
    }
    .ng-journal-tracker-header-cell.is-today .ng-journal-tracker-day {
      color: #ec9a63;
    }
    .ng-journal-tracker-cell {
      all: unset;
      position: relative;
      cursor: pointer;
      display: grid;
      place-items: center;
      min-height: 30px;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-tracker-dot {
      position: relative;
      z-index: 1;
      width: 19px;
      height: 19px;
      border-radius: 50%;
      border: 1.5px solid var(--background-modifier-border);
      background: transparent;
      box-sizing: border-box;
      transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;
    }
    .ng-journal-tracker-cell:hover .ng-journal-tracker-dot {
      border-color: var(--ng-tracker-color, #ec9a63);
      transform: scale(1.12);
    }
    .ng-journal-tracker-cell:focus-visible .ng-journal-tracker-dot {
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-tracker-color, #ec9a63) 45%, transparent);
    }
    .ng-journal-tracker-cell.is-today .ng-journal-tracker-dot {
      border-color: color-mix(in srgb, #ec9a63 55%, var(--background-modifier-border));
    }
    .ng-journal-tracker-cell.is-active .ng-journal-tracker-dot {
      background: var(--ng-tracker-color, #ec9a63);
      border-color: var(--ng-tracker-color, #ec9a63);
    }
    .ng-journal-tracker-cell.has-prev::before,
    .ng-journal-tracker-cell.has-next::after {
      content: "";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 6px;
      background: color-mix(in srgb, var(--ng-tracker-color, #ec9a63) 55%, var(--background-primary));
      z-index: 0;
    }
    .ng-journal-tracker-cell.has-prev::before {
      left: 0;
      right: 50%;
    }
    .ng-journal-tracker-cell.has-next::after {
      left: 50%;
      right: 0;
    }
    .ng-journal-tracker-streak {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      font-size: 0.64rem;
      font-weight: 700;
      color: var(--ng-tracker-streak-color, #ffffff);
      pointer-events: none;
      line-height: 1;
    }
    .ng-task-empty {
      font-size: 0.96rem;
    }
    .ng-journal-entry-page,
    .ng-journal-entry-card {
      max-width: 720px;
      margin: 0 auto;
    }
    .ng-journal-entry-page {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 0 24px;
    }
    .ng-journal-task-group {
      display: grid;
      gap: 4px;
      margin-top: 2px;
    }
    .ng-journal-task-group h5 {
      margin: 0;
    }
    .ng-journal-task-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 4px;
    }
    .ng-journal-task-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px 22px;
    }
    .ng-journal-task-list .ng-journal-task-row {
      flex: 0 1 auto;
    }
    .ng-journal-task-name {
      flex: 0 1 auto;
    }
    .ng-journal-task-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 88px;
      padding: 3px 8px;
      border: 1px solid;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .ng-journal-entry-page .ng-journal-task-badge {
      filter: saturate(60%);
    }
    .ng-journal-entry-page .ng-journal-task-row {
      justify-content: center;
    }
    .ng-journal-entry-card .ng-journal-task-badge {
      filter: saturate(70%);
    }
    .ng-journal-entry-card .ng-journal-task-row {
      justify-content: center;
    }
    .ng-journal-entry-card .ng-journal-body h4 {
      text-align: center;
      color: var(--text-normal);
    }
    .ng-journal-body-markdown {
      margin-top: 18px;
      border: 1px solid color-mix(in srgb, var(--interactive-accent) 44%, var(--background-modifier-border));
      border-radius: 14px;
      background: color-mix(in srgb, var(--background-primary) 10%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--interactive-accent) 16%, transparent), 0 0 16px color-mix(in srgb, var(--interactive-accent) 20%, transparent);
      padding: 14px 14px 18px;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }
    .ng-journal-body-markdown:focus-within {
      border-color: color-mix(in srgb, var(--interactive-accent) 68%, var(--background-modifier-border));
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--interactive-accent) 31%, transparent), 0 0 29px color-mix(in srgb, var(--interactive-accent) 36%, transparent);
    }
    .ng-journal-body-markdown h4 {
      text-align: center;
      color: var(--text-normal);
      font-size: 1.8rem;
      margin: 0;
    }
    .ng-journal-entry-subtitle {
      text-align: center;
      font-style: italic;
      color: var(--text-muted);
      margin-top: 2px;
      margin-bottom: 5px;
    }
    .ng-tracker-section {
      margin-top: 22px;
    }
    .ng-journal-body-content {
      min-height: 120px;
      max-width: 100%;
      border: none;
      background: transparent;
      color: var(--text-normal);
      font-size: 1.02em;
      padding: 0;
      margin-top: 1px;
      white-space: pre-wrap;
      overflow-wrap: normal;
      word-break: normal;
      overflow-x: hidden;
      outline: none;
      line-height: 1.6;
      box-sizing: border-box;
    }
    .ng-journal-body-content:focus {
      outline: none;
      box-shadow: none;
    }
    .ng-journal-entry-sticky-header {
      position: relative;
      z-index: 8;
      background: transparent;
    }
    .ng-journal-entry-page.is-compact .ng-journal-entry-sticky-header {
      padding-bottom: 6px;
      border-bottom: 1px solid color-mix(in srgb, var(--background-modifier-border) 72%, transparent);
      box-shadow: none;
    }
    .ng-journal-entry-page.is-compact .ng-journal-title-wrap {
      display: none;
    }
    .ng-journal-full-check-in {
      max-height: var(--ng-journal-full-height, 5000px);
      overflow: hidden;
      opacity: 1;
      transform: translateY(0);
      transition: max-height 620ms ease, opacity 360ms ease;
    }
    .ng-journal-entry-page.is-collapsing .ng-journal-full-check-in {
      opacity: 0;
      pointer-events: none;
    }
    .ng-journal-entry-page.is-compact .ng-journal-full-check-in {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
    }
    .ng-journal-compact-summary {
      position: relative;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 620ms ease, opacity 620ms ease;
    }
    .ng-journal-entry-page.is-compact .ng-journal-compact-summary {
      max-height: var(--ng-journal-compact-height, 420px);
      opacity: 1;
    }
    .ng-journal-compact-heading {
      position: relative;
      display: block;
      margin-bottom: 5px;
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 600;
      text-align: center;
      text-transform: uppercase;
    }
    .ng-journal-compact-expand {
      position: static;
      flex: 0 0 auto;
      align-self: center;
      margin-left: auto;
      padding: 3px 8px;
      border-color: color-mix(in srgb, #ec9a63 24%, var(--background-modifier-border));
      color: color-mix(in srgb, var(--text-normal) 88%, var(--text-muted));
      font-size: 0.68rem;
      text-transform: none;
    }
    .ng-journal-compact-expand:hover {
      border-color: color-mix(in srgb, #ec9a63 36%, var(--background-modifier-border));
      box-shadow: 0 0 0 1px color-mix(in srgb, #ec9a63 12%, transparent);
    }
    .ng-journal-compact-metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 4px 8px;
    }
    .ng-journal-compact-task-list {
      display: flex;
      flex: 1 1 0;
      flex-wrap: wrap;
      align-items: stretch;
      gap: 0;
      min-width: 0;
    }
    .ng-journal-compact-task {
      position: relative;
      display: grid;
      justify-items: center;
      gap: 2px;
      min-width: 68px;
      padding: 1px 5px;
    }
    .ng-journal-compact-task + .ng-journal-compact-task::before {
      position: absolute;
      top: 15%;
      bottom: 15%;
      left: 0;
      width: 1px;
      background: color-mix(in srgb, var(--background-modifier-border) 55%, transparent);
      content: "";
    }
    .ng-journal-compact-task-name {
      color: var(--text-normal);
      text-align: center;
    }
    .ng-journal-compact-task-badge {
      padding: 1px 5px;
      border: 1px solid color-mix(in srgb, var(--ng-compact-task-color) 54%, transparent);
      border-radius: 999px;
      color: var(--ng-compact-task-color);
      font-size: 0.58rem;
      line-height: 1.15;
      text-align: center;
    }
    .ng-journal-compact-tasks-label {
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.15;
    }
    .ng-journal-compact-metric {
      display: grid;
      grid-template-columns: auto minmax(18px, 1fr);
      align-items: center;
      gap: 4px;
      color: var(--text-muted);
      font-size: 0.62rem;
    }
    .ng-journal-compact-track {
      height: 4px;
      overflow: hidden;
      border-radius: 999px;
      background: var(--background-modifier-border);
    }
    .ng-journal-compact-fill {
      display: block;
      height: 100%;
      border-radius: inherit;
    }
    .ng-journal-compact-details {
      display: grid;
      gap: 2px;
      margin-top: 5px;
    }
    .ng-journal-compact-detail-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px;
      min-width: 0;
      font-size: 0.62rem;
    }
    .ng-journal-compact-detail-label {
      flex: 0 0 58px;
      color: var(--text-muted);
      font-weight: 600;
    }
    .ng-journal-compact-chip {
      padding: 1px 5px;
      border: 1px solid transparent;
      border-radius: 999px;
      color: var(--text-normal);
    }
    .ng-journal-compact-chip.pleasant {
      border-color: color-mix(in srgb, #39e05a 58%, transparent);
      color: #39e05a;
    }
    .ng-journal-compact-chip.unpleasant {
      border-color: color-mix(in srgb, #ff6565 58%, transparent);
      color: #ff6565;
    }
    .ng-journal-compact-chip.is-tracker {
      border-color: color-mix(in srgb, var(--ng-compact-chip-color) 58%, transparent);
      color: var(--ng-compact-chip-color);
    }
    .ng-journal-compact-empty {
      color: var(--text-faint);
    }
    @media (max-width: 900px) {
      .ng-journal-layout {
        grid-template-columns: 1fr;
      }
      .ng-journal-tracker-row {
        grid-template-columns: 100px minmax(0, 1fr);
        gap: 6px;
      }
      .ng-journal-tracker-title {
        font-size: 0.82rem;
      }
      .ng-journal-task-editor .ng-task-input {
        width: min(100%, 234px);
      }
      .ng-journal-tracker-dot {
        width: 16px;
        height: 16px;
      }
      .ng-journal-title-wrap {
        text-align: left;
      }
      .ng-journal-entry-page .ng-journal-title-wrap,
      .ng-journaling .ng-journal-title-wrap {
        text-align: center;
      }
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
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ng-task-row {
        grid-template-columns: minmax(0, 1fr) auto auto auto;
      }
      .ng-effort-buttons {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
    .ng-mynotes {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 0 24px;
    }
    .ng-mynotes-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ng-mynotes-learning {
      opacity: 0.5;
      cursor: default;
    }
    .ng-mylearning {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 0 24px;
    }
    .ng-mylearning-topbar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .ng-mylearning-heading-row {
      display: block;
    }
    .ng-mylearning-heading-row .ng-mynotes-heading {
      margin: 0;
      text-align: center;
    }
    .ng-mylearning-daily-calendar {
      position: relative;
      border-top: 1px solid color-mix(in srgb, var(--background-modifier-border) 72%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--background-modifier-border) 72%, transparent);
      padding: 4px 27px;
      overflow: hidden;
    }
    .ng-mylearning-daily-viewport {
      overflow-x: auto;
      scrollbar-width: none;
      cursor: grab;
      touch-action: pan-x;
      user-select: none;
    }
    .ng-mylearning-daily-viewport::-webkit-scrollbar {
      display: none;
    }
    .ng-mylearning-daily-viewport.is-dragging {
      cursor: grabbing;
    }
    .ng-mylearning-daily-row {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 3px;
      width: max-content;
      min-width: 100%;
    }
    .ng-mylearning-daily-arrow {
      position: absolute;
      top: 50%;
      z-index: 3;
      display: grid;
      width: 18px;
      min-width: 18px;
      height: 30px;
      padding: 0;
      border: 0;
      background: var(--background-primary);
      box-shadow: none;
      color: var(--text-muted);
      place-items: center;
      transform: translateY(-50%);
    }
    .ng-mylearning-daily-arrow.is-left {
      left: 0;
    }
    .ng-mylearning-daily-arrow.is-right {
      right: 0;
    }
    .ng-mylearning-daily-arrow:disabled {
      opacity: 0.18;
      cursor: default;
    }
    .ng-mylearning-daily-arrow svg {
      width: 13px;
      height: 13px;
    }
    .ng-mylearning-daily-day {
      position: relative;
      display: flex;
      flex: 0 0 34px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      min-width: 34px;
      height: 35px;
      padding: 3px 3px 6px;
      border: 1px solid rgba(236, 154, 99, 0.3);
      border-radius: 5px;
      background: transparent;
      box-shadow: none;
      color: var(--text-muted);
      cursor: default;
    }
    .ng-mylearning-daily-day.has-note,
    .ng-mylearning-daily-day.is-today {
      cursor: pointer;
    }
    .ng-mylearning-daily-day:hover {
      border-color: #ffd2b0;
      box-shadow: 0 0 0 1px rgba(236, 154, 99, 0.16);
    }
    .ng-mylearning-daily-day.is-today {
      border-color: #0e8f9f;
      box-shadow: 0 0 0 1px rgba(14, 143, 159, 0.16);
      color: var(--text-normal);
      font-weight: 700;
    }
    .ng-mylearning-daily-weekday {
      font-size: 0.48rem;
      line-height: 1;
      text-transform: uppercase;
    }
    .ng-mylearning-daily-number-wrap {
      position: relative;
      display: grid;
      width: 17px;
      height: 17px;
      place-items: center;
    }
    .ng-mylearning-daily-number {
      font-size: 0.77rem;
      font-weight: 600;
      line-height: 1;
    }
    .ng-mylearning-daily-day.is-processed .ng-mylearning-daily-number {
      opacity: 0.24;
    }
    .ng-mylearning-daily-check {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #45c978;
    }
    .ng-mylearning-daily-check svg {
      width: 17px;
      height: 17px;
      stroke-width: 3;
    }
    .ng-mylearning-daily-marker {
      position: absolute;
      right: 3px;
      bottom: 3px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ec9a63 !important;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.14), 0 0 5px rgba(236, 154, 99, 0.34);
    }
    .ng-mylearning-daily-done {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-normal);
      cursor: pointer;
    }
    .ng-mylearning-label {
      margin: 0;
      color: var(--text-normal);
      font-size: 1.46rem;
      font-weight: 500;
    }
    .ng-mylearning-inline-create {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .ng-mylearning-header-actions {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-left: 0;
    }
    .ng-mylearning-heading-group {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
    }
    .ng-mylearning-heading-add-note {
      margin-left: auto;
    }
    .ng-mylearning-header-actions .ng-note-header-add-category-icon {
      min-width: 18px;
      width: 18px;
      height: 20px;
      padding: 0;
    }
    .ng-mylearning-inline-plus {
      min-width: 18px;
      width: 18px;
      height: 20px;
      padding: 0;
      font-size: 1.25em;
      color: color-mix(in srgb, #ec9a63 60%, white);
    }
    .ng-mylearning-inline-edit {
      min-width: 18px;
      width: 18px;
      height: 20px;
      padding: 0;
      color: color-mix(in srgb, var(--text-muted) 72%, white);
    }
    .ng-mylearning-inline-edit.is-active {
      color: #ec9a63;
      text-shadow: 0 0 8px color-mix(in srgb, #ec9a63 36%, transparent);
    }
    .ng-mylearning-inline-edit svg {
      width: 13px;
      height: 13px;
    }
    .ng-mylearning-divider {
      margin-top: 8px;
      border-top: 1px solid color-mix(in srgb, var(--background-modifier-border) 82%, transparent);
    }
    .ng-mylearning-topic-pill {
      font-size: 1.02rem;
      padding: 8px 15px;
    }
    .ng-mylearning-topics .ng-mynotes-pill-row,
    .ng-mylearning-categories .ng-mynotes-pill-row {
      margin-top: 8px;
    }
    .ng-mylearning-notes {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ng-mylearning-notes-header {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      min-height: 22px;
    }
    .ng-mylearning-notes-title-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .ng-mylearning-notes-title {
      color: var(--text-normal);
      font-size: 1.46rem;
      font-weight: 500;
    }
    .ng-mylearning-quick-create {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: #ec9a63;
      cursor: pointer;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0;
      line-height: 1;
      appearance: none;
      -webkit-appearance: none;
      overflow: visible;
      flex: 0 0 auto;
    }
    .ng-mylearning-quick-create:hover {
      color: color-mix(in srgb, #ec9a63 75%, white);
      background: transparent !important;
      box-shadow: none !important;
    }
    .ng-mylearning-quick-create svg {
      width: 47px;
      height: 47px;
      display: block;
      fill: currentColor;
      stroke: currentColor;
    }
    .ng-mylearning-quick-create .ng-mynotes-button-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
    }
    .ng-mylearning-quick-create .ng-mynotes-button-icon svg,
    .ng-mylearning-quick-create .ng-mynotes-button-icon svg * {
      opacity: 1;
      fill: currentColor !important;
      stroke: currentColor !important;
    }
    .ng-mylearning-quick-create .ng-mynotes-button-icon svg {
      width: 20px !important;
      height: 20px !important;
    }
    .ng-mylearning .ng-mylearning-category-pill {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 40%, transparent);
      background: color-mix(in srgb, var(--ng-mylearning-category-color) 4%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-category-color) 14%, transparent), 0 0 8px color-mix(in srgb, var(--ng-mylearning-category-color) 9%, transparent);
      color: var(--text-normal);
    }
    .ng-mylearning .ng-mylearning-category-pill:not(.is-active):hover {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 78%, var(--background-modifier-border));
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-category-color) 22%, transparent), 0 0 10px color-mix(in srgb, var(--ng-mylearning-category-color) 14%, transparent);
    }
    .ng-mylearning .ng-mylearning-category-pill.is-active {
      border-color: var(--ng-mylearning-category-color);
      background: color-mix(in srgb, var(--ng-mylearning-category-color) 8%, var(--background-primary));
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-mylearning-category-color) 30%, transparent), 0 0 12px color-mix(in srgb, var(--ng-mylearning-category-color) 20%, transparent);
    }
    .ng-mylearning .ng-mynotes-pill.is-edit-target {
      border-style: dashed;
      cursor: pointer;
    }
    .ng-mylearning-progress-summary {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-left: 4px;
    }
    .ng-mylearning-progress-count {
      font-size: 0.78em;
      font-weight: 700;
    }
    .ng-mylearning-progress-count.is-green { color: #45c978; }
    .ng-mylearning-progress-count.is-yellow { color: #e4bd4d; }
    .ng-mylearning-progress-count.is-orange { color: #ec9a63; }
    .ng-mylearning-average-track {
      display: inline-block;
      width: 38px;
      height: 5px;
      border-radius: 999px;
      overflow: hidden;
      background: var(--background-modifier-border);
    }
    .ng-mylearning-average-fill {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: #00f0ff;
    }
    .ng-mylearning-entry-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .ng-mylearning-entry-list .ng-mynotes-note-row {
      width: 100%;
      padding: 2px 8px;
      box-sizing: border-box;
    }
    .ng-mynotes-note-row.is-low-comprehension {
      background: color-mix(in srgb, #fb2c36 7%, transparent);
    }
    .ng-mylearning-entry-progress {
      width: 55px;
      height: 6px;
      flex: 0 0 55px;
      overflow: hidden;
      border-radius: 999px;
    }
    .ng-mylearning-entry-progress.is-green { background: color-mix(in srgb, #45c978 28%, transparent); }
    .ng-mylearning-entry-progress.is-yellow { background: color-mix(in srgb, #e4bd4d 28%, transparent); }
    .ng-mylearning-entry-progress.is-orange { background: color-mix(in srgb, #ec9a63 28%, transparent); }
    .ng-mylearning-entry-progress-fill {
      height: 100%;
      border-radius: inherit;
    }
    .ng-mylearning-entry-progress-fill.is-green { background: #45c978; }
    .ng-mylearning-entry-progress-fill.is-yellow { background: #e4bd4d; }
    .ng-mylearning-entry-progress-fill.is-orange { background: #ec9a63; }
    .ng-mylearning-entry-type {
      color: var(--text-muted);
      font-size: 0.78em;
    }
    .ng-mylearning-type-control {
      display: inline-flex;
      align-self: center;
      padding: 2px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
    }
    .ng-mylearning-type-control button {
      border: none;
      border-radius: 4px;
      background: transparent;
      box-shadow: none;
    }
    .ng-mylearning-type-control button.is-active {
      background: var(--background-modifier-hover);
      color: #ec9a63;
    }
    .ng-note-header-input-error {
      width: 100%;
      margin-top: 4px;
    }
    .ng-learning-canvas-controls {
      position: absolute;
      top: 44px;
      left: 12px;
      z-index: 30;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 5px 8px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      background: var(--background-primary);
      color: var(--text-normal);
      box-shadow: var(--shadow-s);
    }
    .ng-learning-canvas-back {
      border: 0;
      padding: 3px 5px;
      background: transparent;
      color: inherit;
      box-shadow: none;
    }
    .ng-learning-canvas-back:hover {
      color: #ec9a63;
    }
    .ng-learning-canvas-progress {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      font-size: 0.78rem;
    }
    .ng-learning-canvas-progress .ng-learning-progress-track {
      width: 134px;
      height: 12px;
    }
    .ng-mylearning-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 8px;
      row-gap: 3px;
      position: relative;
      padding: 0 10px;
    }
    .ng-mylearning-grid-divider {
      position: absolute;
      left: calc(50% - 11px);
      top: 0;
      bottom: 0;
      width: 1px;
      background: color-mix(in srgb, var(--background-modifier-border) 82%, transparent);
      pointer-events: none;
      transform: translateX(-0.5px);
    }
    .ng-mylearning-grid .ng-mynotes-note-row {
      margin: 0;
      padding: 1px 7px;
      gap: 8px;
      width: calc(100% - 8px);
      margin-right: 8px;
      box-sizing: border-box;
    }
    .ng-mylearning-row-actions {
      display: inline-flex;
      align-items: center;
      gap: 1px;
      margin-left: auto;
    }
    .ng-mylearning-comprehension {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ng-mylearning-comprehension > .ng-mynotes-subheading-toggle {
      margin-top: 2px;
    }
    .ng-mylearning-comprehension-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ng-mylearning-comprehension-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(140px, 220px);
      align-items: center;
      gap: 10px;
      padding: 3px 8px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .ng-mylearning-comprehension-row:hover {
      background: color-mix(in srgb, var(--text-normal) 6%, transparent);
    }
    .ng-mylearning-comprehension-text {
      display: flex;
      flex-direction: column;
      gap: 0;
      min-width: 0;
    }
    .ng-mylearning-comprehension-title-line {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      min-width: 0;
    }
    .ng-mylearning-topic-badge-row {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }
    .ng-mylearning-topic-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 0.76rem;
      line-height: 1.1;
      color: color-mix(in srgb, var(--text-muted) 92%, var(--background-primary));
      border: 1px solid color-mix(in srgb, var(--background-modifier-border) 82%, transparent);
      background: color-mix(in srgb, var(--background-primary) 96%, transparent);
      width: fit-content;
    }
    .ng-mylearning-category-badge {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 34%, var(--background-modifier-border));
      background: color-mix(in srgb, var(--ng-mylearning-category-color) 7%, var(--background-primary));
      color: color-mix(in srgb, var(--text-muted) 80%, var(--ng-mylearning-category-color));
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-category-color) 14%, transparent), 0 0 10px color-mix(in srgb, var(--ng-mylearning-category-color) 8%, transparent);
    }
    .ng-mylearning-category-badge:hover {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 52%, var(--background-modifier-border));
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-category-color) 18%, transparent), 0 0 12px color-mix(in srgb, var(--ng-mylearning-category-color) 12%, transparent);
    }
    .ng-mylearning-category-color-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: -2px 0 2px;
    }
    .ng-mylearning-category-color-row.is-centered {
      justify-content: center;
      width: 100%;
      margin-top: 2px;
    }
    .ng-mylearning-category-color-row .ng-task-input {
      flex: 1 1 auto;
      min-width: 0;
    }
    .ng-mylearning-category-color-wrap {
      position: relative;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .ng-mylearning-color-input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }
    .ng-mylearning-color-swatch {
      width: 24px;
      height: 24px;
      display: inline-block;
      flex: 0 0 auto;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--ng-mylearning-picked-color) 54%, var(--background-modifier-border));
      background: var(--ng-mylearning-picked-color);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-picked-color) 18%, transparent), 0 0 10px color-mix(in srgb, var(--ng-mylearning-picked-color) 12%, transparent);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-mylearning-color-swatch:hover {
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-picked-color) 26%, transparent), 0 0 12px color-mix(in srgb, var(--ng-mylearning-picked-color) 16%, transparent);
    }
    .ng-mylearning-color-swatch:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-mylearning-picked-color) 45%, transparent);
    }
    .ng-mylearning-mini-progress {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--background-modifier-border) 85%, transparent);
      overflow: hidden;
    }
    .ng-mylearning-mini-progress-fill {
      height: 100%;
      border-radius: inherit;
      background: #00f0ff;
      width: 0;
      transition: width 180ms ease;
    }
    .ng-mylearning-uncategorized {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ng-mylearning-uncategorized .ng-mynotes-note-row {
      padding: 1px 7px;
      gap: 8px;
    }
    .ng-learning-note-header {
      gap: 0;
    }
    .ng-learning-note-header .ng-note-header-note-name {
      opacity: 1;
      transition: none;
    }
    .ng-note-header-collapsed-summary.ng-learning-collapsed-summary {
      min-height: 0;
      gap: 2px;
      padding: 3px 0 3px;
    }
    .ng-learning-note-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ng-learning-note-header-top-left,
    .ng-learning-note-header-top-right {
      display: inline-flex;
      align-items: center;
    }
    .ng-learning-note-header-top-right {
      margin-left: auto;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }
    .ng-learning-topic-heading {
      margin: 0;
      text-align: center;
      color: var(--text-normal);
      cursor: pointer;
      font-weight: 550;
    }
    .ng-learning-collapsed-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .ng-learning-collapsed-row .ng-learning-collapsed-category {
      flex: 0 0 auto;
    }
    .ng-learning-collapsed-row .ng-note-header-collapsed-categories {
      flex: 1 1 auto;
      width: auto;
      min-width: 0;
    }
    .ng-learning-collapsed-row .ng-note-header-mini-pill {
      border-color: var(--ng-mylearning-category-color);
    }
    .ng-learning-collapsed-row .ng-learning-progress-wrap-compact {
      margin-left: auto;
      width: min(180px, 30%);
      flex: 0 1 180px;
    }
    .ng-learning-collapsed-row .ng-note-header-collapsed-controls {
      position: static;
      flex: 0 0 auto;
      width: auto;
      margin: 0;
      padding: 0;
    }
    .ng-learning-collapsed-row .ng-note-header-to-top {
      width: 36px;
      min-width: 36px;
      justify-content: center;
    }
    .ng-learning-collapsed-category {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-normal);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ng-learning-collapsed-category.is-placeholder {
      color: var(--text-muted);
      font-style: italic;
      font-weight: 500;
    }
    .ng-learning-topic-heading.is-placeholder {
      color: var(--text-muted);
      font-style: italic;
      font-weight: 500;
    }
    .ng-learning-topic-row {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .ng-learning-topic-edit,
    .ng-learning-category-edit {
      color: color-mix(in srgb, var(--text-muted) 72%, white);
    }
    .ng-learning-topic-edit.is-active,
    .ng-learning-category-edit.is-active {
      color: #ec9a63;
      text-shadow: 0 0 8px color-mix(in srgb, #ec9a63 35%, transparent);
    }
    .ng-learning-topic-edit svg,
    .ng-learning-category-edit svg {
      width: 15px;
      height: 15px;
    }
    .ng-learning-note-box {
      gap: 10px;
    }
    .ng-learning-categories-left {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .ng-learning-progress-wrap {
      width: 50%;
      margin: 2px auto 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
    }
    .ng-learning-progress-wrap-compact {
      margin: 0;
      align-items: stretch;
    }
    .ng-learning-progress-wrap-compact .ng-learning-progress-track {
      height: 8px;
      cursor: pointer;
    }
    .ng-learning-progress-heading {
      margin: 0;
      font-size: 0.95rem;
      color: var(--text-normal);
      font-weight: 600;
    }
    .ng-learning-progress-track {
      width: 100%;
      height: 12px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--background-modifier-border) 88%, transparent);
      cursor: pointer;
      overflow: hidden;
      touch-action: none;
    }
    .ng-learning-progress-fill {
      height: 100%;
      width: 0;
      border-radius: inherit;
      background: #00f0ff;
      transition: width 120ms ease;
    }
    @media (max-width: 680px) {
      .ng-mylearning-grid {
        grid-template-columns: 1fr;
      }
      .ng-mylearning-comprehension-row {
        grid-template-columns: 1fr;
      }
      .ng-learning-note-header-top {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .ng-learning-note-header-top-left,
      .ng-learning-note-header-top-right {
        width: 100%;
      }
      .ng-learning-note-header-top-right {
        justify-content: flex-end;
      }
    }
    .ng-note-header-top,
    .ng-note-header-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .ng-note-header-top-left,
    .ng-note-header-top-right {
      display: inline-flex;
      align-items: center;
    }
    .ng-note-header-top-right {
      margin-left: auto;
    }
    .ng-mynotes-heading {
      text-align: center;
      margin: 0;
    }
    .ng-mynotes-heading-hint {
      text-align: center;
      font-style: italic;
      font-size: 0.92em;
      color: var(--text-muted);
      margin-top: 0;
    }
    .ng-mynotes-categories {
      border: none;
      border-radius: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: transparent;
    }
    .ng-mynotes-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ng-mynotes-title-actions {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .ng-mynotes-header-actions {
      margin-left: 0;
    }
    .ng-mynotes-create-target {
      margin-top: -4px;
      font-size: 0.85em;
      color: var(--text-muted);
      font-style: italic;
    }
    .ng-mynotes-section-title {
      margin: 0;
      font-size: 1.3em;
      font-weight: 600;
      color: var(--text-normal);
    }
    .ng-mynotes-new-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid #ec9a63;
      background: transparent;
      color: var(--text-normal);
      cursor: pointer;
    }
    .ng-mylearning-topbar .ng-mynotes-new-button {
      border-color: color-mix(in srgb, #ec9a63 32%, var(--background-modifier-border));
      color: color-mix(in srgb, var(--text-normal) 92%, var(--text-muted));
    }
    .ng-mynotes-new-button:hover {
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.25);
    }
    .ng-mylearning-topbar .ng-mynotes-new-button:hover {
      border-color: color-mix(in srgb, #ec9a63 46%, var(--background-modifier-border));
      box-shadow: 0 0 0 1px color-mix(in srgb, #ec9a63 18%, transparent);
    }
    .ng-mynotes-button-icon {
      display: inline-flex;
      align-items: center;
    }
    .ng-mynotes-button-icon svg {
      width: 15px;
      height: 15px;
    }
    .ng-mynotes-pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .ng-mynotes-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid var(--background-modifier-border);
      background: transparent;
      color: var(--text-normal);
      cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
    }
    .ng-mynotes-pill:hover {
      border-color: #ec9a63;
    }
    .ng-mynotes-pill:not(.is-active) {
      border-color: color-mix(in srgb, var(--background-modifier-border) 54%, transparent);
      background: transparent;
      box-shadow: none;
    }
    .ng-mynotes-pill:not(.is-active):hover {
      border-color: color-mix(in srgb, var(--background-modifier-border) 66%, transparent);
      box-shadow: none;
    }
    .ng-mynotes-pill.is-active {
      border-color: #ec9a63;
      background: transparent;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.2);
    }
    .ng-mynotes-pill.is-edit-target {
      border-style: dashed;
      cursor: pointer;
    }
    .ng-mynotes-pill-favourite .ng-mynotes-button-icon svg {
      color: #ff6565;
    }
    .ng-mynotes-pill-favourite.is-active .ng-mynotes-button-icon svg,
    .ng-mynotes-pill-favourite.is-active .ng-mynotes-button-icon svg * {
      fill: #ff6565 !important;
    }
    .ng-mynotes-support-pill {
      border-color: color-mix(in srgb, var(--ng-support-color) 65%, transparent);
    }
    .ng-mynotes-support-pill:not(.is-active) {
      border-color: color-mix(in srgb, var(--background-modifier-border) 54%, transparent);
    }
    .ng-mynotes-support-pill:hover {
      border-color: var(--ng-support-color);
    }
    .ng-mynotes-support-pill:not(.is-active):hover {
      border-color: color-mix(in srgb, var(--background-modifier-border) 66%, transparent);
    }
    .ng-mynotes-support-pill.is-active {
      border-color: var(--ng-support-color);
      background: transparent;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-support-color) 25%, transparent);
    }
    .ng-mynotes-support {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ng-mynotes-support .ng-mynotes-pill-row {
      gap: 7px;
    }
    .ng-mynotes-support .ng-mynotes-pill {
      padding: 5.5px 11px;
    }
    .ng-mynotes-search {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ng-mynotes-search input {
      width: 100%;
    }
    .ng-mynotes-search-hint {
      font-size: 0.9em;
      color: var(--text-muted);
    }
    .ng-mynotes-search-hint.is-hidden {
      display: none;
    }
    .ng-mynotes-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ng-mynotes-subheading {
      margin: 24px 0 6px;
      font-size: 1.3em;
      font-weight: 600;
      color: var(--text-muted);
    }
    .ng-mynotes-subheading-toggle {
      position: relative;
      align-self: flex-start;
      background: none !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0;
      cursor: pointer;
    }
    .ng-mynotes-subheading-toggle:hover {
      color: var(--text-normal);
    }
    .ng-mynotes-caret {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.6em;
      margin-right: 0;
      display: inline-flex;
      width: 10px;
      justify-content: center;
      align-items: center;
      pointer-events: none;
    }
    .ng-mynotes-subheading-label {
      padding-left: 14px;
    }
    .ng-mynotes-note-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .ng-mynotes-note-row:hover {
      background: color-mix(in srgb, var(--text-normal) 6%, transparent);
    }
    .ng-mynotes-note-indicator {
      width: 3px;
      height: 18px;
      border-radius: 2px;
      background: #ec9a63;
      flex-shrink: 0;
      margin-left: -7px;
    }
    .ng-mynotes-note-title {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ng-mynotes-note-heart,
    .ng-mynotes-note-open-right,
    .ng-mynotes-note-delete {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none !important;
      border: none !important;
      box-shadow: none !important;
      padding: 4px;
      height: auto;
      cursor: pointer;
      color: var(--text-muted);
    }
    .ng-mynotes-note-heart svg,
    .ng-mynotes-note-open-right svg,
    .ng-mynotes-note-delete svg {
      width: 16px;
      height: 16px;
    }
    .ng-mynotes-note-heart:hover {
      color: #ff6565;
    }
    .ng-mynotes-note-heart.is-favourite {
      color: #ff6565;
    }
    .ng-mynotes-note-heart.is-favourite svg,
    .ng-mynotes-note-heart.is-favourite svg * {
      fill: #ff6565 !important;
    }
    .ng-heart-pop {
      animation: ng-heart-pop 0.3s ease;
    }
    @keyframes ng-heart-pop {
      0% { transform: scale(1); }
      45% { transform: scale(1.45); }
      100% { transform: scale(1); }
    }
    .ng-mynotes-note-open-right:hover {
      color: #ec9a63;
      filter: drop-shadow(0 0 4px rgba(236, 154, 99, 0.4));
      transform: translateY(-0.5px);
    }
    .ng-mynotes-note-open-right:hover svg,
    .ng-mynotes-note-open-right:hover svg * {
      stroke: #ec9a63;
      fill: #ec9a63;
    }
    .ng-mynotes-note-delete {
      color: #ff6565;
    }
    .ng-mynotes-note-delete:hover {
      color: #fb2c36;
    }
    .ng-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }
    .ng-overlay-card {
      background: var(--background-primary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 14px;
      padding: 20px;
      min-width: 280px;
      max-width: 90vw;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    }
    .ng-overlay-card.ng-mylearning-edit-overlay-wide {
      min-width: min(420px, 92vw);
      width: min(520px, 92vw);
    }
    .ng-overlay-title {
      margin: 0;
      text-align: center;
      color: var(--text-normal);
      font-weight: 500;
    }
    .ng-overlay-subtitle {
      text-align: center;
      font-style: italic;
      color: var(--text-muted);
    }
    .ng-overlay-error {
      text-align: center;
      color: #ff6565;
    }
    .ng-overlay-text {
      color: var(--text-normal);
      text-align: center;
    }
    .ng-overlay-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    .ng-overlay-confirm,
    .ng-overlay-cancel,
    .ng-overlay-danger {
      padding: 6px 16px;
      border-radius: 999px;
      border: 1px solid var(--background-modifier-border);
      background: transparent;
      color: var(--text-normal);
      cursor: pointer;
    }
    .ng-overlay-confirm {
      border-color: #ec9a63;
      background: rgba(236, 154, 99, 0.18);
    }
    .ng-overlay-danger {
      border-color: #fb2c36;
      color: #fb2c36;
    }
    .ng-overlay-danger:hover {
      background: rgba(251, 44, 54, 0.15);
    }
    .view-content.ng-mynotes-header-host {
      display: flex !important;
      flex-direction: column;
      overflow: hidden !important;
    }
    .view-content.ng-mynotes-header-host > .markdown-source-view,
    .view-content.ng-mynotes-header-host > .markdown-reading-view {
      flex: 1 1 auto;
      min-height: 0;
      height: auto !important;
      width: 100%;
      position: relative !important;
      inset: auto !important;
      overflow: hidden;
      box-sizing: border-box;
    }
    .ng-note-header {
      max-width: 720px;
      width: 100%;
      flex: 0 0 auto;
      margin: 0 auto;
      padding: 0;
      border: none;
      border-bottom: 1px solid var(--background-modifier-border);
      display: flex;
      flex-direction: column;
      gap: 0;
      background: transparent;
      position: relative;
      z-index: 18;
    }
    .ng-note-header-top {
      position: relative;
      z-index: 2;
      background: transparent;
      border-bottom: none;
      padding: 6px 0;
    }
    .ng-note-header-top .ng-note-header-note-name {
      position: absolute;
      left: 50%;
      max-width: min(48%, 360px);
      opacity: 0;
      transform: translateX(-50%);
      pointer-events: none;
      transition: opacity 203ms ease;
    }
    .ng-note-header.is-collapsed .ng-note-header-top .ng-note-header-note-name {
      opacity: 1;
      transition: opacity 254ms ease 203ms;
    }
    .ng-note-header .ng-journal-nav-button {
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      padding: 0;
      width: auto;
    }
    .ng-note-header .ng-journal-nav-button:hover {
      border: none !important;
      background: none !important;
      box-shadow: none !important;
    }
    .ng-note-header-stage {
      position: relative;
      height: var(--ng-note-header-full-height, 1px);
      overflow: hidden;
      transition: height 355ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ng-note-header-collapsed-summary {
      display: flex;
      position: absolute;
      inset: 0 0 auto;
      flex-direction: column;
      gap: 4px;
      min-height: 44px;
      opacity: 0;
      transform: translateY(-3px);
      padding: 6px 42px 8px 0;
      box-sizing: border-box;
      border-bottom: none;
      background: transparent;
      pointer-events: none;
      transition: opacity 203ms ease, transform 203ms ease;
    }
    .ng-note-header.is-collapsed .ng-note-header-collapsed-summary {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
      transition: opacity 254ms ease 203ms, transform 254ms ease 203ms;
    }
    .ng-note-header-collapsed-controls {
      display: inline-flex;
      position: absolute;
      right: 0;
      bottom: 4px;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
    }
    .ng-note-header-note-name {
      margin: 0;
      font-size: 1.365em;
      color: var(--text-normal);
      font-weight: 600;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ng-note-header-collapsed-categories {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      gap: 6px;
    }
    .ng-note-header-mini-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, #ec9a63 30%, transparent);
      font-size: 0.82em;
      color: var(--text-muted);
      background: transparent;
    }
    .ng-note-header-mini-pill-support {
      border-color: var(--ng-support-color);
    }
    .ng-note-header-collapsed-empty {
      font-size: 0.82em;
      color: var(--text-muted);
      font-style: italic;
    }
    .ng-note-header-full {
      position: absolute;
      inset: 0 0 auto;
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
      transition: opacity 254ms ease 203ms, transform 254ms ease 203ms;
    }
    .ng-note-header.is-collapsed .ng-note-header-stage {
      height: var(--ng-note-header-compact-height, 1px);
    }
    .ng-note-header.is-collapsed .ng-note-header-full {
      opacity: 0;
      transform: translateY(-3px);
      pointer-events: none;
      transition: opacity 203ms ease, transform 203ms ease;
    }
    .ng-note-header-to-top {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      margin-left: 0;
      padding: 0;
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      color: color-mix(in srgb, #ec9a63 62%, white);
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      cursor: pointer;
      opacity: 1;
      pointer-events: auto;
      transition: color 150ms ease, transform 150ms ease;
    }
    .ng-note-header-to-top:hover {
      color: #ec9a63;
      transform: translateY(-1px);
    }
    .ng-note-header-box {
      border: none;
      border-radius: 0;
      padding: 4px 0 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: transparent;
    }
    .ng-note-header .ng-mynotes-section-title {
      font-size: 1.3em;
      color: var(--text-normal);
    }
    .ng-note-header-categories-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .ng-note-header-categories-actions {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .ng-note-header-add-category-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 26px;
      padding: 0 6px;
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      color: color-mix(in srgb, #ec9a63 55%, white);
      cursor: pointer;
      font-size: 1.5em;
      font-weight: 600;
      line-height: 1;
    }
    .ng-note-header-add-category-icon:hover {
      color: #ec9a63;
    }
    .ng-note-header-add-category-icon.has-input {
      color: #ec9a63;
    }
    .ng-note-header-fav {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      color: var(--text-muted);
      cursor: pointer;
    }
    .ng-note-header-fav svg {
      width: 18px;
      height: 18px;
    }
    .ng-note-header-fav:hover {
      color: #ff6565;
    }
    .ng-note-header-fav.is-favourite {
      color: #ff6565;
    }
    .ng-note-header-fav.is-favourite svg,
    .ng-note-header-fav.is-favourite svg * {
      fill: #ff6565 !important;
    }
    .ng-note-header-support-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      color: var(--text-muted);
      cursor: pointer;
    }
    .ng-note-header-support-toggle svg {
      width: 18px;
      height: 18px;
    }
    .ng-note-header-support-toggle:hover {
      color: #00f0ff;
    }
    .ng-note-header-support-toggle.is-active {
      color: #00f0ff;
    }
    .ng-note-header-support-toggle.is-active svg,
    .ng-note-header-support-toggle.is-active svg * {
      stroke: #00f0ff;
      fill: #00f0ff !important;
    }
    .ng-note-header-nav {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }
    .ng-note-header-spacer {
      height: 4px;
    }
    .ng-note-header-add-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .ng-note-header-add-row input {
      flex: 1;
    }
    .ng-note-header-support {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 4px;
    }
    .ng-note-header-support.is-hidden {
      display: none;
    }
    .ng-note-header-category-pill {
      border-color: color-mix(in srgb, var(--background-modifier-border) 55%, transparent);
      color: var(--text-muted);
    }
    .ng-learning-note-header .ng-note-header-category-pill {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 34%, var(--background-modifier-border));
      background: color-mix(in srgb, var(--ng-mylearning-category-color) 4%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-category-color) 8%, transparent);
      color: color-mix(in srgb, var(--text-normal) 90%, var(--background-primary));
    }
    .ng-learning-note-header .ng-note-header-category-pill:not(.is-active):hover {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 76%, var(--background-modifier-border));
    }
    .ng-learning-note-header .ng-note-header-category-pill.is-active {
      border-color: var(--ng-mylearning-category-color);
      background: color-mix(in srgb, var(--ng-mylearning-category-color) 8%, var(--background-primary));
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-mylearning-category-color) 28%, transparent), 0 0 12px color-mix(in srgb, var(--ng-mylearning-category-color) 18%, transparent);
      color: var(--text-normal);
    }
    .ng-learning-note-header .ng-mynotes-pill.is-edit-target {
      border-style: dashed;
      cursor: pointer;
    }
    .ng-mylearning .ng-mylearning-category-pill.ng-mynotes-pill:not(.is-active) {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 40%, transparent);
      color: var(--text-normal);
    }
    .ng-mylearning .ng-mylearning-category-pill.ng-mynotes-pill:not(.is-active):hover {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 78%, var(--background-modifier-border));
      color: var(--text-normal);
    }
    @media (max-width: 1024px), (hover: none) {
      .ng-mynotes-categories .ng-mylearning-inline-edit {
        width: 22px;
        min-width: 22px;
        height: 22px;
        color: color-mix(in srgb, var(--text-normal) 84%, white);
      }
      .ng-mynotes-categories .ng-mylearning-inline-edit svg {
        width: 14px;
        height: 14px;
      }
    }
  `;
  document.head.appendChild(style);
}
