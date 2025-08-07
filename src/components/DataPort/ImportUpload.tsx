import * as React from "react";
import { Button } from "../Base/Button";
import { Upload } from "lucide-react";

interface ImportUploadProps {
	title: string;
	onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	icon?: React.ReactNode;
	children?: React.ReactNode;
	disabled?: boolean;
}

export const ImportUpload: React.FC<ImportUploadProps> = ({
	title,
	onUpload,
	icon,
	children,
	disabled = false,
}) => {
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	return (
		<div className={`import-upload ${disabled ? "disabled" : ""}`}>
			<div className="import-upload-header">
				{icon && <div className="import-upload-icon">{icon}</div>}
				<h3 className="import-upload-title">{title}</h3>
			</div>
			{children && (
				<div className="import-upload-description">{children}</div>
			)}
			<Button
				icon={<Upload size={16} />}
				onClick={() => fileInputRef.current?.click()}
				disabled={disabled}
				variant="primary"
			>
				{disabled ? "正在处理..." : "点击选择文件"}
			</Button>
			<input
				ref={fileInputRef}
				type="file"
				accept=".json"
				onChange={onUpload}
			/>
		</div>
	);
};
