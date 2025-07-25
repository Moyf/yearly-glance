import { Events } from "@/src/core/interfaces/Events";
import * as React from "react";

interface DataImportProps {
	currentData: Events;
	onDataImport: (data: Partial<Events>) => Promise<void>;
}

export const DataImport: React.FC<DataImportProps> = ({
	currentData,
	onDataImport,
}) => {
	return <></>;
};
