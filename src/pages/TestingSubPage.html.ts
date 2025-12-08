import { AccessType, Fetcher, IElementHolder, Page, RePage, Router } from "@Purper";
import { Subject } from "./TestingPage.html";
import QuestionParser from './../../tri/QuestionParser';
import ReButton from "src/components/ReButton.html";

@RePage("./src/pages/TestingSubPage.phtml",
  "./src/pages/TestingSubPage.html.css",
  "./src/pages/TestingSubPage.html.ts",
  AccessType.BOTH,
  "/testing/sub")
export default class TestingSubPage extends Page {
  private subject: Subject;
  private testModes: TestMode[] = [
    new TestMode("Быстрый тест", "Ты школьник", 5, "success"),
    new TestMode("Экзамен", "Ты студент", 25, "warning"),
    new TestMode("Мазохизм", "Ты адекватный?", null, "error"),
  ];
  private activeMode: TestMode = this.testModes[1];

  constructor(subject?: string) {
    super();
    this.subject = JSON.parse(decodeURIComponent(subject));
  }
  protected async preInit(): Promise<void> {
    
    return Promise.resolve();
  }
  private getAllParamsForTesting(): string {
    const params = {
      subject: this.subject,
      limits: this.activeMode.numQuestions,
      randomSource: null
    };
    return "/testing/actual?params=" + encodeURIComponent(JSON.stringify(params));
  }
  protected async preLoad(holder: IElementHolder): Promise<void> {
    var allConn = holder.element.querySelectorAll('.mode-item');

    // Fetch questions count for the massochism mode and update UI immediately
    // We await here so the initial render will show the correct number right after preLoad resolves.
    try {
      if (this.subject && this.subject.file) {
        const data = await Fetcher.fetchJSON('../../resources/data' + '/' + this.subject.file);
        if (data && Array.isArray(data.Questions)) {
          this.testModes[2].numQuestions = data.Questions.length;

          // Update UI chip for the masochism mode if present in DOM
          const masEl = holder.element.querySelector(`.mode-item[data-mode="${this.testModes[2].name}"]`);
          if (masEl) {
            const chip = masEl.querySelector<HTMLElement>('.mode-count');
            if (chip) chip.textContent = String(this.testModes[2].numQuestions ?? '');
          }
        }
      }
    } catch (e) {
      // non-fatal — just log
      console.warn('Failed to load questions for subject:', e);
    }
    allConn.forEach((item) => {
      item.addEventListener('click', async (event) => {
        // Use currentTarget because event.target can be a child node (span, chip, svg)
        // which would not carry the data-mode attribute — causing find() to return undefined.
        const clickedEl = (event.currentTarget || event.target) as Element | null;
        const modeName = this.getModeNameFromEvent(event, clickedEl);

        if (!modeName) {
          // nothing matched — ignore the click
          return;
        }

        const newMode = this.testModes.find(mode => mode.name === modeName);
        if (!newMode) {
          // mode not found (shouldn't happen) — ignore safely
          return;
        }

        this.activeMode = newMode;

        // apply color and variants to mode-items only when we have a valid activeMode
        allConn.forEach((el) => {
          // leave settings button untouched

          if (this.activeMode) {
            el.setAttribute('color', this.activeMode.colorP);
          }

          // set clicked one to filled, others to outlined
          const elMode = el.getAttribute('data-mode');
          if (el.classList.contains('settings-item')) return;
          if (elMode === this.activeMode.name) {
            el.setAttribute('variant', 'filled');
          } else {
            el.setAttribute('variant', 'outlined');
          }
          document.querySelector('#start-test')?.setAttribute('href', this.getAllParamsForTesting());
        });
      });
      //this.selectMode(target, target.getAttribute('data-mode')!);
    });
    // Ensure initial colors and variants reflect currently active mode

    const initialMode = this.activeMode ?? this.testModes[0];
    if (initialMode) {
      allConn.forEach((el) => {
        // leave settings button untouched

        el.setAttribute('color', initialMode.colorP);
        if (el.classList.contains('settings-item')) return;

        // active mode -> filled, others -> outlined
        const elMode = el.getAttribute('data-mode');
        if (elMode === initialMode.name) {
          el.setAttribute('variant', 'filled');
        } else {
          el.setAttribute('variant', 'outlined');
        }
      });
    }
    document.getElementById('start-test')?.setAttribute('href', this.getAllParamsForTesting());

    return Promise.resolve();
  }
  protected async postLoad(holder: IElementHolder): Promise<void> {
    document.getElementById('start-test')?.setAttribute('href', this.getAllParamsForTesting());
    return Promise.resolve();
  }

  /**
   * Extracts data-mode from an event safely.
   * Uses currentTarget first (listener host), then falls back to event.target.closest('.mode-item').
   * This avoids issues when clicking child nodes inside the button which would otherwise
   * produce null on getAttribute('data-mode') and lead to activeMode undefined.
   */
  private getModeNameFromEvent(event: Event, currentTarget: Element | null): string | null {
    const nameFromCurrent = currentTarget?.getAttribute('data-mode') ?? null;
    if (nameFromCurrent) return nameFromCurrent;

    const t = event.target as Element | null;
    const closest = t?.closest?.('.mode-item') as Element | null;
    return closest?.getAttribute('data-mode') ?? null;
  }
}
class TestMode {
  name: string;
  description: string;
  numQuestions: number;

  colorP: string;

  constructor(name: string, description: string, numQuestions: number,
    colorP: string = "primary") {
    this.name = name;
    this.description = description;
    this.numQuestions = numQuestions;
    this.colorP = colorP;
  }
}
