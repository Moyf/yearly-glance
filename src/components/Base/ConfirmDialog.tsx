import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Modal } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { t } from "@/src/i18n/i18n";
import "./style/ConfirmDialog.css";
import { Button } from "./Button";

interface ConfirmDialogViewProps {
	title: string;
	message: string;
	onConfirm: () => void;
	onClose?: () => void;
}

const ConfirmDialogView: React.FC<ConfirmDialogViewProps> = ({
	title,
	message,
	onConfirm,
	onClose,
}) => {
	const handleConfirm = () => {
		onConfirm();
		onClose?.();
	};

	return (
		<div className="yg-confirm-dialog-overlay">
			<div className="yg-confirm-dialog">
				<div className="yg-confirm-dialog-header">
					<h3>{title}</h3>
				</div>
				<div className="yg-confirm-dialog-content">
					<p>{message}</p>
				</div>
				<div className="yg-confirm-dialog-actions">
					<Button onClick={onClose} variant="secondary" size="small">
						{t("common.cancel")}{" "}
					</Button>
					<Button
						className="yg-confirm-dialog-action-confirm"
						onClick={handleConfirm}
						variant="primary"
						size="small"
					>
						{t("common.confirm")}
					</Button>
				</div>
			</div>
		</div>
	);
};

export class ConfirmDialog extends Modal {
	private root: Root | null = null;
	private plugin: YearlyGlancePlugin;
	private props: ConfirmDialogViewProps;

	constructor(plugin: YearlyGlancePlugin, props: ConfirmDialogViewProps) {
		super(plugin.app);
		this.plugin = plugin;
		this.props = props;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		this.root = createRoot(contentEl);

		this.root.render(
			<React.StrictMode>
				<ConfirmDialogView
					title={this.props.title}
					message={this.props.message}
					onConfirm={this.props.onConfirm}
					onClose={() => this.close()}
				/>
			</React.StrictMode>
		);
	}

	onClose() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
	}
}
