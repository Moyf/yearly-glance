import {
    BasesView,
    CachedMetadata,
    Keymap,
    parsePropertyId,
    QueryController
} from "obsidian";
import type YearlyGlancePlugin from "@/src/main";
import { YearlyCalendar } from "@/src/components/YearlyCalendar/YearlyCalendar";

// 定义视图类型
export const VIEW_TYPE_YEARLY_GLANCE_BASES = "yearly-glance-bases-view";

export class YearlyGlanceBasesView extends BasesView {
    readonly type = VIEW_TYPE_YEARLY_GLANCE_BASES;
    scrollEl: HTMLElement;
    private containerEl: HTMLElement;
    glanceEl: HTMLElement;
    plugin: YearlyGlancePlugin;
    private yearlyCalendar: YearlyCalendar | null = null;

    constructor(controller: QueryController, parentEl: HTMLElement, plugin: YearlyGlancePlugin) {
        super(controller);
        this.scrollEl = parentEl.createDiv("yg-bases-view-container");
        this.containerEl = this.scrollEl.createDiv("yg-bases-view-content");
        this.glanceEl = this.containerEl.createDiv("yg-bases-view-glance");
        this.plugin = plugin;
        
        // 初始化 YearlyCalendar
        this.yearlyCalendar = new YearlyCalendar(this.glanceEl, this.plugin);
    }

    // onDataUpdated is called by Obsidian whenever there is a configuration
    // or data change in the vault which may affect your view.
    public onDataUpdated(): void {
        const { app } = this;

        const isEmbedded = this.isEmbedded();
        
		if (isEmbedded) {
			this.glanceEl.style.height = '400px';
		}
		else {
			// Let CSS handle the height for direct base file views
			this.glanceEl.style.height = '';
		}

        // Retrieve the user configured order set in the Properties menu.
        const order = this.config.getOrder()

        // Clear entries created by previous iterations. Remember, you should
        // instead attempt element reuse when possible.
        this.containerEl.empty();
        
        // 重新创建 glanceEl，因为 containerEl.empty() 会清空它
        this.glanceEl = this.containerEl.createDiv("yg-bases-view-glance");

        // 读取配置
        const propTitle = String(this.config.get('propTitle') || 'title');
        const propDate = String(this.config.get('propDate') || 'date');

        console.log("%cYearlyGlanceBasesView onDataUpdated", 'color: yellow; font-weight: bold;');
        console.log('propTitle:', propTitle, 'propDate:', propDate);
        console.log(this.config);
        console.log(this.data);

        // 初始化并渲染 YearlyCalendar
        if (this.yearlyCalendar) {
            this.yearlyCalendar.destroy();
        }
        this.yearlyCalendar = new YearlyCalendar(this.glanceEl, this.plugin);
        this.yearlyCalendar.initialize(this.plugin).then(() => {
            this.yearlyCalendar?.render();
        });

        // 设置 glanceEl 的高度
        if (isEmbedded) {
            this.glanceEl.style.height = '400px';
        }
        

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

    
    /**
     * Check if this view is embedded in a markdown file
     * If embedded, we may want to adjust rendering or behavior
    */
    isEmbedded(): boolean {
            // Check if this map view is embedded in a markdown file rather than opened directly
            // If the scrollEl has a parent with 'bases-embed' class, it's embedded
            let element = this.scrollEl.parentElement;
            while (element) {
                if (element.hasClass('bases-embed') || element.hasClass('block-language-base')) {
                    return true;
                }
                element = element.parentElement;
            }
            return false;
    }

    /**
     * Clean up resources when the view is destroyed
     */
    destroy(): void {
        if (this.yearlyCalendar) {
            this.yearlyCalendar.destroy();
            this.yearlyCalendar = null;
        }
    }
}

