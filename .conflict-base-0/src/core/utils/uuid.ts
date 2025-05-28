import { v4 as uuidv4 } from "uuid";

/**
 * UUID 选项
 * prefix: UUID 前缀，如 'table-'
 * length: UUID 长度（不包括前缀）
 * charset: 自定义字符集
 * separator: 前缀和 UUID 之间的分隔符
 * timePrefix: 是否添加时间戳前缀
 * uppercase: 是否使用大写
 */
interface UUIDOptions {
	prefix?: string; // UUID 前缀，如 'table-'
	length?: number; // UUID 长度（不包括前缀）
	charset?: string; // 自定义字符集
	separator?: string; // 前缀和 UUID 之间的分隔符
	timePrefix?: boolean; // 是否添加时间戳前缀
	uppercase?: boolean; // 是否使用大写
}

export class UUIDGenerator {
	private readonly DEFAULT_OPTIONS: UUIDOptions = {
		prefix: "",
		length: 8,
		charset: "0123456789abcdefghijklmnopqrstuvwxyz",
		separator: "-",
		timePrefix: false,
		uppercase: false,
	};

	private options: UUIDOptions;

	constructor(options: UUIDOptions = {}) {
		this.options = { ...this.DEFAULT_OPTIONS, ...options };
	}

	/**
	 * 生成 UUID
	 * 根据配置的选项生成自定义格式的 UUID
	 * @returns 生成的 UUID 字符串
	 */
	generate(): string {
		let result = "";

		// 使用标准 UUID 或自定义字符集生成
		if (this.options.charset === this.DEFAULT_OPTIONS.charset) {
			// 使用 uuid 库生成，然后截取所需长度
			result = uuidv4()
				.replace(/-/g, "")
				.substring(0, this.options.length);
		} else {
			// 使用自定义字符集生成
			const charset = this.options.charset || "";
			const length = this.options.length || 8;

			for (let i = 0; i < length; i++) {
				const randomIndex = Math.floor(Math.random() * charset.length);
				result += charset[randomIndex];
			}
		}

		// 处理大小写
		if (this.options.uppercase) {
			result = result.toUpperCase();
		}

		// 添加时间戳前缀
		if (this.options.timePrefix) {
			const timestamp = Date.now().toString(36);
			result = `${timestamp}${this.options.separator}${result}`;
		}

		// 添加自定义前缀
		if (this.options.prefix) {
			result = `${this.options.prefix}${this.options.separator}${result}`;
		}

		return result;
	}

	/**
	 * 更新 UUID 生成器选项
	 * @param options 要更新的选项
	 */
	updateOptions(options: Partial<UUIDOptions>): void {
		this.options = { ...this.options, ...options };
	}

	/**
	 * 重置 UUID 生成器选项为默认值
	 */
	reset(): void {
		this.options = { ...this.DEFAULT_OPTIONS };
	}
}

// 创建默认实例
export const defaultGenerator = new UUIDGenerator();

/**
 * 便捷函数：一次性生成 UUID
 * @param options UUID 生成选项
 * @returns 生成的 UUID 字符串
 */
export function generateUUID(options?: UUIDOptions): string {
	const generator = new UUIDGenerator(options);
	return generator.generate();
}
