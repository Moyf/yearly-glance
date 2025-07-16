import { HelpCircle } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import "./style/Tooltip.css";

interface TooltipProps {
	text: string;
	children?: React.ReactNode; // 可选的子元素，如果提供则包裹子元素，否则显示默认图标
	trigger?: "hover" | "click"; // 触发方式，默认为hover
	disabled?: boolean; // 是否禁用tooltip
}

export const Tooltip: React.FC<TooltipProps> = ({ 
	text, 
	children, 
	trigger = "hover", 
	disabled = false 
}) => {
	const [isVisible, setIsVisible] = React.useState(false);
	const [position, setPosition] = React.useState({
		x: 0,
		y: 0,
		isAbove: false,
	});
	const triggerRef = React.useRef<HTMLDivElement>(null);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	const updatePosition = React.useCallback(() => {
		if (triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			const margin = 16; // 边距

			// 根据屏幕尺寸计算响应式tooltip宽度
			let maxTooltipWidth: number;
			let minTooltipWidth: number;

			if (window.innerWidth <= 480) {
				// 超小屏幕
				maxTooltipWidth = window.innerWidth * 0.98;
				minTooltipWidth = 150;
			} else if (window.innerWidth <= 768) {
				// 移动设备
				maxTooltipWidth = Math.min(350, window.innerWidth * 0.95);
				minTooltipWidth = 180;
			} else if (window.innerWidth >= 1920) {
				// 大屏幕
				maxTooltipWidth = Math.min(500, window.innerWidth * 0.8);
				minTooltipWidth = 200;
			} else {
				// 桌面端
				maxTooltipWidth = Math.min(400, window.innerWidth * 0.9);
				minTooltipWidth = 200;
			}

			const tooltipWidth = Math.max(minTooltipWidth, maxTooltipWidth);
			const tooltipHeight = 80; // 估计高度，考虑可能的滚动条

			let x = rect.left + rect.width / 2;
			let y = rect.bottom + 8;
			let isAbove = false;

			// 水平边界检查
			if (x - tooltipWidth / 2 < margin) {
				x = margin + tooltipWidth / 2;
			} else if (x + tooltipWidth / 2 > window.innerWidth - margin) {
				x = window.innerWidth - margin - tooltipWidth / 2;
			}

			// 垂直边界检查，如果下方空间不足，显示在上方
			if (y + tooltipHeight > window.innerHeight - margin) {
				y = rect.top - 8; // 显示在图标上方
				isAbove = true;
			}

			setPosition({ x, y, isAbove });
		}
	}, []);

	const showTooltip = () => {
		if (disabled) return;
		
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		updatePosition();
		setIsVisible(true);
	};

	const hideTooltip = () => {
		if (disabled) return;
		
		timeoutRef.current = setTimeout(() => {
			setIsVisible(false);
		}, 100); // 短暂延迟，允许鼠标移动到tooltip上
	};

	const toggleTooltip = () => {
		if (disabled) return;
		
		if (isVisible) {
			hideTooltip();
		} else {
			showTooltip();
		}
	};

	const keepTooltip = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	};

	// 监听滚动和窗口大小变化，更新位置
	React.useEffect(() => {
		if (isVisible) {
			const handleResize = () => updatePosition();
			const handleScroll = () => updatePosition();

			window.addEventListener("resize", handleResize);
			window.addEventListener("scroll", handleScroll, true);

			return () => {
				window.removeEventListener("resize", handleResize);
				window.removeEventListener("scroll", handleScroll, true);
			};
		}
	}, [isVisible, updatePosition]);

	// 处理点击外部关闭tooltip (仅在click模式下)
	React.useEffect(() => {
		if (isVisible && trigger === "click") {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					triggerRef.current &&
					!triggerRef.current.contains(event.target as Node)
				) {
					setIsVisible(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [isVisible, trigger]);

	// 清理定时器
	React.useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	// 处理事件监听器
	const getEventHandlers = () => {
		if (trigger === "hover") {
			return {
				onMouseEnter: showTooltip,
				onMouseLeave: hideTooltip,
			};
		} else if (trigger === "click") {
			return {
				onClick: toggleTooltip,
			};
		}
		return {};
	};

	return (
		<>
			<div 
				ref={triggerRef} 
				className={`yg-tooltip-container ${disabled ? 'disabled' : ''} ${children ? 'has-children' : ''}`}
				{...getEventHandlers()}
			>
				{children || (
					<HelpCircle
						size={16}
						className="yg-tooltip-icon"
						aria-label="Help"
					/>
				)}
			</div>
			{isVisible && !disabled &&
				createPortal(
					<div
						className={`yg-tooltip-content yg-tooltip-portal ${
							position.isAbove ? "yg-tooltip-above" : ""
						}`}
						style={{
							left: position.x,
							top: position.y,
						}}
						dangerouslySetInnerHTML={{ __html: text }}
						onMouseEnter={trigger === "hover" ? keepTooltip : undefined}
						onMouseLeave={trigger === "hover" ? hideTooltip : undefined}
					/>,
					document.body
				)}
		</>
	);
};
