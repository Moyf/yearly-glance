import { BasesView, QueryController } from "obsidian";
// import YearlyGlancePlugin from "@/src/main";

// 定义视图类型
export const VIEW_TYPE_YEARLY_GLANCE_BASES = "yearly-glance-bases-view";

export class YearlyGlanceBasesView extends BasesView {
    readonly type = VIEW_TYPE_YEARLY_GLANCE_BASES;
    private containerEl: HTMLElement;

    constructor(controller: QueryController, parentEl: HTMLElement) {
        super(controller);
        this.containerEl = parentEl.createDiv("yg-bases-view-container");
    }

    // onDataUpdated is called by Obsidian whenever there is a configuration
    // or data change in the vault which may affect your view. For now,
    // simply draw "Hello World" to screen.
    public onDataUpdated(): void {
        this.containerEl.empty();
        this.containerEl.createDiv({ text: 'Hello World' });
    }
}

