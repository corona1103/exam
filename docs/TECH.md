# 在线阅卷系统 - 技术实现文档

## 1. 技术架构

### 1.1 技术栈
| 层级 | 技术 | 说明 |
|------|------|------|
| 结构 | HTML5 | 语义化标签 |
| 样式 | CSS3 | Flexbox/Grid 布局，CSS 变量 |
| 交互 | Vanilla JavaScript | 原生 JS，无框架依赖 |

### 1.2 文件结构
```
exam/
├── index.html      # 主页面（包含所有 HTML 结构）
├── style.css       # 全局样式
├── app.js          # 交互逻辑
└── docs/           # 文档
    ├── README.md
    ├── PRD.md
    └── TECH.md
```

### 1.3 页面结构
```html
<body>
  <!-- 全局导航栏 -->
  <nav class="global-nav">...</nav>

  <!-- 主内容区域 -->
  <div class="main-wrapper">
    <!-- 模块1：阅卷批改 -->
    <div class="module module-grading" id="moduleGrading">
      <div class="page page-list" id="pageList">...</div>
      <div class="page page-grading" id="pageGrading">...</div>
    </div>

    <!-- 模块2：诊断管理 -->
    <div class="module module-diagnosis" id="moduleDiagnosis">...</div>

    <!-- 模块3：学生平板效果 -->
    <div class="module module-student" id="moduleStudent">...</div>
  </div>

  <!-- 弹窗 -->
  <div class="modal" id="commentModal">...</div>
  <div class="modal report-modal" id="reportModal">...</div>

  <!-- Toast 提示 -->
  <div class="toast" id="toast"></div>
</body>
```

---

## 2. 核心模块实现

### 2.1 全局导航切换

**实现方式：** 左侧固定导航栏，通过 data-page 属性切换模块

```javascript
const navItems = document.querySelectorAll('.nav-item');
const modules = document.querySelectorAll('.module');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetPage = item.dataset.page;

    // 更新导航高亮
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    // 切换模块
    modules.forEach(mod => mod.classList.remove('active'));
    document.getElementById(`module${capitalize(targetPage)}`).classList.add('active');
  });
});
```

**CSS 结构：**
```css
.global-nav {
  width: 200px;
  height: 100vh;
  background: linear-gradient(180deg, #1a1f36 0%, #252b48 100%);
  position: fixed;
  left: 0;
}

.module {
  display: none;
}
.module.active {
  display: flex;
}
```

### 2.2 页面切换（模块内）

**实现方式：** CSS 类名控制显示/隐藏

```css
.page {
  display: none;
}
.page.active {
  display: flex;
}
```

```javascript
function showPage(page) {
  pageList.classList.remove('active');
  pageGrading.classList.remove('active');
  if (page === 'list') {
    pageList.classList.add('active');
  } else {
    pageGrading.classList.add('active');
  }
}
```

### 2.2 批改模式切换

**状态变量：**
```javascript
let gradingMode = 'byQuestion'; // 'byQuestion' | 'byStudent'
```

**UI 切换逻辑：**
```javascript
function updateGradingModeUI() {
  if (gradingMode === 'byQuestion') {
    // 显示题目列表，隐藏学生列表
    // 显示学生导航，隐藏题目导航
  } else {
    // 显示学生列表，隐藏题目列表
    // 显示题目导航，隐藏学生导航
    // 更新提交按钮文字
  }
}
```

### 2.3 批注系统

#### 2.3.1 批注类型
| 类型 | CSS 类名 | 样式 |
|------|----------|------|
| 正确 | `.correct` | 绿色 ✓ |
| 错误 | `.wrong` | 红色 ✗ |
| 半对 | `.half` | 黄色 △ |
| 圈注 | `.circle` | 红色圆圈 |
| 下划线 | `.underline` | 红色下划线 |
| 文字批注 | `.comment-mark` | 红色粗体文字 |

