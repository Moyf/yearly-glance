def generate_solar_year_options(start_year=1, end_year=75):
    """
    生成SolarYearOptions数组
    
    参数:
        start_year: 起始年份数值
        end_year: 结束年份数值
    
    返回:
        格式化的TypeScript代码字符串
    """
    options = []
    
    for year in range(start_year, end_year + 1):
        # 格式化年份标签，确保是4位数字
        year_label = f"{year:04d}"
        option = f"\t{{ value: {year}, label: \"{year_label}\" }}"
        options.append(option)
    
    # 组合成完整的TypeScript代码
    ts_code = "import { SelectOption } from \"@/src/components/Base/Select\";\n\n"
    ts_code += "export const SolarYearOptions: SelectOption[] = [\n"
    ts_code += ",\n".join(options)
    ts_code += "\n];\n"
    
    return ts_code

def generate_lunar_year_options(start_year=1, end_year=75):
    """
    生成LunarYearOptions数组，标签使用中文数字
    
    参数:
        start_year: 起始年份数值
        end_year: 结束年份数值
    
    返回:
        格式化的TypeScript代码字符串
    """
    # 中文数字映射
    chinese_digits = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"]
    options = []
    
    for year in range(start_year, end_year + 1):
        # 将年份转换为中文数字
        year_str = str(year).zfill(4)  # 确保是4位数
        chinese_year = ""
        for digit in year_str:
            chinese_year += chinese_digits[int(digit)]
        
        option = f"\t{{ value: {year}, label: \"{chinese_year}\" }}"
        options.append(option)
    
    # 组合成完整的TypeScript代码
    ts_code = "\nexport const LunarYearOptions: SelectOption[] = [\n"
    ts_code += ",\n".join(options)
    ts_code += "\n];\n"
    
    return ts_code

# 生成年份选项
solar_year_options = generate_solar_year_options(1800, 2200)
lunar_year_options = generate_lunar_year_options(1800, 2200)

# 将结果写入文件，指定UTF-8编码
with open("dateOptions.ts", "w", encoding="utf-8") as f:
    f.write(solar_year_options)
    f.write(lunar_year_options)

print("已成功生成SolarYearOptions和LunarYearOptions并保存到dateOptions.ts文件")