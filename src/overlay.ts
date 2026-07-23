export interface OverlayHandle {
  card: HTMLElement;
  close: () => void;
}

export function openOverlay(title: string): OverlayHandle {
  const overlay = document.body.createDiv({ cls: "ng-overlay" });
  const card = overlay.createDiv({ cls: "ng-overlay-card" });
  card.createEl("h3", { text: title, cls: "ng-overlay-title" });

  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKeyDown);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      close();
    }
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      close();
    }
  });
  document.addEventListener("keydown", onKeyDown);

  return { card, close };
}
