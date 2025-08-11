import * as React from "react";
import { Button } from "@/src/components/Base/Button";
import { AlertCircle, Clipboard, FileText, Upload } from "lucide-react";
import "./style/ImportJson.css";
import { t } from "@/src/i18n/i18n";

interface ImportJsonProps {
	onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onPasteJson: (jsonContent: string) => void;
	disabled?: boolean;
}

export const ImportJson: React.FC<ImportJsonProps> = ({
	onUpload,
	onPasteJson,
	disabled = false,
}) => {
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [showPasteModal, setShowPasteModal] = React.useState(false);
	const [pasteContent, setPasteContent] = React.useState("");
	const [parseError, setParseError] = React.useState<string | null>(null);

	const handlePasteSubmit = async () => {
		if (!pasteContent.trim()) return;

		setParseError(null);

		try {
			// 验证 JSON 格式
			JSON.parse(pasteContent);
			onPasteJson(pasteContent);
			// 成功后延迟关闭弹窗
			setTimeout(() => {
				setPasteContent("");
				setShowPasteModal(false);
			}, 1000);
		} catch (error) {
			setParseError(error.message);
		}
	};

	const handlePasteCancel = () => {
		setPasteContent("");
		setShowPasteModal(false);
		setParseError(null);
	};

	const handleModalOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			handlePasteCancel();
		}
	};

	const actions = (
		<>
			<Button
				icon={<Upload size={16} />}
				onClick={() => fileInputRef.current?.click()}
				disabled={disabled}
				variant="secondary"
				size="small"
			>
				{t("view.dataPortView.import.type.json.upload")}
			</Button>
			<Button
				icon={<Clipboard size={16} />}
				onClick={() => setShowPasteModal(true)}
				disabled={disabled}
				variant="secondary"
				size="small"
			>
				{t("view.dataPortView.import.type.json.paste")}
			</Button>
		</>
	);

	return (
		<>
			{actions}

			{/* 粘贴弹出框 */}
			{showPasteModal && (
				<div
					className="yg-paste-modal-overlay"
					onClick={handleModalOverlayClick}
				>
					<div className="paste-modal">
						<div className="paste-modal-content">
							<textarea
								className="paste-textarea"
								placeholder={t(
									"view.dataPortView.import.type.json.pastePlaceholder"
								)}
								value={pasteContent}
								onChange={(e) => {
									setPasteContent(e.target.value);
									setParseError(null);
								}}
								autoFocus
							/>

							{/* 解析状态显示 */}
							{parseError && (
								<div className="parse-status error">
									<AlertCircle size={16} />
									<span>
										{t(
											"view.dataPortView.import.type.json.pasteError",
											{ error: parseError }
										)}
									</span>
								</div>
							)}
						</div>

						<div className="paste-modal-actions">
							<Button
								variant="secondary"
								onClick={handlePasteCancel}
							>
								{t("common.cancel")}
							</Button>
							<Button
								variant="primary"
								onClick={handlePasteSubmit}
								disabled={!pasteContent.trim()}
								icon={<FileText size={16} />}
							>
								{t(
									"view.dataPortView.import.type.json.submitPaste"
								)}
							</Button>
						</div>
					</div>
				</div>
			)}

			<input
				ref={fileInputRef}
				type="file"
				accept=".json"
				onChange={onUpload}
				style={{ display: "none" }}
			/>
		</>
	);
};
