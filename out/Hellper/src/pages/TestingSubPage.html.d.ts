import { IElementHolder, Page } from "@Purper";
export default class TestingSubPage extends Page {
    private subject;
    private testModes;
    private activeMode;
    private activeTestType;
    private inputTestType?;
    private inputStartFrom?;
    private inputQuestionCount?;
    private inputNoShuffle?;
    private inputEndAt?;
    private totalQuestions;
    private modeElements?;
    constructor(subject?: string);
    private getAllParamsForTesting;
    protected preLoad(holder: IElementHolder): Promise<void>;
    protected postLoad(holder: IElementHolder): Promise<void>;
    /**
     * Extracts data-mode from an event safely.
     * Uses currentTarget first (listener host), then falls back to event.target.closest('.mode-item').
     * This avoids issues when clicking child nodes inside the button which would otherwise
     * produce null on getAttribute('data-mode') and lead to activeMode undefined.
     */
    private getModeNameFromEvent;
}
//# sourceMappingURL=TestingSubPage.html.d.ts.map