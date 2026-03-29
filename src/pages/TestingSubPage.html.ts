import { AccessType, Fetcher, IElementHolder, Page, RePage, Router, TemplateHolder, Observable } from "@Purper";
import { Subject } from "../frac/Testing.js";
import ReButton from "../components/ReButton.html.js";
import ReButtonGroup from "../components/ReButtonGroup.html.js";
import ReInput from "../components/ReInput.html.js";
import ReCheckbox from "src/components/ReCheckbox.html.js";
import Paper from "src/components/PaperComponent.html.js";
import TestingActualPage from "./TestingActualPage.html.js";


@RePage({
  markupURL: "./src/pages/TestingSubPage.hmle",
  cssURL: "./src/pages/TestingSubPage.html.css",
  jsURL: "./src/pages/TestingSubPage.html.ts",
}, "/testing/sub")
export default class TestingSubPage extends Page {
  private subject: Subject;
  private testModes: TestMode[] = [
    { signature: "fast", name: "Быстрый тест", description: "Ты школьник", numQuestions: new Observable(5), colorP: "success" },
    { signature: "normal", name: "Экзамен", description: "Ты студент", numQuestions: new Observable(25), colorP: "warning" },
    { signature: "hard", name: "Мазохизм", description: "Ты адекватный?", numQuestions: new Observable(0), colorP: "error" },
  ];
  private testModesGroup?: ReButtonGroup;
  private modeSettingsButton?: ReButton;

  private optionBlock?: Paper;

  private inputTestType?: ReButtonGroup;

  private inputMin?: ReInput;
  private inputVal?: ReInput;
  private inputMax?: ReInput;

  private inputNoShuffle?: ReCheckbox;
  private noShuffle: boolean = false;
  private modeElements?: NodeListOf<Element>;

  private startTestButton?: ReButton;

  constructor(subject?: string) {
    super();
    this.subject = JSON.parse(decodeURIComponent(subject));
  }

  protected async preLoad(holder: TemplateHolder): Promise<void> {
    const result = await Fetcher.fetchJSON('./resources/data' + '/' + this.subject.file);
    this.testModes[2].numQuestions.setObject(result.Questions.length);
  }
  protected async postLoad(holder: TemplateHolder): Promise<void> {
    this.updateTestModeGroup(this.testModesGroup?.buttonMap);
    this.updateTestTypeChange(this.inputTestType?.buttonMap);

    const totalQuestions = this.testModes[2].numQuestions.getObject() || 300;

    // Set initial bounds for range inputs
    this.inputMin?.Min.setObject(1);
    this.inputMin?.Max.setObject(totalQuestions);
    this.inputMax?.Min.setObject(1);
    this.inputMax?.Max.setObject(totalQuestions);

    this.inputMin?.Value.subscribe((key, old, value) => {
      const minVal = parseInt(value) || 1;
      this.inputMax?.Min.setObject(minVal);
    });
    this.inputMax?.Value.subscribe((key, old, value) => {
      const maxVal = parseInt(value) || totalQuestions;
      this.inputMin?.Max.setObject(maxVal);
    });
  }

  public onSelectionChange(event: CustomEvent<{}>): void {
    this.updateTestModeGroup((event.detail as any).buttons as Map<ReButton, boolean>);
  }
  public onTestTypeChange(event: CustomEvent<{}>): void {
    this.updateTestTypeChange((event.detail as any).buttons as Map<ReButton, boolean>);
  }
  public updateTestTypeChange(buttons: Map<ReButton, boolean>): void {
    buttons.forEach((isSelected, btn) => {
      if (isSelected) {
        btn.Variant.setObject('filled');
      } else {
        btn.Variant.setObject('outlined');
      }
    });
  }
  public updateTestModeGroup(buttons: Map<ReButton, boolean>): void {
    const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
    const color = activeMode?.colorP || 'primary';
    buttons.forEach((selected, btn) => {
      btn.Color.setObject(color);
      if (selected) {
        btn.Variant.setObject('filled');
      } else {
        btn.Variant.setObject('outlined');
      }
    });
    this.modeSettingsButton?.Color.setObject(color);
    this.optionBlock?.Color.setObject(color);

    this.inputVal?.Value.setObject(activeMode?.numQuestions.getObject().toString());
  }

  public startTest(): void {
    const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
    const limits = parseInt(this.inputVal?.Value.value as string) || activeMode?.numQuestions.getObject() || 25;
    const startFrom = parseInt(this.inputMin?.Value.value as string) - 1 || 0;
    const endAt = parseInt(this.inputMax?.Value.value as string) || undefined;
    const testType = this.inputTestType?.Value.value || 'main';
    const noShuffle = this.inputNoShuffle?.hasAttribute('checked') ?? false;

    const params = {
      subject: this.subject,
      type: activeMode?.signature ?? 'normal',
      limits,
      startFrom,
      endAt,
      randomSource: null,
      noShuffle,
      testType
    };

    const paramsStr = encodeURIComponent(JSON.stringify(params));
    Router.tryRouteTo(new URL(Fetcher.resolveUrl('/testing/actual?params=' + paramsStr)), true);
  }
}
interface TestMode {
  signature: string;
  name: string;
  description: string;
  numQuestions: Observable<number | null>;
  colorP: string;
}
