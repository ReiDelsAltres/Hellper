import { AccessType, Fetcher, IElementHolder, Page, RePage, Router, TemplateHolder, Observable } from "@Purper";
import { Subject } from "./TestingPage.html";
import ReButton from "../components/ReButton.html.js";
import ReButtonGroup from "../components/ReButtonGroup.html.js";
import ReInput from "../components/ReInput.html.js";
import ReCheckbox from "src/components/ReCheckbox.html.js";
import Paper from "src/components/PaperComponent.html.js";


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

    this.inputMin?.Value.subscribe((key, old, value) => {
      const minVal = parseInt(value || '1');
      const maxVal = parseInt(this.inputMax?.Value.value || '300');

      this.inputVal?.Max.setObject(maxVal - minVal);
      this.inputMax?.Min.setObject(minVal + 1);
    });
    this.inputMax?.Value.subscribe((key, old, value) => {
      const maxVal = parseInt(value || '300');
      const minVal = parseInt(this.inputMin?.Value.value || '1');

      this.inputVal?.Max.setObject(maxVal - minVal);
      this.inputMin?.Max.setObject(maxVal - 1);
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
    this.inputVal?.Max.setObject(activeMode?.numQuestions.getObject());
  }
}
interface TestMode {
  signature: string;
  name: string;
  description: string;
  numQuestions: Observable<number | null>;
  colorP: string;
}
