import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'darkMode';
  readonly darkMode = signal(false);

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  initialize(): void {
    const enabled = this.readStoredPreference();
    this.apply(enabled);
  }

  toggle(): void {
    const enabled = !this.darkMode();
    this.apply(enabled);

    try {
      this.document.defaultView?.localStorage.setItem(this.storageKey, String(enabled));
    } catch {
      // O tema continua funcionando quando o armazenamento do navegador está indisponível.
    }
  }

  private readStoredPreference(): boolean {
    try {
      return this.document.defaultView?.localStorage.getItem(this.storageKey) === 'true';
    } catch {
      return false;
    }
  }

  private apply(enabled: boolean): void {
    this.darkMode.set(enabled);
    this.document.documentElement.classList.toggle('dark', enabled);
    this.document.documentElement.style.colorScheme = enabled ? 'dark' : 'light';
  }
}
