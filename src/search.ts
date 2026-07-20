import { App, TFile } from "obsidian";
import { NOTES_FOLDER } from "./constants";
import { normalizeFrontmatterTags } from "./taskState";

export async function searchNotesInFolder(app: App, query: string, maxResults = 20): Promise<TFile[]> {
  if (query.trim().length < 2) {
    return [];
  }

  const files = app.vault.getFiles().filter((file) => file.path.startsWith(`${NOTES_FOLDER}/`));
  if (files.length === 0) {
    return [];
  }

  const q = query.toLowerCase();
  const matches: TFile[] = [];

  for (const file of files) {
    const fromName = file.basename.toLowerCase().includes(q) || file.path.toLowerCase().includes(q);
    const cache = app.metadataCache.getFileCache(file);
    const tags = [
      ...(cache?.tags?.map((tag) => tag.tag.toLowerCase()) ?? []),
      ...normalizeFrontmatterTags(cache?.frontmatter?.tags),
    ];
    const fromTags = tags.some((tag) => tag.includes(q));

    let fromContent = false;
    if (!fromName && !fromTags) {
      const content = await app.vault.cachedRead(file);
      fromContent = content.toLowerCase().includes(q);
    }

    if (fromName || fromTags || fromContent) {
      matches.push(file);
    }

    if (matches.length >= maxResults) {
      break;
    }
  }

  return matches;
}
