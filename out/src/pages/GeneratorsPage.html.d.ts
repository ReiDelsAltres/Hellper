import { Page, TemplateHolder } from "@Purper";
/** A question picked into one of the drop zones — plain text only (no KaTeX) for safe chip display. */
interface PickedItem {
    id: string;
    title: string;
}
/** View model for the saved-presets list. */
interface PresetView {
    id: string;
    name: string;
    subjectName: string;
    countLabel: string;
    requiredLabel: string;
    excludedLabel: string;
}
export default class GeneratorsPage extends Page {
    private subjectOptions;
    private librarySemesters;
    private selectedSubject;
    /** All questions of the selected subject, mapped for QuestionComponent (KaTeX-rendered). */
    private subjectModels;
    /** Plain-text lookup (id → {id, title}) for drop-zone chips. */
    private plainById;
    private requiredIds;
    private excludedIds;
    private editingPresetId;
    private libraryModels;
    private requiredItems;
    private excludedItems;
    private presetList;
    private editorTitle;
    private statusText;
    private presetCountText;
    private requiredCountText;
    private excludedCountText;
    private libraryCountText;
    private hasPresets;
    private noPresets;
    private hasSubject;
    private noSubject;
    private favoritesView;
    private favoritesCountText;
    private hasFavorites;
    private noFavorites;
    private defaultPresets;
    private hasDefaultPresets;
    /** Map preset ID → filename for loading. */
    private defaultPresetFilenames;
    private nameInput?;
    private testTypeGroup?;
    private noShuffleCheckbox?;
    private countInput?;
    private rangeSlider?;
    private searchInput?;
    private librarySemesterSelect?;
    private librarySubjectSelect?;
    private libraryContainer?;
    private favoritesContainer?;
    private requiredZone?;
    private excludedZone?;
    private importFileInput?;
    protected preInit(): Promise<void>;
    protected postLoad(holder: TemplateHolder): Promise<void>;
    private populateSemesterSelect;
    private populateSubjectSelect;
    onLibrarySemesterChange(): void;
    onLibrarySubjectChange(): void;
    /** Fetch a subject's questions and (re)build the library. `reset` clears current picks. */
    private loadSubject;
    /** Build the (filtered + capped) library and feed each QuestionComponent its data. */
    private renderLibrary;
    /** After the <for> re-renders, push the data into each <question-component> positionally. */
    private bindLibrary;
    /** Re-sync star state on visible library cards without re-rendering them. */
    private syncLibraryStars;
    private refreshFavorites;
    private bindFavorites;
    onFavoriteToggle(e: CustomEvent, element: HTMLElement): void;
    onSearchInput(): void;
    /** ReCheckbox is "controlled" — reflect the user's toggle back onto its checked state. */
    onNoShuffleToggle(event: CustomEvent): void;
    private toModel;
    private wireDropZone;
    private readDragId;
    private addRequired;
    private addExcluded;
    removeRequired(item: PickedItem): void;
    removeExcluded(item: PickedItem): void;
    private refreshZones;
    private syncRangeDefaults;
    private syncRangeValueMarker;
    private clampCountToRange;
    private syncTestTypeVisual;
    newPreset(): void;
    savePreset(): void;
    deletePreset(view: PresetView): void;
    loadPreset(view: PresetView): Promise<void>;
    private refreshPresetList;
    /** Run a saved preset directly from the list. */
    runPreset(view: PresetView): void;
    runDefaultPreset(presetId: string): Promise<void>;
    private readSelection;
    private launch;
    private truncate;
    exportPreset(): void;
    importPreset(): void;
    private loadDefaultPresets;
    loadDefaultPreset(presetId: string): Promise<void>;
}
export {};
//# sourceMappingURL=GeneratorsPage.html.d.ts.map