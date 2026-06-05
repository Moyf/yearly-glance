import { App, TFile } from "obsidian";

type FrontmatterRecord = Record<string, unknown>;

export class FrontMatter {
	app: App;

	constructor(app: App) {
		this.app = app;
	}

	async createFrontMatter(
		file: TFile,
		newFrontmatter: FrontmatterRecord
	): Promise<void> {
		await this.app.fileManager.processFrontMatter(file, (fm) => {
			Object.assign(fm, newFrontmatter);
		});
	}

	async deleteFrontMatter(
		file: TFile,
		keysToDelete: string[]
	): Promise<void> {
		await this.app.fileManager.processFrontMatter(file, (fm) => {
			keysToDelete.forEach((key) => {
				delete fm[key];
			});
		});
	}

	async updateFrontMatter(
		file: TFile,
		updateFrontmatterFunc: (frontmatter: FrontmatterRecord) => void
	): Promise<void> {
		await this.app.fileManager.processFrontMatter(file, (fm) => {
			updateFrontmatterFunc(fm);
		});
	}

	async readFrontMatter(file: TFile): Promise<FrontmatterRecord> {
		let frontmatter: FrontmatterRecord = {};
		await this.app.fileManager.processFrontMatter(file, (fm) => {
			frontmatter = { ...fm };
		});
		return frontmatter;
	}

	async replaceFrontMatterKey(
		file: TFile,
		oldKey: string,
		newKey: string
	): Promise<void> {
		await this.app.fileManager.processFrontMatter(file, (fm) => {
			if (fm[oldKey] !== undefined) {
				fm[newKey] = fm[oldKey];
				delete fm[oldKey];
			}
		});
	}

	async hasFrontMatterKey(file: TFile, key: string): Promise<boolean> {
		const frontmatter = await this.readFrontMatter(file);
		return Object.prototype.hasOwnProperty.call(frontmatter, key);
	}

	async getFrontMatterValue(file: TFile, key: string): Promise<unknown> {
		const frontmatter = await this.readFrontMatter(file);
		return frontmatter[key];
	}
}
