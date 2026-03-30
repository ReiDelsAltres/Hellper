import { Page, TemplateHolder } from "@Purper";
export default class TestingActualPage extends Page {
    private params;
    private questions;
    private statuses;
    private selectedAnswers;
    private isExamMode;
    constructor(params?: string);
    dispose(): Promise<void>;
    protected preInit(): Promise<void>;
    protected postLoad(holder: TemplateHolder): Promise<void>;
    private resolveEnding;
    /**
     * Build a ring of lights around the tree with count equal to number of questions
     * and mark first `correct` lights as active (green). Caps total lights to avoid huge DOM.
     */
    private updateChristmasLights;
    closeResult(): void;
    handleClick(event: Event, element: HTMLElement, params: {
        qidx: number;
        aidx: number;
        c0: string;
        c1: string;
        c2: string;
    }): void;
    /**
     * РџРѕРєР°Р·Р°С‚СЊ popup РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ Р·Р°РІРµСЂС€РµРЅРёСЏ СЌРєР·Р°РјРµРЅР°
     */
    finishExam(): void;
    /**
     * РћС‚РјРµРЅРёС‚СЊ Р·Р°РІРµСЂС€РµРЅРёРµ СЌРєР·Р°РјРµРЅР°
     */
    cancelFinish(): void;
    /**
     * РџРѕРґС‚РІРµСЂРґРёС‚СЊ Р·Р°РІРµСЂС€РµРЅРёРµ СЌРєР·Р°РјРµРЅР° - РїРѕРєР°Р·Р°С‚СЊ РІСЃРµ СЂРµР·СѓР»СЊС‚Р°С‚С‹
     */
    confirmFinish(): void;
    private regenerateShuffle;
}
//# sourceMappingURL=TestingActualPage.html.d.ts.map