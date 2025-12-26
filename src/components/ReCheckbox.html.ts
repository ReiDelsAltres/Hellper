import { IElementHolder, Component, ReComponent, Attribute } from "@Purper";

@ReComponent({
    markupURL: "./src/components/ReCheckbox.hmle",
    cssURL: "./src/components/ReCheckbox.html.css",
    jsURL: "./src/components/ReCheckbox.html.ts",
}, "re-checkbox")
export default class ReCheckbox extends Component {
    private box?: HTMLElement;
    private labelEl?: HTMLElement;

    public checked = new Attribute<boolean>(this, 'checked');
    public indeterminate = new Attribute<boolean>(this, 'indeterminate');
    public disabled = new Attribute<boolean>(this, 'disabled');

    public color = new Attribute<string>(this, 'color');
    public size = new Attribute<string>(this, 'size');
    public label = new Attribute<string>(this, 'label')
    public name = new Attribute<string>(this, 'name');
    public mini = new Attribute<boolean>(this, 'mini');

    protected async preLoad(holder: IElementHolder): Promise<void> {
        this.labelEl.textContent = this.label.value;
        this.label.subscribe((name,oldValue,newValue) => this.labelEl.textContent = newValue);
        
        this.addEventListener('click', this.handleClick.bind(this));
    }
    private handleClick(event: MouseEvent) {
        if (this.disabled.value) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        if (this.indeterminate.value) this.indeterminate.value = false;
        this.checked.value = !this.checked.value;
    }
}
