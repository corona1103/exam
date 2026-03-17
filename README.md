# 在线阅卷系统

一个面向教师的在线试卷批改系统演示，支持按题批改和按学生批改两种模式。

## 在线体验

**访问地址：** https://corona1103.github.io/exam/

## 功能特性

- **双模式批改**：支持"按题批改"和"按学生批改"两种工作流
- **丰富的批注工具**：正确✓、错误✗、半对△、圈注、下划线、文字批注
- **批注可拖拽**：添加的批注支持拖动调整位置
- **快捷评分**：一键赋分，提高批改效率
- **学生诊断报告**：自动生成得分统计，支持编写评价建议和老师寄语

## 页面预览

### 考试列表
选择考试和批改模式的入口页面

### 批改界面
- 左侧：题目/学生列表
- 中间：答卷预览 + 批注工具
- 右侧：评分面板

### 诊断报告
按学生批改完成后，生成包含得分分析和教师评语的报告

## 技术栈

- HTML5
- CSS3 (Flexbox, Grid, CSS Variables)
- Vanilla JavaScript (无框架依赖)

## 本地运行

```bash
git clone https://github.com/corona1103/exam.git
cd exam
open index.html
```

## 项目结构

```
exam/
├── index.html      # 主页面
├── style.css       # 样式文件
├── app.js          # 交互逻辑
├── README.md       # 项目说明
└── docs/           # 文档目录
    ├── PRD.md      # 需求文档
    └── TECH.md     # 技术文档
```

## 文档

- [需求文档 (PRD)](./docs/PRD.md)
- [技术文档](./docs/TECH.md)

## License

MIT
