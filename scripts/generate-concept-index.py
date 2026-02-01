#!/usr/bin/env python3
"""
UMA概念索引生成器
自动扫描CONCEPTS目录，生成概念索引
"""

import os
import re
import glob
from datetime import datetime

CONCEPTS_DIR = "CONCEPTS"
OUTPUT_FILE = "CONCEPTS/README.md"

def extract_concept_info(filepath):
    """从概念文件中提取信息"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取概念编号和名称
    match = re.match(r'# (UMA-\d{3}): (.+)', content)
    if match:
        umaid, name = match.groups()
    else:
        # 尝试从文件名提取
        filename = os.path.basename(filepath)
        umaid = filename.split('-')[0] + '-' + filename.split('-')[1]
        name = ' '.join(filename.split('-')[2:]).replace('.md', '')

    # 提取简短描述（定义部分）
    desc_match = re.search(r'## 定义\s*\n(.+?)(?:\n##|\n#|\n\n\n|\Z)', content, re.DOTALL)
    description = desc_match.group(1).strip()[:150] + "..." if desc_match else "暂无描述"

    # 提取相关概念
    related_match = re.search(r'## 相关概念\s*\n(.+?)(?:\n##|\n#|\Z)', content, re.DOTALL)
    related = []
    if related_match:
        related_lines = related_match.group(1).strip().split('\n')
        for line in related_lines:
            if line.strip().startswith('- **'):
                concept = line.strip()[4:].split('**')[0]
                related.append(concept)

    # 提取贡献者
    contributors_match = re.search(r'## 贡献者\s*\n(.+?)(?:\n##|\n#|\Z)', content, re.DOTALL)
    contributors = []
    if contributors_match:
        contributor_lines = contributors_match.group(1).strip().split('\n')
        for line in contributor_lines:
            if line.strip().startswith('-'):
                contributors.append(line.strip()[2:])

    # 提取最后修改时间
    stats = os.stat(filepath)
    modified = datetime.fromtimestamp(stats.st_mtime).strftime('%Y-%m-%d')

    return {
        'id': umaid,
        'name': name,
        'description': description,
        'related': related,
        'contributors': contributors,
        'modified': modified,
        'filename': os.path.basename(filepath)
    }

def generate_index(concepts):
    """生成索引Markdown"""

    # 按编号排序
    concepts.sort(key=lambda x: x['id'])

    # 按编号范围分组
    categories = {
        '哲学基础 (UMA-000 ~ UMA-099)': [],
        '技术伦理 (UMA-100 ~ UMA-199)': [],
        '创作方法论 (UMA-200 ~ UMA-299)': [],
        '美学体系 (UMA-300 ~ UMA-399)': [],
        '作品形态 (UMA-400 ~ UMA-499)': [],
        '工具设施 (UMA-500 ~ UMA-599)': [],
        '社区传播 (UMA-600 ~ UMA-699)': []
    }

    for concept in concepts:
        num = int(concept['id'].split('-')[1])
        if num < 100:
            categories['哲学基础 (UMA-000 ~ UMA-099)'].append(concept)
        elif num < 200:
            categories['技术伦理 (UMA-100 ~ UMA-199)'].append(concept)
        elif num < 300:
            categories['创作方法论 (UMA-200 ~ UMA-299)'].append(concept)
        elif num < 400:
            categories['美学体系 (UMA-300 ~ UMA-399)'].append(concept)
        elif num < 500:
            categories['作品形态 (UMA-400 ~ UMA-499)'].append(concept)
        elif num < 600:
            categories['工具设施 (UMA-500 ~ UMA-599)'].append(concept)
        elif num < 700:
            categories['社区传播 (UMA-600 ~ UMA-699)'].append(concept)

    # 生成Markdown
    lines = [
        '# 概念库',
        '',
        '## 概念编号系统',
        'UMA-XXX：三位数字编号，按创建顺序递增',
        '- UMA-000 ~ UMA-099：哲学基础概念',
        '- UMA-100 ~ UMA-199：技术伦理概念  ',
        '- UMA-200 ~ UMA-299：创作方法论',
        '- UMA-300 ~ UMA-399：美学体系',
        '- UMA-400 ~ UMA-499：作品形态分类',
        '- UMA-500 ~ UMA-599：工具与基础设施',
        '- UMA-600 ~ UMA-699：社区与传播',
        '',
        '## 概念文件模板',
        '每个概念文件应包含：',
        '1. **定义**：清晰的核心定义',
        '2. **原理**：理论基础与逻辑',
        '3. **历史脉络**：思想来源与演变',
        '4. **应用场景**：在UMA创作中的具体应用',
        '5. **技术实现**：相关的技术方案',
        '6. **示例**：具体案例说明',
        '7. **相关概念**：与其他概念的关联',
        '8. **争议与讨论**：开放性问题',
        '',
        f"## 概念索引（共{len(concepts)}个概念）",
        f"*最后更新：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*",
        ''
    ]

    for category_name, category_concepts in categories.items():
        if not category_concepts:
            continue
            
        lines.append(f"### {category_name}")
        lines.append("")
        lines.append("| 编号 | 名称 | 描述 | 相关概念 | 最后更新 |")
        lines.append("|------|------|------|----------|----------|")
        
        for concept in category_concepts:
            related_str = ", ".join(concept['related'][:3])  # 最多显示3个
            if len(concept['related']) > 3:
                related_str += "..."
            
            # 创建文件链接
            file_link = f"[{concept['id']}](./{concept['filename']})"
            
            lines.append(f"| {file_link} | {concept['name']} | {concept['description']} | {related_str} | {concept['modified']} |")
        
        lines.append("")

    lines.append("## 添加新概念")
    lines.append("")
    lines.append("1. 复制 `TEMPLATES/concept-template.md` 到 `CONCEPTS/` 目录")
    lines.append("2. 填写概念内容，确保格式正确")
    lines.append("3. 运行 `python scripts/generate-concept-index.py` 更新索引")
    lines.append("4. 提交Pull Request")

    return "\n".join(lines)

def main():
    # 查找所有概念文件
    concept_files = glob.glob(os.path.join(CONCEPTS_DIR, "UMA-*.md"))

    concepts = []
    for filepath in concept_files:
        if os.path.basename(filepath) == "README.md":
            continue
        try:
            concept_info = extract_concept_info(filepath)
            concepts.append(concept_info)
        except Exception as e:
            print(f"处理文件 {filepath} 时出错: {e}")

    # 生成索引内容
    index_content = generate_index(concepts)

    # 写入文件
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(index_content)

    print(f"已生成概念索引：{OUTPUT_FILE}")
    print(f"包含 {len(concepts)} 个概念")

    # 统计信息
    print("\n分类统计：")
    for i in range(0, 700, 100):
        count = sum(1 for c in concepts if int(c['id'].split('-')[1]) // 100 == i // 100)
        if i == 0:
            print(f"  UMA-000~099（哲学）: {count}")
        elif i == 100:
            print(f"  UMA-100~199（伦理）: {count}")
        elif i == 200:
            print(f"  UMA-200~299（方法）: {count}")
        elif i == 300:
            print(f"  UMA-300~399（美学）: {count}")
        elif i == 400:
            print(f"  UMA-400~499（形态）: {count}")
        elif i == 500:
            print(f"  UMA-500~599（工具）: {count}")
        elif i == 600:
            print(f"  UMA-600~699（社区）: {count}")

if __name__ == "__main__":
    main()