#### 2.3.2 添加批注
```javascript
function addAnnotation(type, x, y, text = '') {
  const annotation = document.createElement('div');
  annotation.className = 'annotation';
  annotation.style.left = x + 'px';
  annotation.style.top = y + 'px';

  switch(type) {
    case 'correct':
      annotation.classList.add('correct');
      annotation.textContent = '✓';
      break;
    // ... 其他类型
  }

  // 绑定拖拽和删除事件
  makeDraggable(annotation);
  annotation.addEventListener('dblclick', () => annotation.remove());

  annotations.appendChild(annotation);
}
```

#### 2.3.3 拖拽实现
```javascript
// 状态变量
let isDragging = false;
let dragTarget = null;
let dragOffset = { x: 0, y: 0 };

// mousedown: 开始拖拽
element.addEventListener('mousedown', (e) => {
  if (currentTool !== 'select') return;
  isDragging = true;
  dragTarget = element;
  dragOffset.x = e.clientX - rect.left;
  dragOffset.y = e.clientY - rect.top;
});

// mousemove: 拖拽中（全局监听）
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  // 计算新位置（考虑缩放比例）
  let newX = (e.clientX - paperRect.left) / scale - dragOffset.x;
  let newY = (e.clientY - paperRect.top) / scale - dragOffset.y;
  // 限制在答卷范围内
  dragTarget.style.left = newX + 'px';
  dragTarget.style.top = newY + 'px';
});

// mouseup: 结束拖拽
document.addEventListener('mouseup', () => {
  isDragging = false;
  dragTarget = null;
});
```

#### 2.3.4 文字批注字号
```javascript
let selectedFontSize = 18; // 默认字号

// 字号选择按钮
document.querySelectorAll('.font-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedFontSize = parseInt(btn.dataset.size);
  });
});

// 应用字号
annotation.style.fontSize = selectedFontSize + 'px';
```

### 2.4 缩放功能

```javascript
let zoomLevel = 100;

function updateZoom() {
  document.getElementById('zoomLevel').textContent = zoomLevel + '%';
  paper.style.transform = `scale(${zoomLevel / 100})`;
}

// 缩放时拖拽位置需要除以缩放比例
const scale = zoomLevel / 100;
let newX = (e.clientX - paperRect.left) / scale - dragOffset.x;
```

### 2.5 学生报告

#### 2.5.1 显示报告
```javascript
function showStudentReport() {
  // 获取学生信息
  const studentName = document.querySelector('.student-item.active .student-name').textContent;

  // 计算总分
  const totalScore = studentScores.reduce((a, b) => a + b, 0);

  // 更新报告 UI
  document.getElementById('reportStudentName').textContent = studentName;
  document.getElementById('reportTotalScore').textContent = totalScore;

  // 生成各题得分条
  scoreOverview.innerHTML = questionScores.map((full, i) => {
    const got = studentScores[i];
    const percent = Math.round((got / full) * 100);
    return `<div class="score-item">...</div>`;
  }).join('');

  // 显示弹窗
  reportModal.classList.add('show');
}
```

#### 2.5.2 提交按钮动态文字
```javascript
function updateSubmitButtonText() {
  const submitBtn = document.getElementById('submitScore');
  if (gradingMode === 'byStudent') {
    if (currentQuestion >= totalQuestions) {
      submitBtn.textContent = '完成批改并审核报告';
    } else {
      submitBtn.textContent = '提交并去下一题';
    }
  } else {
    submitBtn.textContent = '提交并下一份';
  }
}
```

#### 2.5.3 智能跳转逻辑
```javascript
// 切换学生时检查是否需要直接显示报告
const progressText = item.querySelector('.student-progress-text').textContent;
const match = progressText.match(/已批 (\d+)\/(\d+)/);
const gradedCount = match ? parseInt(match[1]) : 0;

if (gradedCount >= totalQuestions) {
  // 直接显示报告
  showStudentReport();
} else {
  // 从未批改的题目开始
  currentQuestion = gradedCount + 1;
  updateQuestionInfo();
}
```

