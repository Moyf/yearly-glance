import * as React from "react";
import { Button } from "../Base/Button";
import {
	AlertCircle,
	CheckCircle,
	Clipboard,
	FileText,
	Upload,
	X,
} from "lucide-react";

interface ImportUploadProps {
	title: string;
	onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onPasteJson?: (jsonContent: string) => void;
	icon?: React.ReactNode;
	children?: React.ReactNode;
	disabled?: boolean;
}

export const ImportUpload: React.FC<ImportUploadProps> = ({
	title,
	onUpload,
	onPasteJson,
	icon,
	children,
	disabled = false,
}) => {
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [showPasteModal, setShowPasteModal] = React.useState(false);
	const [pasteContent, setPasteContent] = React.useState("");
	const [isPasting, setIsPasting] = React.useState(false);
	const [parseError, setParseError] = React.useState<string | null>(null);
	const [parseSuccess, setParseSuccess] = React.useState(false);

	const handlePasteSubmit = async () => {
		if (!pasteContent.trim() || !onPasteJson) return;

		setIsPasting(true);
		setParseError(null);
		setParseSuccess(false);

		try {
			// 验证 JSON 格式
			JSON.parse(pasteContent);
			onPasteJson(pasteContent);
			setParseSuccess(true);
			// 成功后延迟关闭弹窗
			setTimeout(() => {
				setPasteContent("");
				setShowPasteModal(false);
				setParseSuccess(false);
			}, 1000);
		} catch (error) {
			setParseError(
				error instanceof Error ? error.message : "无效的 JSON 格式"
			);
		} finally {
			setIsPasting(false);
		}
	};

	const handlePasteCancel = () => {
		setPasteContent("");
		setShowPasteModal(false);
		setParseError(null);
		setParseSuccess(false);
	};

	const handleModalOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			handlePasteCancel();
		}
	};

	return (
		<div className={`import-upload ${disabled ? "disabled" : ""}`}>
			<div className="import-upload-header">
				{icon && <div className="import-upload-icon">{icon}</div>}
				<h3 className="import-upload-title">{title}</h3>
				<div className="import-upload-actions">
					<Button
						icon={<Upload size={16} />}
						onClick={() => fileInputRef.current?.click()}
						disabled={disabled}
						variant="secondary"
						size="small"
					>
						上传
					</Button>
					{onPasteJson && (
						<Button
							icon={<Clipboard size={16} />}
							onClick={() => setShowPasteModal(true)}
							disabled={disabled}
							variant="secondary"
							size="small"
						>
							粘贴
						</Button>
					)}
				</div>
			</div>

			{children && (
				<div className="import-upload-description">{children}</div>
			)}

			{/* 粘贴弹出框 */}
			{showPasteModal && (
				<div
					className="paste-modal-overlay"
					onClick={handleModalOverlayClick}
				>
					<div className="paste-modal">
						<div className="paste-modal-header">
							<div className="paste-modal-title">
								<Clipboard size={20} />
								<span>粘贴 JSON 代码</span>
							</div>
							<Button
								icon={<X size={16} />}
								onClick={handlePasteCancel}
								variant="secondary"
								size="small"
							>
								关闭
							</Button>
						</div>

						<div className="paste-modal-content">
							<textarea
								className="paste-textarea"
								placeholder="请粘贴 JSON 代码..."
								value={pasteContent}
								onChange={(e) => {
									setPasteContent(e.target.value);
									setParseError(null);
									setParseSuccess(false);
								}}
								disabled={isPasting}
								autoFocus
							/>

							{/* 解析状态显示 */}
							{parseError && (
								<div className="parse-status error">
									<AlertCircle size={16} />
									<span>解析错误: {parseError}</span>
								</div>
							)}

							{parseSuccess && (
								<div className="parse-status success">
									<CheckCircle size={16} />
									<span>JSON 解析成功！正在处理...</span>
								</div>
							)}
						</div>

						<div className="paste-modal-actions">
							<Button
								variant="secondary"
								onClick={handlePasteCancel}
								disabled={isPasting}
							>
								取消
							</Button>
							<Button
								variant="primary"
								onClick={handlePasteSubmit}
								disabled={
									!pasteContent.trim() ||
									isPasting ||
									parseSuccess
								}
								icon={<FileText size={16} />}
							>
								{isPasting
									? "解析中..."
									: parseSuccess
									? "解析成功"
									: "解析 JSON"}
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
			/>
		</div>
	);
};
