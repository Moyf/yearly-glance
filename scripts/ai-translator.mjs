import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../.env") });

class AITranslator {
	constructor() {
		this.apiKey =
			process.env.OPENAI_API_KEY ||
			process.env.AZURE_OPENAI_API_KEY ||
			process.env.CUSTOM_API_KEY;
		this.baseURL =
			process.env.OPENAI_BASE_URL ||
			process.env.AZURE_OPENAI_ENDPOINT ||
			process.env.CUSTOM_BASE_URL;
		this.model = process.env.TRANSLATION_MODEL || "gpt-3.5-turbo";
		this.apiVersion = process.env.AZURE_OPENAI_API_VERSION;

		if (!this.apiKey) {
			throw new Error(
				"AI API key is required. Please set OPENAI_API_KEY, AZURE_OPENAI_API_KEY, or CUSTOM_API_KEY in .env file"
			);
		}

		if (!this.baseURL) {
			throw new Error(
				"AI API base URL is required. Please set OPENAI_BASE_URL, AZURE_OPENAI_ENDPOINT, or CUSTOM_BASE_URL in .env file"
			);
		}
	}

	async translateText(text, targetLanguage = "English") {
		if (!text || typeof text !== "string") {
			return text;
		}

		try {
			const prompt = `Please translate the following text to ${targetLanguage}. Keep the same tone and technical terminology. Only return the translated text without any explanations or additional content:

${text}`;

			const requestBody = {
				model: this.model,
				messages: [
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.1,
				max_tokens: 1000,
			};

			const headers = {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			};

			// 处理Azure OpenAI特殊的URL格式
			let url = this.baseURL;
			if (this.baseURL.includes("openai.azure.com")) {
				url = `${this.baseURL}/openai/deployments/${this.model}/chat/completions?api-version=${this.apiVersion}`;
				headers["api-key"] = this.apiKey;
				delete headers["Authorization"];
			} else {
				url = `${this.baseURL}/chat/completions`;
			}

			const response = await fetch(url, {
				method: "POST",
				headers: headers,
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorData = await response.text();
				throw new Error(
					`AI API request failed: ${response.status} ${response.statusText} - ${errorData}`
				);
			}

			const data = await response.json();

			if (!data.choices || !data.choices[0] || !data.choices[0].message) {
				throw new Error("Invalid response format from AI API");
			}

			const translatedText = data.choices[0].message.content.trim();

			// 简单验证翻译结果
			if (translatedText.length === 0) {
				console.warn(
					`Warning: Empty translation result for: "${text}"`
				);
				return text;
			}

			return translatedText;
		} catch (error) {
			console.error(`Translation failed for text: "${text}"`, error);
			// 如果翻译失败，返回原文本
			return text;
		}
	}

	async translateCommit(commit) {
		try {
			const translatedCommit = { ...commit };

			// 翻译commit主题
			if (commit.subject) {
				translatedCommit.subject = await this.translateText(
					commit.subject
				);
			}

			// 翻译commit内容
			if (commit.body) {
				translatedCommit.body = await this.translateText(commit.body);
			}

			// 翻译BREAKING CHANGE notes
			if (commit.notes && commit.notes.length > 0) {
				translatedCommit.notes = [];
				for (const note of commit.notes) {
					const translatedNote = { ...note };
					if (note.text) {
						translatedNote.text = await this.translateText(
							note.text
						);
					}
					translatedCommit.notes.push(translatedNote);
				}
			}

			return translatedCommit;
		} catch (error) {
			console.error("Failed to translate commit:", error);
			return commit; // 返回原始commit
		}
	}

	async batchTranslate(commits) {
		const translatedCommits = [];

		for (let i = 0; i < commits.length; i++) {
			const commit = commits[i];
			console.log(
				`Translating commit ${i + 1}/${
					commits.length
				}: ${commit.subject?.substring(0, 50)}...`
			);

			const translatedCommit = await this.translateCommit(commit);
			translatedCommits.push(translatedCommit);

			// 添加延迟避免API限流
			if (i < commits.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}

		return translatedCommits;
	}
}

export default AITranslator;
