# 在线阅卷诊断系统 - 技术实现文档

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
    <!-- 模块1：阅卷诊断 -->
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
  <div class="modal enroll-modal" id="enrollModal">...</div>
  <div class="modal consult-modal" id="consultModal">...</div>
  <div class="modal report-list-modal" id="reportListModal">...</div>
  <div class="modal cloud-control-modal" id="cloudControlModal">...</div>

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

### 2.2 学生状态管理

**状态类型：**
```javascript
// data-report-status 属性值
'none'      // 待诊断
'grading'   // 诊断中
'pending'   // 待发布（已批完，报告未发布）
'published' // 已完成（报告已发布）
```

**状态切换逻辑：**
```javascript
document.querySelectorAll('.student-item').forEach(item => {
  item.addEventListener('click', () => {
    const reportStatus = item.dataset.reportStatus;

    if (reportStatus === 'published') {
      // 已发布：显示只读报告
      showStudentReport(true);
    } else if (reportStatus === 'pending') {
      // 待发布：显示可编辑报告
      showStudentReport(false);
    } else {
      // 正常批改流程
      // ...
    }
  });
});
```

### 2.3 报告只读模式

```javascript
function showStudentReport(readonly = false) {
  if (readonly) {
    // 禁用编辑
    overallComment.setAttribute('readonly', true);
    teacherMessage.setAttribute('readonly', true);

    // 只显示关闭按钮
    reportActions.innerHTML = `
      <button class="btn btn-outline" id="closeReportOnly">关闭</button>
    `;
  } else {
    // 可编辑模式
    overallComment.removeAttribute('readonly');
    teacherMessage.removeAttribute('readonly');

    // 显示完整操作按钮
    reportActions.innerHTML = `
      <button class="btn btn-outline" id="saveReportDraft">保存草稿</button>
      <button class="btn btn-primary" id="submitReport">发布报告，查看下一人</button>
    `;
  }
}
```

---

## 3. 诊断管理模块

### 3.1 云控开关

**HTML 结构：**
```html
<div class="cloud-control-modal" id="cloudControlModal">
  <div class="control-row" data-org="org1">
    <span class="col-org">北京总校</span>
    <span class="col-students">320人</span>
    <span class="col-status"><span class="status-dot open"></span>已开放</span>
    <span class="col-switch">
      <label class="switch">
        <input type="checkbox" checked>
        <span class="slider"></span>
      </label>
    </span>
  </div>
</div>
```

**JavaScript 逻辑：**
```javascript
// 全部开放
batchOpenAll.addEventListener('click', () => {
  document.querySelectorAll('#cloudControlListBody .switch input').forEach(cb => {
    cb.checked = true;
  });
  updateCloudControlStatus();
});

// 更新状态显示
function updateCloudControlStatus() {
  const rows = document.querySelectorAll('#cloudControlListBody .control-row');
  let openCount = 0, closedCount = 0;

  rows.forEach(row => {
    const checkbox = row.querySelector('.switch input');
    const statusCol = row.querySelector('.col-status');
    if (checkbox.checked) {
      statusCol.innerHTML = '<span class="status-dot open"></span>已开放';
      openCount++;
    } else {
      statusCol.innerHTML = '<span class="status-dot closed"></span>已关闭';
      closedCount++;
    }
  });
}
```

### 3.2 级联选择器

**三级结构：** 机构 → 班级 → 学生

```javascript
// 学生锁定（进行中诊断的已报名学生）
<div class="cascade-item-check student-check locked" data-locked="true">
  <input type="checkbox" checked disabled>
  <span class="student-info-cascade">
    <span class="stu-name">李明</span>
    <span class="stu-id">学号: 20240101</span>
  </span>
  <span class="locked-tag">已报名</span>
</div>
```

### 3.3 诊断编辑规则

```javascript
// 编辑按钮处理
document.querySelectorAll('.btn-edit-diagnosis').forEach(btn => {
  btn.addEventListener('click', () => {
    const status = btn.dataset.status;

    if (status === 'active') {
      // 进行中：显示警告，锁定已报名学生
      editNotice.classList.remove('hidden');
      document.querySelectorAll('.student-check.locked input').forEach(cb => {
        cb.disabled = true;
      });
    }
  });
});

// 查看按钮处理（已结束诊断）
document.querySelectorAll('.btn-view-diagnosis').forEach(btn => {
  btn.addEventListener('click', () => {
    // 禁用所有表单元素
    editPage.querySelectorAll('input, select, textarea').forEach(el => {
      el.disabled = true;
    });
  });
});
```

### 3.4 时间校验

```javascript
function validateDiagnosisTimes() {
  const enrollStart = new Date(startTime.value);
  const enrollEnd = new Date(endTime.value);

  // 在线模考类型需要校验考试时间
  if (diagnosisType.value === 'online') {
    const examStart = new Date(examStartTime.value);
    const examEnd = new Date(examEndTime.value);

    // 考试时间必须在报名时间区间内
    if (examStart < enrollStart) {
      showToast('考试开始时间不能早于报名开始时间');
      return false;
    }
    if (examEnd > enrollEnd) {
      showToast('考试结束时间不能晚于报名结束时间');
      return false;
    }
  }
  return true;
}
```

---

## 4. CSS 架构

### 4.1 CSS 变量
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

