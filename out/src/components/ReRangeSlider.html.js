var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReComponent, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
let ReRangeSlider = class ReRangeSlider extends ComponentCore {
    track;
    trackFill;
    ticksContainer;
    thumbLower;
    thumbUpper;
    labelLower;
    labelUpper;
    edgeLabelMin;
    edgeLabelMax;
    valueMarker;
    inputLower;
    inputUpper;
    Min = new Attribute(this, "min", 0);
    Max = new Attribute(this, "max", 100);
    Step = new Attribute(this, "step", 1);
    Lower = new Attribute(this, "lower", 20);
    Upper = new Attribute(this, "upper", 80);
    ShowLabels = new Attribute(this, "show-labels", false);
    Variant = new Attribute(this, "variant", "line");
    TickMarks = new Attribute(this, "tick-marks", false);
    Vertical = new Attribute(this, "vertical", false);
    ShowEdgeLabels = new Attribute(this, "show-edge-labels", false);
    Draggable = new Attribute(this, "draggable-range", false);
    Limit = new Attribute(this, "limit", "none");
    ValueMin = new Attribute(this, "value-min", 0);
    ValueMax = new Attribute(this, "value-max", 0);
    ShowValue = new Attribute(this, "show-value", false);
    dragging = null;
    dragRangeStart = null;
    /** Safely read a numeric Attribute as an actual number (HTML attrs are strings). */
    num(attr) {
        return Number(attr.value) || 0;
    }
    boundPointerDown = (e) => this.onPointerDown(e);
    boundPointerMove = (e) => this.onPointerMove(e);
    boundPointerUp = (e) => this.onPointerUp(e);
    boundKeyDown = (e) => this.onKeyDown(e);
    boundFillPointerDown = (e) => this.onFillPointerDown(e);
    async preLoad(holder) {
        this.thumbLower.addEventListener("pointerdown", this.boundPointerDown);
        this.thumbUpper.addEventListener("pointerdown", this.boundPointerDown);
        this.trackFill.addEventListener("pointerdown", this.boundFillPointerDown);
        this.track.addEventListener("pointerdown", (e) => this.onTrackClick(e));
        this.thumbLower.addEventListener("keydown", this.boundKeyDown);
        this.thumbUpper.addEventListener("keydown", this.boundKeyDown);
        this.Lower.subscribe(() => this.updateUI());
        this.Upper.subscribe(() => this.updateUI());
        this.Min.subscribe(() => { this.renderTicks(); this.updateUI(); });
        this.Max.subscribe(() => { this.renderTicks(); this.updateUI(); });
        this.Step.subscribe(() => this.renderTicks());
        this.TickMarks.subscribe(() => this.renderTicks());
        this.Variant.subscribe(() => this.updateUI());
        this.Limit.subscribe(() => this.updateUI());
        this.ValueMin.subscribe(() => this.updateUI());
        this.ValueMax.subscribe(() => this.updateUI());
        this.ShowValue.subscribe(() => this.updateUI());
        this.renderTicks();
        this.updateUI();
    }
    onDisconnected() {
        document.removeEventListener("pointermove", this.boundPointerMove);
        document.removeEventListener("pointerup", this.boundPointerUp);
    }
    isLowerLocked() {
        const l = this.Limit.value;
        return l === "left" || l === "both";
    }
    isUpperLocked() {
        const l = this.Limit.value;
        return l === "right" || l === "both";
    }
    isDraggableRange() {
        return this.Draggable.value === true || this.Draggable.value === "true";
    }
    onPointerDown(e) {
        if (this.Disabled.value)
            return;
        const target = e.currentTarget;
        const which = target === this.thumbLower ? "lower" : "upper";
        if (which === "lower" && this.isLowerLocked())
            return;
        if (which === "upper" && this.isUpperLocked())
            return;
        e.preventDefault();
        this.dragging = which;
        target.classList.add("active");
        target.setPointerCapture(e.pointerId);
        target.addEventListener("pointermove", this.boundPointerMove);
        target.addEventListener("pointerup", this.boundPointerUp, { once: true });
    }
    onFillPointerDown(e) {
        if (this.Disabled.value)
            return;
        if (!this.isDraggableRange())
            return;
        if (this.isLowerLocked() && this.isUpperLocked())
            return;
        e.preventDefault();
        e.stopPropagation();
        this.dragging = "range";
        const pointerVal = this.pointerToValue(e);
        this.dragRangeStart = {
            pointerVal,
            lower: this.num(this.Lower),
            upper: this.num(this.Upper),
        };
        this.trackFill.classList.add("active");
        this.trackFill.setPointerCapture(e.pointerId);
        this.trackFill.addEventListener("pointermove", this.boundPointerMove);
        this.trackFill.addEventListener("pointerup", this.boundPointerUp, { once: true });
    }
    onPointerMove(e) {
        if (!this.dragging)
            return;
        if (this.dragging === "range") {
            this.applyRangeDrag(e);
        }
        else {
            const value = this.pointerToValue(e);
            this.applyValue(value);
        }
    }
    onPointerUp(e) {
        if (!this.dragging)
            return;
        if (this.dragging === "range") {
            this.trackFill.classList.remove("active");
            this.trackFill.removeEventListener("pointermove", this.boundPointerMove);
            this.dragRangeStart = null;
        }
        else {
            const thumb = this.dragging === "lower" ? this.thumbLower : this.thumbUpper;
            thumb.classList.remove("active");
            thumb.removeEventListener("pointermove", this.boundPointerMove);
        }
        this.dragging = null;
        this.dispatchEvent(new CustomEvent("change", {
            detail: { lower: this.Lower.value, upper: this.Upper.value },
            bubbles: true
        }));
    }
    onTrackClick(e) {
        if (this.Disabled.value)
            return;
        if (e.target === this.thumbLower || e.target === this.thumbUpper || e.target === this.trackFill)
            return;
        const value = this.pointerToValue(e);
        const lower = this.num(this.Lower);
        const upper = this.num(this.Upper);
        const distLower = Math.abs(value - lower);
        const distUpper = Math.abs(value - upper);
        let which = distLower <= distUpper ? "lower" : "upper";
        if (which === "lower" && this.isLowerLocked())
            which = "upper";
        if (which === "upper" && this.isUpperLocked())
            which = "lower";
        if ((which === "lower" && this.isLowerLocked()) || (which === "upper" && this.isUpperLocked()))
            return;
        this.dragging = which;
        this.applyValue(value);
        this.dragging = null;
        this.dispatchEvent(new CustomEvent("change", {
            detail: { lower: this.Lower.value, upper: this.Upper.value },
            bubbles: true
        }));
    }
    onKeyDown(e) {
        if (this.Disabled.value)
            return;
        const target = e.currentTarget;
        const which = target === this.thumbLower ? "lower" : "upper";
        if (which === "lower" && this.isLowerLocked())
            return;
        if (which === "upper" && this.isUpperLocked())
            return;
        const step = this.num(this.Step) || 1;
        const attr = which === "lower" ? this.Lower : this.Upper;
        let val = this.num(attr);
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            val -= step;
        }
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            val += step;
        }
        else if (e.key === "Home") {
            e.preventDefault();
            val = this.num(this.Min);
        }
        else if (e.key === "End") {
            e.preventDefault();
            val = this.num(this.Max);
        }
        else {
            return;
        }
        this.dragging = which;
        this.applyValue(val);
        this.dragging = null;
        this.dispatchEvent(new CustomEvent("change", {
            detail: { lower: this.Lower.value, upper: this.Upper.value },
            bubbles: true
        }));
    }
    pointerToValue(e) {
        const rect = this.track.getBoundingClientRect();
        const isVertical = this.Vertical.value === true || this.Vertical.value === "true";
        const ratio = isVertical
            ? Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))
            : Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const min = this.num(this.Min);
        const max = this.num(this.Max);
        const step = this.num(this.Step) || 1;
        const raw = min + ratio * (max - min);
        return Math.round(raw / step) * step;
    }
    renderTicks() {
        const container = this.ticksContainer;
        if (!container)
            return;
        container.innerHTML = "";
        const showTicks = this.TickMarks.value === true || this.TickMarks.value === "true";
        if (!showTicks)
            return;
        const min = this.num(this.Min);
        const max = this.num(this.Max);
        const step = this.num(this.Step) || 1;
        const range = max - min || 1;
        const isVertical = this.Vertical.value === true || this.Vertical.value === "true";
        for (let v = min; v <= max; v += step) {
            const pct = ((v - min) / range) * 100;
            const tick = document.createElement("span");
            tick.className = "slider-tick";
            if (isVertical) {
                tick.style.bottom = `${pct}%`;
            }
            else {
                tick.style.left = `${pct}%`;
            }
            container.appendChild(tick);
        }
    }
    applyRangeDrag(e) {
        if (!this.dragRangeStart)
            return;
        const currentVal = this.pointerToValue(e);
        const delta = currentVal - this.dragRangeStart.pointerVal;
        const min = this.num(this.Min);
        const max = this.num(this.Max);
        let newLower = this.dragRangeStart.lower + delta;
        let newUpper = this.dragRangeStart.upper + delta;
        // Clamp to bounds
        if (newLower < min) {
            newUpper += (min - newLower);
            newLower = min;
        }
        if (newUpper > max) {
            newLower -= (newUpper - max);
            newUpper = max;
        }
        newLower = Math.max(min, newLower);
        newUpper = Math.min(max, newUpper);
        // Respect step
        const step = this.num(this.Step) || 1;
        newLower = Math.round(newLower / step) * step;
        newUpper = Math.round(newUpper / step) * step;
        if (!this.isLowerLocked())
            this.Lower.setObject(newLower);
        if (!this.isUpperLocked())
            this.Upper.setObject(newUpper);
    }
    applyValue(val) {
        const min = this.num(this.Min);
        const max = this.num(this.Max);
        const vMin = this.num(this.ValueMin);
        const vMax = this.num(this.ValueMax);
        val = Math.max(min, Math.min(max, val));
        if (this.dragging === "lower") {
            const upper = this.num(this.Upper);
            let lower = Math.min(val, upper);
            // Don't let span shrink below value-min
            if (vMin > 0 && (upper - lower) < vMin)
                lower = upper - vMin;
            // Don't let span grow above value-max
            if (vMax > 0 && (upper - lower) > vMax)
                lower = upper - vMax;
            lower = Math.max(min, lower);
            this.Lower.setObject(lower);
        }
        else if (this.dragging === "upper") {
            const lower = this.num(this.Lower);
            let upper = Math.max(val, lower);
            // Don't let span shrink below value-min
            if (vMin > 0 && (upper - lower) < vMin)
                upper = lower + vMin;
            // Don't let span grow above value-max
            if (vMax > 0 && (upper - lower) > vMax)
                upper = lower + vMax;
            upper = Math.min(max, upper);
            this.Upper.setObject(upper);
        }
    }
    updateUI() {
        const min = this.num(this.Min);
        const max = this.num(this.Max);
        const lower = this.num(this.Lower);
        const upper = this.num(this.Upper);
        const range = max - min || 1;
        const isVertical = this.Vertical.value === true || this.Vertical.value === "true";
        const lowerPct = ((lower - min) / range) * 100;
        const upperPct = ((upper - min) / range) * 100;
        if (isVertical) {
            this.trackFill.style.left = "";
            this.trackFill.style.width = "";
            this.thumbLower.style.left = "";
            this.thumbUpper.style.left = "";
            this.trackFill.style.bottom = `${lowerPct}%`;
            this.trackFill.style.height = `${upperPct - lowerPct}%`;
            this.thumbLower.style.bottom = `${lowerPct}%`;
            this.thumbUpper.style.bottom = `${upperPct}%`;
        }
        else {
            this.trackFill.style.bottom = "";
            this.trackFill.style.height = "";
            this.thumbLower.style.bottom = "";
            this.thumbUpper.style.bottom = "";
            this.trackFill.style.left = `${lowerPct}%`;
            this.trackFill.style.width = `${upperPct - lowerPct}%`;
            this.thumbLower.style.left = `${lowerPct}%`;
            this.thumbUpper.style.left = `${upperPct}%`;
        }
        this.labelLower.textContent = String(lower);
        this.labelUpper.textContent = String(upper);
        this.inputLower.value = String(lower);
        this.inputUpper.value = String(upper);
        this.edgeLabelMin.textContent = String(min);
        this.edgeLabelMax.textContent = String(max);
        // Value marker (shows range span = upper - lower)
        const rangeSpan = upper - lower;
        const midPct = (lowerPct + upperPct) / 2;
        const markerLabel = this.valueMarker.querySelector(".slider-value-marker-label");
        markerLabel.textContent = String(rangeSpan);
        if (isVertical) {
            this.valueMarker.style.left = "";
            this.valueMarker.style.bottom = `${midPct}%`;
        }
        else {
            this.valueMarker.style.bottom = "";
            this.valueMarker.style.left = `${midPct}%`;
        }
        // Limit visual state
        this.thumbLower.classList.toggle("locked", this.isLowerLocked());
        this.thumbUpper.classList.toggle("locked", this.isUpperLocked());
        // ARIA
        this.thumbLower.setAttribute("aria-valuenow", String(lower));
        this.thumbLower.setAttribute("aria-valuemin", String(min));
        this.thumbLower.setAttribute("aria-valuemax", String(upper));
        this.thumbLower.setAttribute("role", "slider");
        this.thumbLower.setAttribute("aria-orientation", isVertical ? "vertical" : "horizontal");
        this.thumbUpper.setAttribute("aria-valuenow", String(upper));
        this.thumbUpper.setAttribute("aria-valuemin", String(lower));
        this.thumbUpper.setAttribute("aria-valuemax", String(max));
        this.thumbUpper.setAttribute("role", "slider");
        this.thumbUpper.setAttribute("aria-orientation", isVertical ? "vertical" : "horizontal");
    }
};
ReRangeSlider = __decorate([
    ReComponent({
        markupURL: "./src/components/ReRangeSlider.hmle",
        cssURL: "./out/src/components/ReRangeSlider.html.css",
    }, "re-range-slider")
], ReRangeSlider);
export default ReRangeSlider;
//# sourceMappingURL=ReRangeSlider.html.js.map