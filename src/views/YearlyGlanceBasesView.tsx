import { BasesView, CachedMetadata, Keymap, parsePropertyId, QueryController } from "obsidian";
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
    // or data change in the vault which may affect your view.
    public onDataUpdated(): void {
        const { app } = this;
        
        // Retrieve the user configured order set in the Properties menu.
        const order = this.config.getOrder()

        // Clear entries created by previous iterations. Remember, you should
        // instead attempt element reuse when possible.
        this.containerEl.empty();

        // 读取配置
        const propTitle = String(this.config.get('propTitle') || 'title');
        const propDate = String(this.config.get('propDate') || 'date');

        this.containerEl.createDiv({ text: 'Hello Bases View 😄' });
        this.containerEl.createDiv({ text: `当前的配置: 标题属性=${propTitle}, 日期属性=${propDate}` });
        console.log(propTitle, propDate);
        console.log("----------------------")

        console.log("%cYearlyGlanceBasesView onDataUpdated", 'color: yellow; font-weight: bold;');
        console.log(this.config);
        console.log(this.data);

        // this.data contains both grouped and ungrouped versions of the data.
        // If it's appropriate for your view type, use the grouped form.
        for (const group of this.data.groupedData) {
            // 首先过滤出有效的条目
            const validEntries: Array<{
                entry: (typeof group.entries)[0];
                metadata: CachedMetadata | null;
                formattedDate: string;
                fileName: string;
            }> = [];
            
            for (const entry of group.entries) {
                // 预检查数据有效性
                const fileName = String(entry.file.name);
                const metadata = app.metadataCache.getFileCache(entry.file);
                const eventDate = metadata?.frontmatter ? metadata.frontmatter[propDate] : null;
                const formattedDate = eventDate ? String(eventDate) : null;

                if (!formattedDate) {
                    console.warn(`Entry ${fileName} is missing date property (${propDate}), skipping entry`);
                    console.info(metadata);
                    continue;
                }

                // 检查是否有有效的属性值可以显示
                let hasValidProperties = false;
                for (const propertyName of order) {
                    const value = entry.getValue(propertyName);
                    if (value?.isTruthy()) {
                        hasValidProperties = true;
                        break;
                    }
                }

                if (!hasValidProperties) {
                    console.warn(`Entry ${fileName} has no valid properties to display, skipping entry`);
                    continue;
                }

                // 添加到有效条目列表
                validEntries.push({ entry, metadata, formattedDate, fileName });
            }

            // 只有当有有效条目时才渲染组
            if (validEntries.length === 0) {
                console.warn(`Group ${group.key} has no valid entries, skipping group`);
                continue;
            }

            const groupEl = this.containerEl.createDiv('yg-list-group');

            groupEl.createEl('h3', { text: `Group: ${group.key} (${validEntries.length} valid entries)` });

            const groupListEl = groupEl.createEl('ul', 'yg-list-group-list');

            // Each entry in the group is a separate file in the vault matching
            // the Base filters. For list view, each entry is a separate line.
            console.log("%cGroup:", 'color: green; font-weight: bold;');
            console.log(group);
            console.log(`Valid entries: ${validEntries.length}/${group.entries.length}`);

            for (const { entry, metadata, formattedDate, fileName } of validEntries) {

                groupListEl.createEl('li', 'yg-list-entry', (el) => {
                    let firstProp = true;
                    
                    for (const propertyName of order) {
                        // Properties in the order can be parsed to determine what type
                        // they are: formula, note, or file.
                        // 获取到这个属性对应的类型和名称
                        const { type, name } = parsePropertyId(propertyName);
                        console.log(`Rendering property: ${propertyName} (type=${type}, name=${name})`);

                        // `entry.getValue` returns the evaluated result of the property
                        // in the context of this entry.
                        const value = entry.getValue(propertyName);
            
                        // Skip rendering properties which have an empty value.
                        // The list items for each file may have differing length.
                        if (!value?.isTruthy()) continue;
            
                        if (!firstProp) {
                            el.createSpan({
                                cls: 'yg-list-separator',
                                text: ' | '
                            });
                        }

                        firstProp = false;
            
                        // If the `file.name` property is included in the order, render
                        // it specially so that it links to that file.
                        if (name === 'name' && type === 'file') {
                            console.log(typeof entry);
                            
                            const titleValue = metadata?.frontmatter ? metadata.frontmatter[propTitle] : null;
                            const displayText = titleValue ? String(titleValue) : fileName;

                            const linkEl = el.createEl('a', { text: `${displayText} (${formattedDate})` });

                            linkEl.onClickEvent((evt) => {
                                if (evt.button !== 0 && evt.button !== 1) return;
                                evt.preventDefault();
                                const path = entry.file.path;
                                const modEvent = Keymap.isModEvent(evt);
                                void app.workspace.openLinkText(path, '', modEvent);
                            });
                
                            linkEl.addEventListener('mouseover', (evt) => {
                                app.workspace.trigger('hover-link', {
                                event: evt,
                                source: 'bases',
                                hoverParent: this,
                                targetEl: linkEl,
                                linktext: entry.file.path,
                                });
                            });
                        }

                        // For all other properties, just display the value as text.
                        // In your view you may also choose to use the `Value.renderTo`
                        // API to better support photos, links, icons, etc.
                        else {
                            el.createSpan({
                                cls: 'bases-list-entry-property',
                                text: value?.toString() || '',
                            });
                        }
                    }
                });

            }
        }
    }
}