### 4.2 学生状态样式
```css
/* 待诊断 */
.status.pending { background: var(--bg); color: var(--text-secondary); }

/* 诊断中 */
.status.current { background: #e8f0fe; color: var(--primary); }

/* 待发布 */
.status.topublish { background: #fff3e0; color: #e65100; }

/* 已完成 */
.status.completed { background: #e6f4ea; color: var(--success); }
```

### 4.3 报名名单状态样式
```css
/* 未提交 */
.answer-status.notsubmit { background: var(--bg); color: var(--text-secondary); }

/* 阅卷中 */
.answer-status.grading { background: #fff3e0; color: #e65100; }

/* 报告已发布 */
.answer-status.published { background: #e6f4ea; color: var(--success); }
```

### 4.4 开关组件
```css
.switch {
  position: relative;
  width: 44px;
  height: 24px;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: .3s;
  border-radius: 24px;
}

.slider:before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

.switch input:checked + .slider {
  background-color: var(--success);
}

.switch input:checked + .slider:before {
  transform: translateX(20px);
}
```

### 4.5 锁定状态样式
```css
.cascade-item-check.locked {
  background: #f5f5f5;
}

.locked-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: #e0e0e0;
  color: #666;
  border-radius: 10px;
  margin-left: auto;
}
```

---

## 5. 弹窗系统

### 5.1 弹窗列表
| 弹窗 | ID | 用途 |
|------|-----|------|
| 批注弹窗 | commentModal | 输入文字批注 |
| 报告弹窗 | reportModal | 学生诊断报告 |
| 报名名单 | enrollModal | 查看报名学生 |
| 咨询名单 | consultModal | 查看课程咨询 |
| 诊断报告列表 | reportListModal | 查看所有诊断报告 |
| 云控开关 | cloudControlModal | 控制机构开放状态 |

### 5.2 弹窗通用样式
```css
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal.show {
  display: flex;
}
```

---

## 6. 事件处理汇总

### 6.1 诊断管理模块
| 元素 | 事件 | 处理函数 |
|------|------|----------|
| `#cloudControlBtn` | click | 打开云控弹窗 |
| `#saveCloudControl` | click | 保存并下发云控配置 |
| `#batchOpenAll` | click | 全部开放 |
| `#batchCloseAll` | click | 全部关闭 |
| `.btn-edit-diagnosis` | click | 编辑诊断（根据状态处理） |
| `.btn-view-diagnosis` | click | 查看诊断（只读模式） |
| `.btn-view-enroll` | click | 打开报名名单弹窗 |
| `.btn-view-consult` | click | 打开咨询名单弹窗 |
| `.btn-view-report` | click | 打开诊断报告列表弹窗 |
| `#publishDiagnosis` | click | 发布诊断（含时间校验） |
| `#diagnosisDesc` | input | 更新字数统计 |
| `#examStartTime` | change | 校验考试时间范围 |
| `#examEndTime` | change | 校验考试时间范围 |

### 6.2 阅卷诊断模块
| 元素 | 事件 | 处理函数 |
|------|------|----------|
| `.student-item` | click | 根据报告状态决定行为 |
| `#submitReport` | click | 发布报告，更新学生状态 |
| `#closeReportOnly` | click | 关闭只读报告 |

---

## 7. 数据字段说明

### 7.1 诊断列表字段
| 字段 | 说明 |
|------|------|
| 诊断名称 | 诊断配置名称 |
| 诊断类型 | 在线模考 / 数据直传 |
| 报名开放时间 | 入口开放时间范围 |
| 考试开放时间 | 仅在线模考显示，数据直传显示 "--" |
| 学生范围 | 学生范围和人数 |
| 状态 | 待开始 / 进行中 / 已结束 |

### 7.2 统计卡片字段
| 字段 | 说明 |
|------|------|
| 诊断总数 | 所有诊断数量 |
| 已报名学生 | 所有诊断的报名学生总数 |
| 已发报告 | 已发布的诊断报告数量 |
| 课程咨询 | 课程咨询提交数量 |

### 7.3 咨询名单字段
| 字段 | 说明 |
|------|------|
| 预约时间 | 学生选择的咨询时段（工作日白天/晚上、周六/周日白天/晚上） |

---

## 8. 已知问题与优化建议

### 8.1 已知问题
1. 批注数据未持久化，刷新页面丢失
2. 学生/题目数据为模拟数据
3. 报告中的逐题详情为静态内容

### 8.2 优化建议
1. **性能优化**：大量批注时使用 Canvas 渲染
2. **代码重构**：拆分为模块化组件
3. **状态管理**：引入简单的状态管理模式
4. **测试覆盖**：添加单元测试和 E2E 测试

### 8.3 技术升级路径
- Phase 1（当前）：纯静态演示
- Phase 2：接入后端 API，数据持久化
- Phase 3：重构为 Vue/React 组件化架构

---

## 更新记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2024-04-17 | 初始版本 |
| v1.1 | 2024-04-17 | 新增全局导航、诊断管理、学生平板效果模块 |
| v1.2 | 2024-04-18 | 重构诊断管理模块为配置管理功能 |
| v1.3 | 2024-04-18 | 新增级联选择器、多弹窗系统 |
| v1.4 | 2024-04-19 | 新增学生状态管理（待发布/已完成）、报告只读模式 |
| v1.5 | 2024-04-19 | 报名名单状态调整、咨询名单增加预约时间字段 |
| v1.6 | 2024-04-19 | 新增云控开关、诊断说明字段、考试时间校验、诊断列表增加考试时间列 |
