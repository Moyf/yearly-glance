import * as React from "react";
import "./style/ImportUpload.css";

interface ImportUploadProps {
	title: string;
	icon?: React.ReactNode;
	children?: React.ReactNode;
	actions?: React.ReactNode;
}

export const ImportUpload: React.FC<ImportUploadProps> = ({
	title,
	icon,
	children,
	actions,
}) => {
	return (
		<div className="yg-import-upload">
			<div className="import-upload-header">
				{icon && <div className="import-upload-icon">{icon}</div>}
				<h3 className="import-upload-title">{title}</h3>
				{actions && (
					<div className="import-upload-actions">{actions}</div>
				)}
			</div>

			{children && (
				<div className="import-upload-description">{children}</div>
			)}
		</div>
	);
};
