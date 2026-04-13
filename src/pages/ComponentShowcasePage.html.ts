import { Page, RePage } from "@Purper";
import ReButton from "../components/ReButton.html.js";
import ReIcon from "../components/ReIcon.html.js";
import ReChip from "../components/ReChip.html.js";
import ReInput from "../components/ReInput.html.js";
import PopUp from "../components/PopUp.html.js";
import ReRangeSlider from "../components/ReRangeSlider.html.js";
import ReTypography from "../components/ReTypography.html.js";


@RePage({
    markupURL: "./src/pages/ComponentShowcasePage.hmle",
    cssURL: "./src/pages/ComponentShowcasePage.html.css",
}, "/components")
export default class ComponentShowcasePage extends Page {

    // -- Preview refs --
    private btnPreview?: ReButton;
    private iconPreview?: ReIcon;
    private chipPreview?: ReChip;
    private typoPreview?: HTMLElement;
    private inputPreview?: ReInput;
    private popupPreview?: PopUp;
    private popupTrigger?: ReButton;

    // -- ReButton controls --
    private btnVariant?: HTMLSelectElement;
    private btnColor?: HTMLSelectElement;
    private btnSize?: HTMLSelectElement;
    private btnIcon?: HTMLInputElement;
    private btnDisabled?: HTMLInputElement;
    private btnLoading?: HTMLInputElement;
    private btnFullWidth?: HTMLInputElement;

    // -- ReIcon controls --
    private iconName?: HTMLInputElement;
    private iconVariant?: HTMLSelectElement;
    private iconColor?: HTMLSelectElement;
    private iconSize?: HTMLSelectElement;
    private iconWeight?: HTMLSelectElement;
    private iconAnim?: HTMLSelectElement;

    // -- ReChip controls --
    private chipVariant?: HTMLSelectElement;
    private chipColor?: HTMLSelectElement;
    private chipSize?: HTMLSelectElement;
    private chipIcon?: HTMLInputElement;
    private chipDisabled?: HTMLInputElement;

    // -- ReTypography controls --
    private typoVariant?: HTMLSelectElement;
    private typoColor?: HTMLSelectElement;
    private typoWeight?: HTMLSelectElement;
    private typoAlign?: HTMLSelectElement;
    private typoUppercase?: HTMLInputElement;
    private typoTruncate?: HTMLInputElement;

    // -- ReInput controls --
    private inputVariant?: HTMLSelectElement;
    private inputColor?: HTMLSelectElement;
    private inputSize?: HTMLSelectElement;
    private inputType?: HTMLSelectElement;
    private inputIcon?: HTMLInputElement;
    private inputClearable?: HTMLInputElement;
    private inputDisabled?: HTMLInputElement;

    // -- ReRangeSlider refs --
    private rangePreview?: ReRangeSlider;
    private rangeValue?: ReTypography;
    private rangeVariant?: HTMLSelectElement;
    private rangeColor?: HTMLSelectElement;
    private rangeSize?: HTMLSelectElement;
    private rangeMin?: HTMLInputElement;
    private rangeMax?: HTMLInputElement;
    private rangeStep?: HTMLInputElement;
    private rangeLabels?: HTMLInputElement;
    private rangeEdgeLabels?: HTMLInputElement;
    private rangeTickMarks?: HTMLInputElement;
    private rangeDraggable?: HTMLInputElement;
    private rangeLimit?: HTMLSelectElement;
    private rangeShowValue?: HTMLInputElement;
    private rangeValueMin?: HTMLInputElement;
    private rangeValueMax?: HTMLInputElement;
    private rangeDisabled?: HTMLInputElement;

    // -- PopUp controls --
    private popupModal?: HTMLInputElement;
    private popupPlacement?: HTMLSelectElement;

    // -- helpers --
    private setAttr(el: HTMLElement, attr: string, value: string | null) {
        if (value) el.setAttribute(attr, value);
        else el.removeAttribute(attr);
    }

    private toggle(el: HTMLElement, attr: string, on: boolean) {
        if (on) el.setAttribute(attr, '');
        else el.removeAttribute(attr);
    }

    // -- ReButton playground --
    public updateButton(): void {
        const el = this.btnPreview;
        if (!el) return;
        el.Variant.setObject(this.btnVariant?.value ?? 'filled');
        el.Color.setObject(this.btnColor?.value ?? 'primary');
        el.Size.setObject(this.btnSize?.value ?? 'medium');
        el.Icon.setObject(this.btnIcon?.value || null);
        el.Disabled.setObject(this.btnDisabled?.checked ?? false);
        this.toggle(el, 'loading', this.btnLoading?.checked ?? false);
        this.toggle(el, 'full-width', this.btnFullWidth?.checked ?? false);
    }

