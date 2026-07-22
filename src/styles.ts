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
    .ng-home-category-button,
    .ng-journal-nav-button,
    .ng-journal-mode-button,
    .ng-journal-create-button,
    .ng-journal-tracker-add {
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
    .ng-journal-create-button,
    .ng-journal-tracker-add {
      width: auto;
    }
    .ng-home-category-button:hover,
    .ng-journal-nav-button:hover,
    .ng-journal-mode-button:hover,
    .ng-journal-create-button:hover,
    .ng-journal-tracker-add:hover {
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
    .ng-journal-tracker-cell {
      border: 1px solid var(--background-modifier-border);
      background: transparent;
      color: var(--text-normal);
      cursor: pointer;
      border-radius: 10px;
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
      background: color-mix(in srgb, var(--background-primary) 84%, transparent);
    }
    .ng-journal-calendar-panel,
    .ng-journal-detail-panel,
    .ng-journal-trackers,
    .ng-journal-entry-card {
      background: color-mix(in srgb, var(--background-primary) 36%, transparent);
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
      background: color-mix(in srgb, var(--background-primary) 88%, transparent);
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
      background: color-mix(in srgb, var(--background-primary) 82%, transparent);
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
      background: color-mix(in srgb, var(--background-primary) 82%, transparent);
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.18);
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
    .ng-journal-tasks > h4,
    .ng-journal-task-group h5 {
      text-align: center;
      color: var(--text-normal);
    }
    .ng-journal-emotions h4,
    .ng-journal-tasks > h4 {
      font-size: 1.2rem;
      margin: 0;
    }
    .ng-journal-entry-page .ng-journal-emotions h4 {
      font-size: 1.56rem;
    }
    .ng-journal-entry-page .ng-journal-tasks > h4 {
      font-size: 1.56rem;
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
    .ng-journal-emotion-button,
    .ng-journal-tracker-cell {
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
      border-color: color-mix(in srgb, #39e05a 60%, black 40%);
    }
    .ng-journal-emotion-button.unpleasant:not(.is-active) {
      border-color: color-mix(in srgb, #ff6565 60%, black 40%);
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
    .ng-journal-tracker-create-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
    }
    .ng-journal-tracker-name {
      border: 1px solid var(--background-modifier-border);
      background: var(--background-primary);
      color: var(--text-normal);
      border-radius: 10px;
      padding: 8px 10px;
      width: 100%;
    }
    .ng-journal-tracker-list {
      display: grid;
      gap: 10px;
    }
    .ng-journal-tracker-row {
      display: grid;
      grid-template-columns: minmax(140px, 170px) minmax(0, 1fr);
      gap: 10px;
      align-items: center;
    }
    .ng-journal-tracker-label {
      border: 1px solid;
      border-radius: 10px;
      padding: 8px 10px;
      font-weight: 600;
      position: sticky;
      left: 0;
      z-index: 1;
      background: color-mix(in srgb, var(--background-primary) 92%, transparent);
    }
    .ng-journal-tracker-label-empty {
      border-color: transparent;
      background: transparent;
      box-shadow: none;
    }
    .ng-journal-tracker-cells {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 6px;
    }
    .ng-journal-tracker-header {
      position: sticky;
      top: 0;
      z-index: 2;
      padding-bottom: 4px;
      background: color-mix(in srgb, var(--background-primary) 92%, transparent);
      backdrop-filter: blur(6px);
    }
    .ng-journal-tracker-header-cell {
      min-height: 54px;
      display: grid;
      place-items: center;
      border: 1px solid var(--background-modifier-border);
      border-radius: 10px;
      background: transparent;
      color: var(--text-normal);
    }
    .ng-journal-tracker-cell {
      position: relative;
      min-height: 54px;
      display: grid;
      place-items: center;
      transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease;
    }
    .ng-journal-tracker-cell.is-active {
      border-style: solid;
    }
    .ng-journal-tracker-cell.is-streak-start {
      border-top-left-radius: 999px;
      border-bottom-left-radius: 999px;
    }
    .ng-journal-tracker-cell.is-streak-mid {
      border-radius: 0;
    }
    .ng-journal-tracker-cell.is-streak-end {
      border-top-right-radius: 999px;
      border-bottom-right-radius: 999px;
    }
    .ng-journal-tracker-cell:hover {
      transform: translateY(-1px);
    }
    .ng-journal-tracker-day {
      font-size: 0.85rem;
      font-weight: 600;
    }
    .ng-journal-tracker-streak {
      position: absolute;
      bottom: 6px;
      right: 6px;
      font-size: 0.72rem;
      color: var(--text-muted);
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
      gap: 10px;
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
    .ng-journal-task-badge {
      margin-left: 2px;
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
      border: 1px solid rgba(236, 154, 99, 0.28);
      border-bottom-color: rgba(236, 154, 99, 0.28);
      border-radius: 14px;
      background: color-mix(in srgb, var(--background-primary) 28%, transparent);
      padding: 14px 14px 18px;
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
    @media (max-width: 900px) {
      .ng-journal-layout {
        grid-template-columns: 1fr;
      }
      .ng-journal-tracker-row {
        grid-template-columns: 1fr;
      }
      .ng-journal-tracker-label {
        position: static;
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
  `;
  document.head.appendChild(style);
}