---

## 3. CSS 架构

### 3.1 CSS 变量
```css
:root {
  --primary: #1a73e8;
  --primary-hover: #1557b0;
  --success: #34a853;
  --warning: #fbbc04;
  --error: #ea4335;
  --bg: #f5f5f5;
  --sidebar-bg: #fff;
  --border: #e0e0e0;
  --text: #202124;
  --text-secondary: #5f6368;
  --shadow: 0 1px 3px rgba(0,0,0,0.12);
}
```

### 3.2 布局结构
```css
/* 三栏布局 */
.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar { width: 260px; }
.paper-area { flex: 1; }
.scoring-panel { width: 320px; }
```

### 3.3 组件样式规范

**按钮：**
```css
.btn { padding: 8px 16px; border-radius: 4px; }
.btn-primary { background: var(--primary); color: white; }
.btn-outline { border: 1px solid currentColor; background: transparent; }
```

**状态标签：**
```css
.status.done { background: #e6f4ea; color: var(--success); }
.status.current { background: #e8f0fe; color: var(--primary); }
.status.pending { background: var(--bg); color: var(--text-secondary); }
```

**弹窗：**
```css
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: none;
}
.modal.show { display: flex; }
```

---

## 4. 状态管理

### 4.1 全局状态
```javascript
// 批改模式
let gradingMode = 'byQuestion';

// 当前考试
let currentExam = null;

// 按题批改状态
let currentStudent = 13;
const totalStudents = 30;

// 按学生批改状态
let currentQuestion = 3;
const totalQuestions = 5;
const questionScores = [10, 10, 15, 15, 20];

// 学生得分记录
let studentScores = [10, 8, 12, 13, 19];

// 工具状态
let currentTool = 'select';
let zoomLevel = 100;

// 拖拽状态
let isDragging = false;
let dragTarget = null;
let dragOffset = { x: 0, y: 0 };

// 批注状态
let annotationCount = 0;
let pendingAnnotationPos = null;
let selectedFontSize = 18;
```

### 4.2 模拟数据
```javascript
const examsData = {
  1: { name: '2024年期中考试 - 数学', class: '高三(1)班', total: 30, done: 12 },
  2: { name: '2024年期中考试 - 语文', class: '高三(1)班', total: 30, done: 30 },
  // ...
};

const studentNames = ['李明', '王小红', '张华', '刘芳', '陈刚', ...];
```

---

## 5. 事件处理

### 5.1 事件绑定汇总
| 元素 | 事件 | 处理函数 |
|------|------|----------|
| `.btn-enter` | click | 进入批改页面 |
| `#backToList` | click | 返回列表页 |
| `.tool-btn` | click | 切换批注工具 |
| `#paper` | click | 添加批注 |
| `.annotation` | mousedown | 开始拖拽 |
| `.annotation` | dblclick | 删除批注 |
| `document` | mousemove | 拖拽中 |
| `document` | mouseup | 结束拖拽 |
| `#prevStudent/#nextStudent` | click | 切换学生 |
| `#prevQuestion/#nextQuestion` | click | 切换题目 |
| `.question-item` | click | 选择题目 |
| `.student-item` | click | 选择学生 |
| `.score-btn` | click | 快捷赋分 |
| `#submitScore` | click | 提交评分 |
| `#submitReport` | click | 提交报告 |
| `document` | keydown | ESC 关闭弹窗 |
| `#createDiagnosisBtn` | click | 创建诊断配置 |
| `.btn-edit-diagnosis` | click | 编辑诊断配置 |
| `#backToDiagnosisList` | click | 返回诊断列表 |
| `.scope-tab` | click | 切换学生范围选择方式 |
| `#publishDiagnosis` | click | 发布诊断配置 |

