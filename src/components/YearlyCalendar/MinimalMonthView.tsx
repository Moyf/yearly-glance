import * as React from "react";
import { CalendarDay } from "@/src/type/CalendarEvent";
import { YearlyGlanceSettings } from "@/src/type/Settings";
import { EVENT_TYPE_DEFAULT } from "@/src/type/Events";
import { Tooltip } from "@/src/components/Base/Tooltip";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";

interface MinimalMonthViewProps {
	monthData: {
		name: string;
		color: string;
		days: CalendarDay[];
		isCurrentMonth: boolean;
	};
	year: number;
	monthIndex: number;
	settings: YearlyGlanceSettings;
	onDayClick: (day: CalendarDay) => void;
}

// 计算圆点样式
function getDotStyle(
	day: CalendarDay,
	eventCount: number,
	threshold: { low: number; medium: number }
): React.CSSProperties {
	if (eventCount === 0) {
		return {
			backgroundColor: "transparent",
			border: "1px solid var(--yg-border-color)",
		};
	}

	// 获取事件颜色（多事件时混合）
	const colors = day.events.map(
		(e) => e.color || EVENT_TYPE_DEFAULT[e.eventType].color
	);
	const primaryColor = colors[0];

	let fillOpacity: number;
	if (eventCount < threshold.low) {
		fillOpacity = 0.2; // 浅色
	} else if (eventCount < threshold.medium) {
		fillOpacity = 0.5; // 中等
	} else {
		fillOpacity = 1; // 深色
	}

	// 多事件渐变效果
	if (colors.length > 1) {
		return {
			background: `linear-gradient(135deg, ${colors.join(", ")})`,
			opacity: fillOpacity.toString(),
		};
	}

	// 单事件使用带透明度的颜色
	const alpha = Math.round(fillOpacity * 255)
		.toString(16)
		.padStart(2, "0");
	return {
		backgroundColor: `${primaryColor}${alpha}`,
	};
}

export const MinimalMonthView: React.FC<MinimalMonthViewProps> = ({
	monthData,
	year,
	monthIndex,
	settings,
	onDayClick,
}) => {
	const threshold = settings.minimalViewThreshold || { low: 1, medium: 3 };

	// 计算当月天数，处理不同月份（28/29/30/31天）
	const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

	return (
		<div className="minimal-month-grid">
			{Array.from({ length: 31 }).map((_, dayIndex) => {
				const dayOfMonth = dayIndex + 1;
				const isValidDay = dayOfMonth <= daysInMonth;

				if (!isValidDay) {
					return (
						<div key={dayIndex} className="minimal-day empty" />
					);
				}

				const day = monthData.days[dayOfMonth - 1];
				const eventCount = day?.events.length || 0;

				// 计算圆点样式
				const dotStyle = getDotStyle(day, eventCount, threshold);

				// 构建事件列表提示文本
				const eventNames = day.events
					.map((e) => `${e.emoji} ${e.text}`)
					.join("\n");

				return (
					<Tooltip
						key={dayIndex}
						text={
							eventNames ||
							t("view.yearlyGlance.actions.noEvents")
						}
					>
						<div
							className={`minimal-day${day.isToday ? " today" : ""}`}
							onClick={() => onDayClick(day)}
						>
							<div className="minimal-dot" style={dotStyle} />
						</div>
					</Tooltip>
				);
			})}
		</div>
	);
};
