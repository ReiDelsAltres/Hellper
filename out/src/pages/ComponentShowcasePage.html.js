var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Page, RePage } from "@Purper";
let ComponentShowcasePage = class ComponentShowcasePage extends Page {
    // -- Preview refs --
    btnPreview;
    iconPreview;
    chipPreview;
    typoPreview;
    inputPreview;
    popupPreview;
    popupTrigger;
    // -- ReButton controls --
    btnVariant;
    btnColor;
    btnSize;
    btnIcon;
    btnDisabled;
    btnLoading;
    btnFullWidth;
    // -- ReIcon controls --
    iconName;
    iconVariant;
    iconColor;
    iconSize;
    iconWeight;
    iconAnim;
    // -- ReChip controls --
    chipVariant;
    chipColor;
    chipSize;
    chipIcon;
    chipDisabled;
    // -- ReTypography controls --
    typoVariant;
    typoColor;
    typoWeight;
    typoAlign;
    typoUppercase;
    typoTruncate;
    // -- ReInput controls --
    inputVariant;
    inputColor;
    inputSize;
    inputType;
    inputIcon;
    inputClearable;
    inputDisabled;
    // -- ReRangeSlider refs --
    rangePreview;
    rangeValue;
    rangeVariant;
    rangeColor;
    rangeSize;
    rangeMin;
    rangeMax;
    rangeStep;
    rangeLabels;
    rangeEdgeLabels;
    rangeTickMarks;
    rangeDraggable;
    rangeLimit;
    rangeShowValue;
    rangeValueMin;
    rangeValueMax;
    rangeDisabled;
    // -- PopUp controls --
    popupModal;
    popupPlacement;
    // -- helpers --
    setAttr(el, attr, value) {
        if (value)
            el.setAttribute(attr, value);
        else
            el.removeAttribute(attr);
    }
    toggle(el, attr, on) {
        if (on)
            el.setAttribute(attr, '');
        else
            el.removeAttribute(attr);
    }
    // -- ReButton playground --
    updateButton() {
        const el = this.btnPreview;
        if (!el)
            return;
        el.Variant.setObject(this.btnVariant?.value ?? 'filled');
        el.Color.setObject(this.btnColor?.value ?? 'primary');
        el.Size.setObject(this.btnSize?.value ?? 'medium');
        el.Icon.setObject(this.btnIcon?.value || null);
        el.Disabled.setObject(this.btnDisabled?.checked ?? false);
        this.toggle(el, 'loading', this.btnLoading?.checked ?? false);
        this.toggle(el, 'full-width', this.btnFullWidth?.checked ?? false);
    }
    // -- ReIcon playground --
    updateIcon() {
        const el = this.iconPreview;
        if (!el)
            return;
        el.Icon.setObject(this.iconName?.value ?? 'star');
        el.Variant.setObject(this.iconVariant?.value ?? 'filled');
        el.Color.setObject(this.iconColor?.value ?? 'primary');
        el.Size.setObject(this.iconSize?.value ?? 'extra-large');
        el.Weight.setObject(this.iconWeight?.value ?? '400');
        el.Animation.setObject(this.iconAnim?.value ?? 'none');
    }
    // -- ReChip playground --
    updateChip() {
        const el = this.chipPreview;
        if (!el)
            return;
        el.Variant.setObject(this.chipVariant?.value ?? 'filled');
        el.Color.setObject(this.chipColor?.value ?? 'primary');
        el.Size.setObject(this.chipSize?.value ?? 'medium');
        el.Icon.setObject(this.chipIcon?.value || null);
        el.Disabled.setObject(this.chipDisabled?.checked ?? false);
    }
    // -- ReTypography playground --
    updateTypo() {
        const el = this.typoPreview;
        if (!el)
            return;
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
    updateInput() {
        const el = this.inputPreview;
        if (!el)
            return;
        el.Variant.setObject(this.inputVariant?.value ?? 'outlined');
        el.Color.setObject(this.inputColor?.value ?? 'primary');
        this.setAttr(el, 'size', this.inputSize?.value ?? 'medium');
        el.Type.setObject(this.inputType?.value ?? 'text');
        this.setAttr(el, 'icon', this.inputIcon?.value || null);
        this.toggle(el, 'clearable', this.inputClearable?.checked ?? false);
        el.Disabled.setObject(this.inputDisabled?.checked ?? false);
    }
    // -- ReRangeSlider playground --
    updateRange() {
        const el = this.rangePreview;
        if (!el)
            return;
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
        el.Limit.setObject((this.rangeLimit?.value ?? 'none'));
        el.ShowValue.setObject(this.rangeShowValue?.checked ?? false);
        el.ValueMin.setObject(Number(this.rangeValueMin?.value ?? 0));
        el.ValueMax.setObject(Number(this.rangeValueMax?.value ?? 0));
        el.Disabled.setObject(this.rangeDisabled?.checked ?? false);
        this.updateRangeLabel();
    }
    updateRangeLabel() {
        const el = this.rangePreview;
        if (!el || !this.rangeValue)
            return;
        this.rangeValue.textContent = `${el.Lower.value} – ${el.Upper.value}`;
    }
    onRangeChange() {
        this.updateRangeLabel();
    }
    // -- PopUp playground --
    togglePopup() {
        this.popupPreview?.toggle();
    }
    closePopup() {
        this.popupPreview?.close();
    }
    updatePopup() {
        const el = this.popupPreview;
        if (!el)
            return;
        this.setAttr(el, 'modal', this.popupModal?.checked ? '' : null);
        this.setAttr(el, 'placement', this.popupPlacement?.value || null);
    }
};
ComponentShowcasePage = __decorate([
    RePage({
        markupURL: "./src/pages/ComponentShowcasePage.hmle",
        cssURL: "./src/pages/ComponentShowcasePage.html.css",
    }, "/components")
], ComponentShowcasePage);
export default ComponentShowcasePage;
//# sourceMappingURL=ComponentShowcasePage.html.js.map