### 5.2 事件委托
当前实现使用直接绑定，后续优化可使用事件委托：
```javascript
// 优化建议
document.querySelector('.question-list').addEventListener('click', (e) => {
  const item = e.target.closest('.question-item');
  if (item) {
    // 处理点击
  }
});
```

---

## 6. 扩展指南

### 6.1 添加新的批注类型
1. 在 `style.css` 中添加样式：
```css
.annotation.new-type {
  /* 样式定义 */
}
```

2. 在 `index.html` 工具栏中添加按钮：
```html
<button class="tool-btn" data-tool="newType" title="新类型">
  <span>图标</span>
</button>
```

3. 在 `app.js` 的 `addAnnotation` 函数中添加 case：
```javascript
case 'newType':
  annotation.classList.add('new-type');
  // 设置内容和样式
  break;
```

### 6.2 接入后端 API
```javascript
// 示例：保存批注
async function saveAnnotations(studentId, questionId, annotations) {
  const response = await fetch('/api/annotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, questionId, annotations })
  });
  return response.json();
}

// 示例：获取学生答卷
async function getStudentAnswer(studentId, questionId) {
  const response = await fetch(`/api/answers/${studentId}/${questionId}`);
  return response.json();
}
```

### 6.3 状态持久化
```javascript
// 保存到 localStorage
function saveState() {
  localStorage.setItem('gradingState', JSON.stringify({
    gradingMode,
    currentStudent,
    currentQuestion,
    studentScores
  }));
}

// 恢复状态
function restoreState() {
  const saved = localStorage.getItem('gradingState');
  if (saved) {
    const state = JSON.parse(saved);
    // 恢复各状态变量
  }
}
```

---

## 7. 已知问题与优化建议

### 7.1 已知问题
1. 批注数据未持久化，刷新页面丢失
2. 学生/题目数据为模拟数据
3. 报告中的逐题详情为静态内容

### 7.2 优化建议
1. **性能优化**：大量批注时使用 Canvas 渲染
2. **代码重构**：拆分为模块化组件
3. **状态管理**：引入简单的状态管理模式
4. **测试覆盖**：添加单元测试和 E2E 测试

### 7.3 技术升级路径
- Phase 1（当前）：纯静态演示
- Phase 2：接入后端 API，数据持久化
- Phase 3：重构为 Vue/React 组件化架构

---

## 8. 诊断管理模块实现

### 8.1 页面切换
```javascript
function showDiagnosisPage(page) {
  diagnosisListPage.classList.remove('active');
  diagnosisEditPage.classList.remove('active');
  if (page === 'list') {
    diagnosisListPage.classList.add('active');
  } else {
    diagnosisEditPage.classList.add('active');
  }
}
```

### 8.2 学生范围选择
支持四种选择方式的标签切换：
```javascript
document.querySelectorAll('.scope-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // 更新标签高亮
    document.querySelectorAll('.scope-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // 切换对应内容区域
    const scope = tab.dataset.scope;
    // 按 scope 值显示对应的 .scope-content
  });
});
```

### 8.3 CSS 组件
**诊断类型标签：**
```css
.type-tag.online { background: #e8f0fe; color: var(--primary); }
.type-tag.direct { background: #fce8f3; color: #c41c7a; }
```

**范围选择标签：**
```css
.scope-tab { padding: 8px 16px; border-radius: 20px; }
.scope-tab.active { background: var(--primary); color: white; }
```

**富文本编辑器：**
```css
.rich-editor { border: 1px solid var(--border); border-radius: 8px; }
.editor-toolbar { display: flex; gap: 4px; padding: 8px 12px; }
.editor-content { min-height: 150px; padding: 16px; }
```

---

## 更新记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2024-04-17 | 初始版本 |
| v1.1 | 2024-04-17 | 新增全局导航、诊断管理、学生平板效果模块 |
| v1.2 | 2024-04-18 | 重构诊断管理模块为配置管理功能 |