    // -- ReIcon playground --
    public updateIcon(): void {
        const el = this.iconPreview;
        if (!el) return;
        el.Icon.setObject(this.iconName?.value ?? 'star');
        el.Variant.setObject(this.iconVariant?.value ?? 'filled');
        el.Color.setObject(this.iconColor?.value ?? 'primary');
        el.Size.setObject(this.iconSize?.value ?? 'extra-large');
        el.Weight.setObject(this.iconWeight?.value ?? '400');
        el.Animation.setObject(this.iconAnim?.value ?? 'none');
    }

    // -- ReChip playground --
    public updateChip(): void {
        const el = this.chipPreview;
        if (!el) return;
        el.Variant.setObject(this.chipVariant?.value ?? 'filled');
        el.Color.setObject(this.chipColor?.value ?? 'primary');
        el.Size.setObject(this.chipSize?.value ?? 'medium');
        el.Icon.setObject(this.chipIcon?.value || null);
        el.Disabled.setObject(this.chipDisabled?.checked ?? false);
    }

    // -- ReTypography playground --
    public updateTypo(): void {
        const el = this.typoPreview;
        if (!el) return;
        this.setAttr(el, 'variant', this.typoVariant?.value ?? 'body');
        this.setAttr(el, 'color', this.typoColor?.value ?? 'primary');
        this.setAttr(el, 'weight', this.typoWeight?.value || null);
        this.setAttr(el, 'align', this.typoAlign?.value || null);
        this.toggle(el, 'uppercase', this.typoUppercase?.checked ?? false);
        this.toggle(el, 'truncate', this.typoTruncate?.checked ?? false);
    }
    // Note: ReTypography uses observedAttributes, not Attribute objects,
    // so setAttribute works for it.

    // -- ReInput playground --
    public updateInput(): void {
        const el = this.inputPreview;
        if (!el) return;
        el.Variant.setObject(this.inputVariant?.value ?? 'outlined');
        el.Color.setObject(this.inputColor?.value ?? 'primary');
        this.setAttr(el, 'size', this.inputSize?.value ?? 'medium');
        el.Type.setObject(this.inputType?.value ?? 'text');
        this.setAttr(el, 'icon', this.inputIcon?.value || null);
        this.toggle(el, 'clearable', this.inputClearable?.checked ?? false);
        el.Disabled.setObject(this.inputDisabled?.checked ?? false);
    }

    // -- ReRangeSlider playground --
    public updateRange(): void {
        const el = this.rangePreview;
        if (!el) return;
        el.Variant.setObject(this.rangeVariant?.value ?? 'line');
        el.Color.setObject(this.rangeColor?.value ?? 'primary');
        el.Size.setObject(this.rangeSize?.value ?? 'medium');
        el.Min.setObject(Number(this.rangeMin?.value ?? 0));
        el.Max.setObject(Number(this.rangeMax?.value ?? 100));
        el.Step.setObject(Number(this.rangeStep?.value ?? 1));
        el.ShowLabels.setObject(this.rangeLabels?.checked ?? false);
        el.ShowEdgeLabels.setObject(this.rangeEdgeLabels?.checked ?? false);
        el.TickMarks.setObject(this.rangeTickMarks?.checked ?? false);
        el.Draggable.setObject(this.rangeDraggable?.checked ?? false);
        el.Limit.setObject((this.rangeLimit?.value ?? 'none') as any);
        el.ShowValue.setObject(this.rangeShowValue?.checked ?? false);
        el.ValueMin.setObject(Number(this.rangeValueMin?.value ?? 0));
        el.ValueMax.setObject(Number(this.rangeValueMax?.value ?? 0));
        el.Disabled.setObject(this.rangeDisabled?.checked ?? false);
        this.updateRangeLabel();
    }

    private updateRangeLabel(): void {
        const el = this.rangePreview;
        if (!el || !this.rangeValue) return;
        this.rangeValue.textContent = `${el.Lower.value} – ${el.Upper.value}`;
    }

    public onRangeChange(): void {
        this.updateRangeLabel();
    }

    // -- PopUp playground --
    public togglePopup(): void {
        this.popupPreview?.toggle();
    }

    public closePopup(): void {
        this.popupPreview?.close();
    }

    public updatePopup(): void {
        const el = this.popupPreview;
        if (!el) return;
        this.setAttr(el, 'modal', this.popupModal?.checked ? '' : null);
        this.setAttr(el, 'placement', this.popupPlacement?.value || null);
    }
}
