// 阅卷系统演示 - 交互逻辑

document.addEventListener('DOMContentLoaded', () => {

  // ========== 全局导航切换 ==========
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
      if (targetPage === 'grading') {
        document.getElementById('moduleGrading').classList.add('active');
      } else if (targetPage === 'diagnosis') {
        document.getElementById('moduleDiagnosis').classList.add('active');
      } else if (targetPage === 'student') {
        document.getElementById('moduleStudent').classList.add('active');
      }
    });
  });

  // ========== 阅卷批改模块 ==========
  // 页面元素
  const pageList = document.getElementById('pageList');
  const pageGrading = document.getElementById('pageGrading');

  // 考试数据
  const examsData = {
    1: { name: '2024年期中考试 - 数学', class: '高三(1)班', total: 30, done: 12, type: 'online' },
    2: { name: '2024年期中考试 - 语文', class: '高三(1)班', total: 30, done: 30, type: 'online' },
    3: { name: '2024年期中考试 - 英语', class: '高三(2)班', total: 32, done: 0, type: 'direct' },
    4: { name: '2024年月考 - 物理', class: '高三(1)班', total: 30, done: 30, type: 'online' },
    5: { name: '2024年月考 - 数学', class: '高三(2)班', total: 32, done: 24, type: 'direct' }
  };

  let currentExam = null;
  let currentExamType = 'online'; // 'online' 或 'direct'
  let gradingMode = 'byQuestion'; // 'byQuestion' 或 'byStudent'

  // 页面切换函数
  function showPage(page) {
    pageList.classList.remove('active');
    pageGrading.classList.remove('active');
    if (page === 'list') {
      pageList.classList.add('active');
    } else {
      pageGrading.classList.add('active');
    }
  }

  // 切换批改模式UI
  function updateGradingModeUI() {
    const questionList = document.getElementById('questionList');
    const studentList = document.getElementById('studentList');
    const studentNav = document.getElementById('studentNav');
    const questionNav = document.getElementById('questionNav');
    const sidebarTitle = document.getElementById('sidebarTitle');
    const gradingModeTag = document.getElementById('gradingModeTag');

    if (gradingMode === 'byQuestion') {
      // 按题批改模式
      questionList.style.display = 'block';
      studentList.style.display = 'none';
      studentNav.style.display = 'flex';
      questionNav.style.display = 'none';
      sidebarTitle.textContent = '题目列表';
      gradingModeTag.textContent = '按题批改';
    } else {
      // 按学生批改模式
      questionList.style.display = 'none';
      studentList.style.display = 'block';
      studentNav.style.display = 'none';
      questionNav.style.display = 'flex';
      sidebarTitle.textContent = '学生列表';
      gradingModeTag.textContent = '按学生批改';
      // 更新提交按钮文字
      updateSubmitButtonText();
    }
  }

  // 更新提交按钮文字（按学生批改模式）
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

  // 进入批改
  document.querySelectorAll('.btn-enter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.exam-card');
      const examId = card.dataset.exam;
      currentExam = examsData[examId];
      currentExamType = card.dataset.type || currentExam.type || 'online';

      // 获取批改模式
      gradingMode = btn.dataset.mode || 'byQuestion';

      // 更新顶部考试名称
      document.getElementById('currentExamName').textContent = currentExam.name;

      // 更新诊断类型标签
      const examTypeTag = document.getElementById('examTypeTag');
      examTypeTag.textContent = currentExamType === 'direct' ? '数据直传' : '在线模考';
      examTypeTag.className = 'exam-type-tag-header ' + currentExamType;

      // 更新UI
      updateGradingModeUI();

      // 根据诊断类型控制评分面板显示
      updateScoringPanelVisibility();

      showPage('grading');
      const modeText = gradingMode === 'byStudent' ? '按学生批改' : '按题批改';
      showToast(`进入${modeText}: ${currentExam.name}`);
    });
  });

  // 根据诊断类型控制评分面板显示
  function updateScoringPanelVisibility() {
    const scoringPanel = document.querySelector('.scoring-panel');
    const scoreSection = scoringPanel.querySelector('.panel-section:first-child');
    const paperContentOnline = document.getElementById('paperContentOnline');
    const paperContentDirect = document.getElementById('paperContentDirect');

    if (currentExamType === 'direct') {
      // 数据直传类型：显示答题卡图片，隐藏评分区域
      paperContentOnline.style.display = 'none';
      paperContentDirect.style.display = 'flex';

      scoreSection.innerHTML = `
        <h3>评分</h3>
        <div class="direct-score-notice">
          <p class="notice-text">数据直传模式</p>
          <p class="notice-desc">分数已从小分表自动获取，仅支持批注</p>
          <div class="auto-score-display">
            <span class="label">本题得分</span>
            <span class="score-value">11 / 15 分</span>
          </div>
        </div>
      `;
    } else {
      // 在线模考类型：显示文字作答，显示完整评分面板
      paperContentOnline.style.display = 'block';
      paperContentDirect.style.display = 'none';

      scoreSection.innerHTML = `
        <h3>评分</h3>
        <div class="score-input-group">
          <label>本题得分</label>
          <div class="score-input-wrapper">
            <input type="number" id="scoreInput" class="score-input" value="12" min="0" max="15">
            <span class="score-max">/ 15 分</span>
          </div>
        </div>
        <div class="quick-scores">
          <span class="label">快捷赋分:</span>
          <button class="score-btn" data-score="15">满分</button>
          <button class="score-btn" data-score="12">12</button>
          <button class="score-btn" data-score="10">10</button>
          <button class="score-btn" data-score="8">8</button>
          <button class="score-btn" data-score="5">5</button>
          <button class="score-btn" data-score="0">0</button>
        </div>
      `;
      // 重新绑定快捷赋分事件
      bindQuickScoreEvents();
    }
  }

  // 绑定快捷赋分事件
  function bindQuickScoreEvents() {
    document.querySelectorAll('.quick-scores .score-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const score = btn.dataset.score;
        const scoreInput = document.getElementById('scoreInput');
        if (scoreInput) {
          scoreInput.value = score;
        }
      });
    });
  }

  // 返回列表
  document.getElementById('backToList').addEventListener('click', () => {
    showPage('list');
  });

  // 元素引用
  const paper = document.getElementById('paper');
  const paperContainer = document.getElementById('paperContainer');
  const annotations = document.getElementById('annotations');
  const scoreInput = document.getElementById('scoreInput');
  const commentModal = document.getElementById('commentModal');
  const reportModal = document.getElementById('reportModal');
  const toast = document.getElementById('toast');

  // 状态
  let currentTool = 'select';
  let zoomLevel = 100;
  let annotationCount = 0;
  let pendingAnnotationPos = null;
  let selectedFontSize = 18; // 默认字号

  // 学生各题得分记录（模拟数据）
  let studentScores = [10, 8, 12, 13, 19]; // 对应5道题的得分

  // 拖拽状态
  let isDragging = false;
  let dragTarget = null;
  let dragOffset = { x: 0, y: 0 };

  // 涂鸦状态
  let isDrawing = false;
  let doodlePath = [];
  let currentDoodleSvg = null;

  // 工具栏切换
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;

      if (tool === 'undo') {
        undoLastAnnotation();
        return;
      }

      if (tool === 'clear') {
        clearAllAnnotations();
        return;
      }

      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = tool;

      // 更改鼠标样式
      paper.style.cursor = tool === 'select' ? 'default' : 'crosshair';
    });
  });

  // 点击答卷添加批注
  paper.addEventListener('click', (e) => {
    if (currentTool === 'select' || currentTool === 'doodle') return;

    const rect = paper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'comment') {
      pendingAnnotationPos = { x, y };
      commentModal.classList.add('show');
      document.getElementById('annotationText').focus();
      return;
    }

    addAnnotation(currentTool, x, y);
  });

  // 涂鸦功能 - 鼠标按下开始绘制
  paper.addEventListener('mousedown', (e) => {
    if (currentTool !== 'doodle') return;

    isDrawing = true;
    const rect = paper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    doodlePath = [{ x, y }];

    // 创建SVG元素
    currentDoodleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    currentDoodleSvg.classList.add('doodle-svg');
    currentDoodleSvg.setAttribute('width', paper.offsetWidth);
    currentDoodleSvg.setAttribute('height', paper.offsetHeight);
    currentDoodleSvg.style.position = 'absolute';
    currentDoodleSvg.style.left = '0';
    currentDoodleSvg.style.top = '0';
    currentDoodleSvg.style.pointerEvents = 'none';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', '#ea4335');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('d', `M ${x} ${y}`);
    currentDoodleSvg.appendChild(path);
    annotations.appendChild(currentDoodleSvg);
  });

  // 涂鸦功能 - 鼠标移动绘制路径
  paper.addEventListener('mousemove', (e) => {
    if (!isDrawing || currentTool !== 'doodle') return;

    const rect = paper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    doodlePath.push({ x, y });

    // 更新路径
    const path = currentDoodleSvg.querySelector('path');
    let d = path.getAttribute('d');
    d += ` L ${x} ${y}`;
    path.setAttribute('d', d);
  });

  // 涂鸦功能 - 鼠标抬起结束绘制
  paper.addEventListener('mouseup', () => {
    if (!isDrawing) return;
    isDrawing = false;

    if (currentDoodleSvg && doodlePath.length > 1) {
      currentDoodleSvg.dataset.id = ++annotationCount;
      currentDoodleSvg.classList.add('annotation');
      addHistory('添加涂鸦标记');
    } else if (currentDoodleSvg) {
      // 如果只是点击没有移动，移除空的SVG
      currentDoodleSvg.remove();
    }

    currentDoodleSvg = null;
    doodlePath = [];
  });

  // 涂鸦功能 - 鼠标离开区域结束绘制
  paper.addEventListener('mouseleave', () => {
    if (isDrawing) {
      isDrawing = false;
      if (currentDoodleSvg && doodlePath.length > 1) {
        currentDoodleSvg.dataset.id = ++annotationCount;
        currentDoodleSvg.classList.add('annotation');
        addHistory('添加涂鸦标记');
      }
      currentDoodleSvg = null;
      doodlePath = [];
    }
  });

  // 添加批注
  function addAnnotation(type, x, y, text = '') {
    const annotation = document.createElement('div');
    annotation.className = 'annotation';
    annotation.style.left = x + 'px';
    annotation.style.top = y + 'px';
    annotation.dataset.id = ++annotationCount;

    switch(type) {
      case 'correct':
        annotation.classList.add('correct');
        annotation.textContent = '✓';
        addHistory('标记 ✓ 正确');
        break;
      case 'wrong':
        annotation.classList.add('wrong');
        annotation.textContent = '✗';
        addHistory('标记 ✗ 错误');
        break;
      case 'halfCorrect':
        annotation.classList.add('half');
        annotation.textContent = '△';
        addHistory('标记 △ 半对');
        break;
      case 'circle':
        annotation.classList.add('circle');
        addHistory('添加圈注');
        break;
      case 'underline':
        annotation.classList.add('underline');
        addHistory('添加下划线');
        break;
      case 'comment':
        annotation.classList.add('comment-mark');
        annotation.innerHTML = `<span class="comment-text">${text}</span>`;
        annotation.style.fontSize = selectedFontSize + 'px';
        annotation.dataset.fontSize = selectedFontSize;
        addHistory(`添加批注 "${text.substring(0, 10)}..."`);
        break;
    }

    // 双击删除批注
    annotation.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      annotation.remove();
      showToast('批注已删除');
    });

    // 拖拽功能
    makeDraggable(annotation);

    annotations.appendChild(annotation);
    showToast('批注已添加（可拖动调整位置）');
  }

  // 使批注可拖拽
  function makeDraggable(element) {
    element.addEventListener('mousedown', (e) => {
      // 仅在选择工具模式下可拖拽
      if (currentTool !== 'select') return;

      e.preventDefault();
      e.stopPropagation();

      isDragging = true;
      dragTarget = element;

      const rect = element.getBoundingClientRect();
      const paperRect = paper.getBoundingClientRect();
      const scale = zoomLevel / 100;

      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;

      element.style.cursor = 'grabbing';
      element.style.zIndex = '100';
    });
  }

  // 全局鼠标移动事件
  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !dragTarget) return;

    const paperRect = paper.getBoundingClientRect();
    const scale = zoomLevel / 100;

    // 计算新位置（考虑缩放）
    let newX = (e.clientX - paperRect.left) / scale - dragOffset.x;
    let newY = (e.clientY - paperRect.top) / scale - dragOffset.y;

    // 限制在答卷范围内
    const maxX = paper.offsetWidth - dragTarget.offsetWidth;
    const maxY = paper.offsetHeight - dragTarget.offsetHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    dragTarget.style.left = newX + 'px';
    dragTarget.style.top = newY + 'px';
  });

  // 全局鼠标释放事件
  document.addEventListener('mouseup', () => {
    if (isDragging && dragTarget) {
      dragTarget.style.cursor = 'grab';
      dragTarget.style.zIndex = '';
      isDragging = false;
      dragTarget = null;
    }
  });

  // 撤销最后一个批注
  function undoLastAnnotation() {
    const allAnnotations = annotations.querySelectorAll('.annotation, .doodle-svg');
    if (allAnnotations.length > 0) {
      allAnnotations[allAnnotations.length - 1].remove();
      showToast('已撤销');
      addHistory('撤销批注');
    }
  }

  // 清除所有批注
  function clearAllAnnotations() {
    const allItems = annotations.querySelectorAll('.annotation, .doodle-svg');
    if (allItems.length === 0) return;
    if (confirm('确定要清除所有批注吗？')) {
      annotations.innerHTML = '';
      showToast('已清除所有批注');
      addHistory('清除所有批注');
    }
  }

  // 字号选择
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFontSize = parseInt(btn.dataset.size);
    });
  });

  // 批注弹窗
  document.getElementById('saveAnnotation').addEventListener('click', () => {
    const text = document.getElementById('annotationText').value.trim();
    if (text && pendingAnnotationPos) {
      addAnnotation('comment', pendingAnnotationPos.x, pendingAnnotationPos.y, text);
    }
    closeCommentModal();
  });

  document.getElementById('cancelAnnotation').addEventListener('click', closeCommentModal);

  function closeCommentModal() {
    commentModal.classList.remove('show');
    document.getElementById('annotationText').value = '';
    pendingAnnotationPos = null;
    // 重置字号选择为默认
    document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.font-btn[data-size="18"]').classList.add('active');
    selectedFontSize = 18;
  }

  // 缩放控制
  document.getElementById('zoomIn').addEventListener('click', () => {
    if (zoomLevel < 150) {
      zoomLevel += 10;
      updateZoom();
    }
  });

  document.getElementById('zoomOut').addEventListener('click', () => {
    if (zoomLevel > 50) {
      zoomLevel -= 10;
      updateZoom();
    }
  });

  function updateZoom() {
    document.getElementById('zoomLevel').textContent = zoomLevel + '%';
    paper.style.transform = `scale(${zoomLevel / 100})`;
  }

  // 快捷赋分
  document.querySelectorAll('.score-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const score = btn.dataset.score;
      scoreInput.value = score;
      addHistory(`评分: ${score}分`);
      showToast(`已赋分: ${score}分`);
    });
  });


  // ========== 按题批改模式：学生导航 ==========
  let currentStudent = 13;
  const totalStudents = 30;
  const studentNames = ['李明', '王小红', '张华', '刘芳', '陈刚', '赵丽', '孙伟', '周敏', '吴强', '郑琳'];

  document.getElementById('prevStudent').addEventListener('click', () => {
    if (currentStudent > 1) {
      currentStudent--;
      updateStudentInfoByQuestion();
      showToast('已切换到上一份');
    }
  });

  document.getElementById('nextStudent').addEventListener('click', () => {
    if (currentStudent < totalStudents) {
      currentStudent++;
      updateStudentInfoByQuestion();
      showToast('已切换到下一份');
    }
  });

  function updateStudentInfoByQuestion() {
    const name = studentNames[currentStudent % studentNames.length];
    document.getElementById('studentInfoText').textContent =
      `学生: ${name} (第 ${currentStudent}/${totalStudents} 份)`;
    // 清除批注
    annotations.innerHTML = '';
  }

  // 题目切换（按题批改模式）
  document.querySelectorAll('.question-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.question-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      showToast(`已切换到 ${item.querySelector('.question-num').textContent}`);
      annotations.innerHTML = '';
    });
  });

  // ========== 按学生批改模式：题目导航 ==========
  let currentQuestion = 3;
  const totalQuestions = 5;
  const questionScores = [10, 10, 15, 15, 20];

  document.getElementById('prevQuestion').addEventListener('click', () => {
    if (currentQuestion > 1) {
      currentQuestion--;
      updateQuestionInfo();
      showToast('已切换到上一题');
    }
  });

  document.getElementById('nextQuestion').addEventListener('click', () => {
    if (currentQuestion < totalQuestions) {
      currentQuestion++;
      updateQuestionInfo();
      updateSubmitButtonText();
      showToast('已切换到下一题');
    }
  });

  function updateQuestionInfo() {
    const score = questionScores[currentQuestion - 1];
    document.getElementById('questionInfoText').textContent =
      `第 ${currentQuestion}/${totalQuestions} 题 (满分${score}分)`;
    // 清除批注
    annotations.innerHTML = '';
    // 更新按钮文字
    updateSubmitButtonText();
  }

  // 学生切换（按学生批改模式）
  document.querySelectorAll('.student-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.student-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const name = item.querySelector('.student-name').textContent;
      const reportStatus = item.dataset.reportStatus; // 获取报告状态

      // 根据报告状态决定行为
      if (reportStatus === 'published') {
        // 已发布：显示只读报告
        showToast(`学生 ${name} 的报告已发布`);
        showStudentReport(true); // true 表示只读模式
        return;
      }

      if (reportStatus === 'pending') {
        // 待发布：显示可编辑报告
        showToast(`学生 ${name} 已批改完成，请审核发布报告`);
        showStudentReport(false); // false 表示可编辑模式
        return;
      }

      // grading 或 none：正常批改流程
      // 获取该学生的批改进度（模拟数据）
      const progressText = item.querySelector('.student-progress-text').textContent;
      const match = progressText.match(/已批 (\d+)\/(\d+)/);
      const gradedCount = match ? parseInt(match[1]) : 0;

      // 如果已经批完所有题目，直接显示报告
      if (gradedCount >= totalQuestions) {
        showToast(`学生 ${name} 已批改完成，请审核报告`);
        showStudentReport(false);
        return;
      }

      showToast(`已切换到学生: ${name}`);
      currentQuestion = gradedCount + 1; // 从未批改的题目开始
      updateQuestionInfo();
      annotations.innerHTML = '';
      studentScores = [0, 0, 0, 0, 0]; // 重置得分
    });
  });

  // 保存草稿
  document.getElementById('saveDraft').addEventListener('click', () => {
    showToast('草稿已保存');
  });

  // 题干和答案解析展开/收起
  const analysisToggle = document.getElementById('analysisToggle');
  if (analysisToggle) {
    analysisToggle.addEventListener('click', () => {
      analysisToggle.classList.toggle('expanded');
    });
  }

  // 提交评分
  document.getElementById('submitScore').addEventListener('click', () => {
    const score = scoreInput.value;

    if (gradingMode === 'byQuestion') {
      // 按题批改：提交后切换到下一个学生
      showToast(`已提交评分: ${score}分，正在加载下一份...`);
      setTimeout(() => {
        if (currentStudent < totalStudents) {
          currentStudent++;
          updateStudentInfoByQuestion();
          scoreInput.value = '';
        } else {
          showToast('当前题目所有学生批改完成！');
        }
      }, 500);
    } else {
      // 按学生批改：提交后切换到下一道题或显示报告
      // 保存当前题目得分
      studentScores[currentQuestion - 1] = parseInt(score) || 0;

      if (currentQuestion < totalQuestions) {
        showToast(`已提交评分: ${score}分，正在加载下一题...`);
        setTimeout(() => {
          currentQuestion++;
          updateQuestionInfo();
          updateSubmitButtonText();
          scoreInput.value = '';
        }, 500);
      } else {
        // 最后一题批改完成，显示整体报告
        showToast(`已提交评分: ${score}分，正在生成诊断报告...`);
        setTimeout(() => {
          showStudentReport(false);
          scoreInput.value = '';
        }, 500);
      }
    }
  });

  // ========== 学生整体报告 ==========
  function showStudentReport(readonly = false) {
    // 获取当前学生名称
    const activeStudent = document.querySelector('.student-item.active');
    const studentName = activeStudent ? activeStudent.querySelector('.student-name').textContent : '李明';

    // 更新报告中的学生名称
    document.getElementById('reportStudentName').textContent = studentName;
    document.querySelector('.profile-avatar').textContent = studentName.charAt(0);

    // 计算总分（数据直传类型从小分表获取，在线模考从批改结果获取）
    let displayScores = studentScores;
    if (currentExamType === 'direct') {
      // 数据直传类型：分数从上传的小分表自动获取（模拟数据）
      displayScores = [10, 8, 12, 13, 19];
    } else if (readonly) {
      // 已发布报告的模拟数据
      displayScores = [10, 8, 12, 13, 19];
    }
    const totalScore = displayScores.reduce((a, b) => a + b, 0);
    const fullScore = questionScores.reduce((a, b) => a + b, 0);
    document.getElementById('reportTotalScore').textContent = totalScore;
    document.querySelector('.score-full').textContent = `/ ${fullScore} 分`;

    // 更新各题得分条
    const scoreOverview = document.getElementById('scoreOverview');
    const scoreSourceNote = currentExamType === 'direct' ? '<p class="score-source-note">分数来源：学生小分表自动导入</p>' : '';
    scoreOverview.innerHTML = scoreSourceNote + questionScores.map((full, i) => {
      const got = displayScores[i];
      const percent = Math.round((got / full) * 100);
      return `
        <div class="score-item">
          <span class="item-label">第${i + 1}题</span>
          <div class="item-bar">
            <div class="item-fill" style="width: ${percent}%"></div>
          </div>
          <span class="item-score">${got}/${full}</span>
        </div>
      `;
    }).join('');

    // 获取报告操作区域
    const reportActions = document.querySelector('.report-actions');
    const overallComment = document.getElementById('overallComment');
    const teacherMessage = document.getElementById('teacherMessage');

    if (readonly) {
      // 只读模式：禁用编辑，隐藏发布按钮
      overallComment.setAttribute('readonly', true);
      teacherMessage.setAttribute('readonly', true);
      overallComment.value = '该生在本次考试中表现良好，函数求导和三角函数部分掌握较为扎实，但在数列求和部分仍需加强练习。建议多做相关类型题目，巩固解题思路。';
      teacherMessage.value = '继续保持学习热情，相信你一定能取得更大的进步！加油！';

      // 隐藏发布按钮，只显示关闭按钮
      reportActions.innerHTML = `
        <button class="btn btn-outline" id="closeReportOnly">关闭</button>
      `;
      // 重新绑定关闭事件
      document.getElementById('closeReportOnly').addEventListener('click', () => {
        reportModal.classList.remove('show');
      });
    } else {
      // 可编辑模式：恢复编辑功能
      overallComment.removeAttribute('readonly');
      teacherMessage.removeAttribute('readonly');

      // 恢复原始按钮
      reportActions.innerHTML = `
        <button class="btn btn-primary" id="submitReport">发布报告，查看下一人</button>
      `;
      // 重新绑定事件
      bindReportButtons();
    }

    // 显示报告弹窗
    reportModal.classList.add('show');
  }

  // 绑定报告按钮事件
  function bindReportButtons() {
    const submitBtn = document.getElementById('submitReport');

    if (submitBtn) {
      submitBtn.addEventListener('click', handleSubmitReport);
    }
  }

  // 处理报告提交
  function handleSubmitReport() {
    const overallComment = document.getElementById('overallComment').value;
    const teacherMessage = document.getElementById('teacherMessage').value;

    if (!overallComment.trim() || !teacherMessage.trim()) {
      showToast('请填写整体评价建议和老师寄语');
      return;
    }

    showToast('报告已发布！正在加载下一位学生...');
    reportModal.classList.remove('show');

    // 更新当前学生状态为已完成
    const currentActiveStudent = document.querySelector('.student-item.active');
    if (currentActiveStudent) {
      currentActiveStudent.dataset.reportStatus = 'published';
      currentActiveStudent.querySelector('.status').className = 'status completed';
      currentActiveStudent.querySelector('.status').textContent = '已完成';
      currentActiveStudent.querySelector('.student-progress-text').textContent = `已批 ${totalQuestions}/${totalQuestions} 题`;
    }

    // 切换到下一个学生
    setTimeout(() => {
      const students = document.querySelectorAll('.student-item');
      let currentIndex = -1;
      students.forEach((item, index) => {
        if (item.classList.contains('active')) {
          currentIndex = index;
        }
      });

      if (currentIndex < students.length - 1) {
        students[currentIndex].classList.remove('active');
        students[currentIndex + 1].classList.add('active');
        const nextStudent = students[currentIndex + 1];
        const nextName = nextStudent.querySelector('.student-name').textContent;
        const nextStatus = nextStudent.dataset.reportStatus;

        // 根据下一个学生状态决定行为
        if (nextStatus === 'published') {
          showToast(`学生 ${nextName} 的报告已发布`);
          showStudentReport(true);
        } else if (nextStatus === 'pending') {
          showToast(`学生 ${nextName} 已批改完成，请审核发布报告`);
          document.getElementById('overallComment').value = '';
          document.getElementById('teacherMessage').value = '';
          showStudentReport(false);
        } else {
          // 检查批改进度
          const progressText = nextStudent.querySelector('.student-progress-text').textContent;
          const match = progressText.match(/已批 (\d+)\/(\d+)/);
          const gradedCount = match ? parseInt(match[1]) : 0;

          if (gradedCount >= totalQuestions) {
            showToast(`学生 ${nextName} 已批改完成，请审核报告`);
            document.getElementById('overallComment').value = '';
            document.getElementById('teacherMessage').value = '';
            showStudentReport(false);
          } else {
            showToast(`已切换到学生: ${nextName}`);
            currentQuestion = gradedCount + 1;
            updateQuestionInfo();
            updateSubmitButtonText();
            scoreInput.value = '';
            studentScores = [0, 0, 0, 0, 0];
            annotations.innerHTML = '';
          }
        }
      } else {
        showToast('所有学生批改完成！');
      }
    }, 1000);
  }

  // 关闭报告
  document.getElementById('closeReport').addEventListener('click', () => {
    reportModal.classList.remove('show');
  });

  // 初始化报告按钮事件绑定
  bindReportButtons();

  // 添加历史记录
  function addHistory(action) {
    const historyList = document.querySelector('.history-list');
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <span class="time">${time}</span>
      <span class="action">${action}</span>
    `;

    historyList.insertBefore(item, historyList.firstChild);

    // 保持最多显示10条
    while (historyList.children.length > 10) {
      historyList.removeChild(historyList.lastChild);
    }
  }

  // 显示提示
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // ESC 关闭弹窗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && commentModal.classList.contains('show')) {
      closeCommentModal();
    }
  });

  // 分数输入验证
  scoreInput.addEventListener('input', () => {
    let value = parseInt(scoreInput.value) || 0;
    const max = parseInt(scoreInput.max);
    if (value > max) scoreInput.value = max;
    if (value < 0) scoreInput.value = 0;
  });

  // ========== 诊断管理模块 ==========
  const diagnosisListPage = document.getElementById('diagnosisListPage');
  const diagnosisEditPage = document.getElementById('diagnosisEditPage');

  // 显示诊断列表/编辑页
  function showDiagnosisPage(page) {
    diagnosisListPage.classList.remove('active');
    diagnosisEditPage.classList.remove('active');
    if (page === 'list') {
      diagnosisListPage.classList.add('active');
    } else {
      diagnosisEditPage.classList.add('active');
    }
  }

  // 创建诊断按钮
  document.getElementById('createDiagnosisBtn').addEventListener('click', () => {
    document.getElementById('diagnosisEditTitle').textContent = '创建诊断配置';
    // 清空表单
    document.getElementById('diagnosisName').value = '';
    document.getElementById('diagnosisDesc').value = '';
    document.getElementById('diagnosisDescCount').textContent = '0';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    showDiagnosisPage('edit');
  });

  // 诊断说明字数统计
  const diagnosisDesc = document.getElementById('diagnosisDesc');
  const diagnosisDescCount = document.getElementById('diagnosisDescCount');
  if (diagnosisDesc && diagnosisDescCount) {
    diagnosisDesc.addEventListener('input', () => {
      diagnosisDescCount.textContent = diagnosisDesc.value.length;
    });
  }

  // 编辑诊断按钮
  document.querySelectorAll('.btn-edit-diagnosis').forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.status;
      document.getElementById('diagnosisEditTitle').textContent = '编辑诊断配置';

      // 进行中的诊断显示警告提示
      const editNotice = document.getElementById('editActiveNotice');
      if (status === 'active') {
        editNotice.classList.remove('hidden');
        // 锁定已有学生的复选框
        document.querySelectorAll('.student-check.locked input').forEach(cb => {
          cb.disabled = true;
        });
      } else {
        editNotice.classList.add('hidden');
        // 解锁学生复选框（待开始状态可以自由编辑）
        document.querySelectorAll('.student-check.locked').forEach(item => {
          item.classList.remove('locked');
          const tag = item.querySelector('.locked-tag');
          if (tag) tag.remove();
          item.querySelector('input').disabled = false;
        });
      }

      showDiagnosisPage('edit');
    });
  });

  // 查看诊断按钮（已结束的诊断只能查看）
  document.querySelectorAll('.btn-view-diagnosis').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('diagnosisEditTitle').textContent = '查看诊断配置';

      // 隐藏编辑警告
      document.getElementById('editActiveNotice').classList.add('hidden');

      // 禁用所有表单元素
      const editPage = document.getElementById('diagnosisEditPage');
      editPage.querySelectorAll('input, select, textarea').forEach(el => {
        el.disabled = true;
      });
      editPage.querySelectorAll('button:not(#backToDiagnosisList)').forEach(el => {
        if (!el.classList.contains('close-enroll') && !el.classList.contains('close-consult')) {
          el.disabled = true;
        }
      });

      // 隐藏操作按钮，只显示返回
      const formActions = editPage.querySelector('.form-actions');
      if (formActions) {
        formActions.innerHTML = `
          <button type="button" class="btn btn-outline" id="backFromView">返回列表</button>
        `;
        document.getElementById('backFromView').addEventListener('click', () => {
          // 恢复表单可编辑状态
          editPage.querySelectorAll('input, select, textarea, button').forEach(el => {
            el.disabled = false;
          });
          // 恢复操作按钮
          formActions.innerHTML = `
            <button type="button" class="btn btn-outline" id="cancelDiagnosis">取消</button>
            <button type="button" class="btn btn-outline" id="saveDiagnosisDraft">保存草稿</button>
            <button type="button" class="btn btn-primary" id="publishDiagnosis">发布诊断</button>
          `;
          rebindDiagnosisButtons();
          showDiagnosisPage('list');
        });
      }

      showDiagnosisPage('edit');
    });
  });

  // 重新绑定诊断操作按钮
  function rebindDiagnosisButtons() {
    document.getElementById('cancelDiagnosis').addEventListener('click', () => {
      showDiagnosisPage('list');
    });
    document.getElementById('saveDiagnosisDraft').addEventListener('click', () => {
      showToast('诊断配置草稿已保存');
    });
    document.getElementById('publishDiagnosis').addEventListener('click', () => {
      showToast('诊断配置已发布');
      showDiagnosisPage('list');
    });
  }

  // 返回列表
  document.getElementById('backToDiagnosisList').addEventListener('click', () => {
    showDiagnosisPage('list');
  });

  // 取消按钮
  document.getElementById('cancelDiagnosis').addEventListener('click', () => {
    showDiagnosisPage('list');
  });

  // 保存草稿
  document.getElementById('saveDiagnosisDraft').addEventListener('click', () => {
    showToast('诊断配置草稿已保存');
    showDiagnosisPage('list');
  });

  // 发布诊断
  document.getElementById('publishDiagnosis').addEventListener('click', () => {
    const name = document.getElementById('diagnosisName').value;
    if (!name.trim()) {
      showToast('请填写诊断名称');
      return;
    }

    // 校验时间
    if (!validateDiagnosisTimes()) {
      return;
    }

    showToast('诊断配置已发布');
    showDiagnosisPage('list');
  });

  // 校验诊断时间配置
  function validateDiagnosisTimes() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    if (!startTime || !endTime) {
      showToast('请填写报名开放时间');
      return false;
    }

    const enrollStart = new Date(startTime);
    const enrollEnd = new Date(endTime);

    if (enrollStart >= enrollEnd) {
      showToast('报名结束时间必须晚于开始时间');
      return false;
    }

    // 检查是否是在线模考类型
    const diagnosisType = document.querySelector('input[name="diagnosisType"]:checked');
    if (diagnosisType && diagnosisType.value === 'online') {
      const examStartTime = document.getElementById('examStartTime').value;
      const examEndTime = document.getElementById('examEndTime').value;

      if (!examStartTime || !examEndTime) {
        showToast('请填写考试开放时间');
        return false;
      }

      const examStart = new Date(examStartTime);
      const examEnd = new Date(examEndTime);

      if (examStart >= examEnd) {
        showToast('考试结束时间必须晚于开始时间');
        return false;
      }

      // 时间校验规则（支持提前报名 + 考试期间也能报名并考试）：
      // 1. 报名结束时间必须 >= 考试结束时间（保证考试期间都能报名参与）
      // 2. 报名开始时间可以早于考试开始时间（支持提前预告和报名）
      // 3. 考试开始时间可以早于报名开始时间（特殊场景，不做限制）

      if (enrollEnd < examEnd) {
        showToast('报名结束时间不能早于考试结束时间，需保证考试期间学生可报名参与');
        return false;
      }
    }

    return true;
  }

  // 考试时间输入时实时校验提示
  const examStartTimeInput = document.getElementById('examStartTime');
  const examEndTimeInput = document.getElementById('examEndTime');

  if (examStartTimeInput) {
    examStartTimeInput.addEventListener('change', validateExamTimeRange);
  }
  if (examEndTimeInput) {
    examEndTimeInput.addEventListener('change', validateExamTimeRange);
  }

  function validateExamTimeRange() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const examStartTime = document.getElementById('examStartTime').value;
    const examEndTime = document.getElementById('examEndTime').value;

    if (!endTime) {
      showToast('请先填写报名结束时间');
      return;
    }

    const enrollEnd = new Date(endTime);

    // 校验：报名结束时间必须 >= 考试结束时间
    if (examEndTime) {
      const examEnd = new Date(examEndTime);
      if (examEnd > enrollEnd) {
        showToast('提示：报名结束时间应不早于考试结束时间，以保证考试期间学生可直接参与');
      }
    }
  }

  // ========== 云控开关 ==========
  const cloudControlModal = document.getElementById('cloudControlModal');
  const cloudControlBtn = document.getElementById('cloudControlBtn');
  const closeCloudControl = document.getElementById('closeCloudControl');
  const cancelCloudControl = document.getElementById('cancelCloudControl');
  const saveCloudControl = document.getElementById('saveCloudControl');

  // 打开云控弹窗
  if (cloudControlBtn) {
    cloudControlBtn.addEventListener('click', () => {
      cloudControlModal.classList.add('show');
    });
  }

  // 关闭云控弹窗
  if (closeCloudControl) {
    closeCloudControl.addEventListener('click', () => {
      cloudControlModal.classList.remove('show');
    });
  }

  if (cancelCloudControl) {
    cancelCloudControl.addEventListener('click', () => {
      cloudControlModal.classList.remove('show');
    });
  }

  // 保存并下发
  if (saveCloudControl) {
    saveCloudControl.addEventListener('click', () => {
      showToast('云控配置已保存并下发');
      cloudControlModal.classList.remove('show');
    });
  }

  // 全部开放
  const batchOpenAll = document.getElementById('batchOpenAll');
  if (batchOpenAll) {
    batchOpenAll.addEventListener('click', () => {
      document.querySelectorAll('#cloudControlListBody .switch input').forEach(cb => {
        cb.checked = true;
      });
      updateCloudControlStatus();
      showToast('已设置全部开放');
    });
  }

  // 全部关闭
  const batchCloseAll = document.getElementById('batchCloseAll');
  if (batchCloseAll) {
    batchCloseAll.addEventListener('click', () => {
      document.querySelectorAll('#cloudControlListBody .switch input').forEach(cb => {
        cb.checked = false;
      });
      updateCloudControlStatus();
      showToast('已设置全部关闭');
    });
  }

  // 开关切换时更新状态显示
  document.querySelectorAll('#cloudControlListBody .switch input').forEach(cb => {
    cb.addEventListener('change', () => {
      updateCloudControlStatus();
    });
  });

  // 更新云控状态显示
  function updateCloudControlStatus() {
    const rows = document.querySelectorAll('#cloudControlListBody .control-row');
    let openCount = 0;
    let closedCount = 0;

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

    // 更新统计
    const summary = document.querySelector('.control-summary');
    if (summary) {
      summary.innerHTML = `共 <strong>${rows.length}</strong> 个机构，<strong>${openCount}</strong> 个已开放，<strong>${closedCount}</strong> 个已关闭`;
    }
  }

  // 云控搜索
  const cloudControlSearch = document.getElementById('cloudControlSearch');
  if (cloudControlSearch) {
    cloudControlSearch.addEventListener('input', () => {
      const keyword = cloudControlSearch.value.toLowerCase();
      document.querySelectorAll('#cloudControlListBody .control-row').forEach(row => {
        const orgName = row.querySelector('.col-org').textContent.toLowerCase();
        if (orgName.includes(keyword)) {
          row.style.display = 'grid';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // ========== 诊断类型切换 ==========
  const onlineExamConfig = document.getElementById('onlineExamConfig');
  const directDataConfig = document.getElementById('directDataConfig');

  document.querySelectorAll('input[name="diagnosisType"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'online') {
        onlineExamConfig.classList.remove('hidden');
        directDataConfig.classList.add('hidden');
      } else {
        onlineExamConfig.classList.add('hidden');
        directDataConfig.classList.remove('hidden');
      }
    });
  });

  // ========== 题目管理 ==========
  const questionTypes = {
    'Q001': { type: 'choice', name: '单选题' },
    'Q002': { type: 'choice', name: '单选题' },
    'Q003': { type: 'multi', name: '多选题' },
    'Q004': { type: 'fill', name: '填空题' },
    'Q005': { type: 'essay', name: '解答题' },
    'Q006': { type: 'essay', name: '解答题' },
    'Q007': { type: 'essay', name: '解答题' },
    'Q008': { type: 'judge', name: '判断题' },
    'Q009': { type: 'choice', name: '单选题' },
    'Q010': { type: 'fill', name: '填空题' }
  };

  // 添加题目（在线模考 - 支持批量）
  const addQuestionBtn = document.getElementById('addQuestionBtn');
  if (addQuestionBtn) {
    addQuestionBtn.addEventListener('click', () => {
      const input = document.getElementById('questionIdInput');
      const inputValue = input.value.trim();
      if (!inputValue) {
        showToast('请输入题目ID');
        return;
      }

      // 支持逗号分隔的批量输入
      const qids = inputValue.split(/[,，]/).map(id => id.trim().toUpperCase()).filter(id => id);
      let addedCount = 0;
      let skippedCount = 0;

      const questionListBody = document.getElementById('questionListBody');

      qids.forEach(qid => {
        // 检查是否已存在
        if (document.querySelector(`#questionListBody .question-row[data-qid="${qid}"]`)) {
          skippedCount++;
          return;
        }

        // 模拟获取题型（实际应从后端获取）
        const typeInfo = questionTypes[qid] || { type: 'choice', name: '单选题' };
        const count = questionListBody.children.length + 1;

        const row = document.createElement('div');
        row.className = 'question-row';
        row.dataset.qid = qid;
        row.innerHTML = `
          <span class="col-seq">${count}</span>
          <span class="col-id">${qid}</span>
          <span class="col-type"><span class="type-badge ${typeInfo.type}">${typeInfo.name}</span></span>
          <span class="col-score">
            <input type="number" class="score-input-sm" value="5" min="0">
          </span>
          <span class="col-action">
            <button type="button" class="btn-icon-sm btn-move-up" title="上移">↑</button>
            <button type="button" class="btn-icon-sm btn-move-down" title="下移">↓</button>
            <button type="button" class="btn-icon-sm btn-delete-q" title="删除">×</button>
          </span>
        `;

        questionListBody.appendChild(row);
        bindQuestionRowEvents(row);
        addedCount++;
      });

      input.value = '';
      updateQuestionStats();

      if (addedCount > 0 && skippedCount > 0) {
        showToast(`已添加 ${addedCount} 道题目，${skippedCount} 道已存在被跳过`);
      } else if (addedCount > 0) {
        showToast(`已添加 ${addedCount} 道题目`);
      } else {
        showToast('所有题目已存在');
      }
    });
  }

  // 更新题目统计
  function updateQuestionStats() {
    const rows = document.querySelectorAll('#questionListBody .question-row');
    let totalScore = 0;

    rows.forEach((row, index) => {
      row.querySelector('.col-seq').textContent = index + 1;
      const scoreInput = row.querySelector('.score-input-sm');
      totalScore += parseInt(scoreInput.value) || 0;
    });

    document.getElementById('questionCount').textContent = rows.length;
    document.getElementById('questionTotalScore').textContent = totalScore;
    document.getElementById('examTotalScore').value = totalScore;
  }

  // 绑定题目行事件
  function bindQuestionRowEvents(row) {
    // 删除
    row.querySelector('.btn-delete-q').addEventListener('click', () => {
      row.remove();
      updateQuestionStats();
      showToast('已删除题目');
    });

    // 上移
    row.querySelector('.btn-move-up').addEventListener('click', () => {
      const prev = row.previousElementSibling;
      if (prev) {
        row.parentNode.insertBefore(row, prev);
        updateQuestionStats();
      }
    });

    // 下移
    row.querySelector('.btn-move-down').addEventListener('click', () => {
      const next = row.nextElementSibling;
      if (next) {
        row.parentNode.insertBefore(next, row);
        updateQuestionStats();
      }
    });

    // 分值变化
    row.querySelector('.score-input-sm').addEventListener('input', () => {
      updateQuestionStats();
    });
  }

  // 初始化已有题目行的事件
  document.querySelectorAll('#questionListBody .question-row').forEach(row => {
    bindQuestionRowEvents(row);
  });

  // 初始化统计
  updateQuestionStats();

  // ========== 数据直传 - 题目管理 ==========
  // 添加题目（数据直传 - 支持批量，无分值）
  const addDirectQuestionBtn = document.getElementById('addDirectQuestionBtn');
  if (addDirectQuestionBtn) {
    addDirectQuestionBtn.addEventListener('click', () => {
      const input = document.getElementById('directQuestionIdInput');
      const inputValue = input.value.trim();
      if (!inputValue) {
        showToast('请输入题目ID');
        return;
      }

      const qids = inputValue.split(/[,，]/).map(id => id.trim().toUpperCase()).filter(id => id);
      let addedCount = 0;
      let skippedCount = 0;

      const questionListBody = document.getElementById('directQuestionListBody');

      qids.forEach(qid => {
        if (document.querySelector(`#directQuestionListBody .question-row[data-qid="${qid}"]`)) {
          skippedCount++;
          return;
        }

        const typeInfo = questionTypes[qid] || { type: 'choice', name: '单选题' };
        const count = questionListBody.children.length + 1;

        const row = document.createElement('div');
        row.className = 'question-row';
        row.dataset.qid = qid;
        row.innerHTML = `
          <span class="col-seq">${count}</span>
          <span class="col-id-wide">${qid}</span>
          <span class="col-type"><span class="type-badge ${typeInfo.type}">${typeInfo.name}</span></span>
          <span class="col-action">
            <button type="button" class="btn-icon-sm btn-delete-dq" title="删除">×</button>
          </span>
        `;

        questionListBody.appendChild(row);
        bindDirectQuestionRowEvents(row);
        addedCount++;
      });

      input.value = '';
      updateDirectQuestionStats();

      if (addedCount > 0 && skippedCount > 0) {
        showToast(`已添加 ${addedCount} 道题目，${skippedCount} 道已存在被跳过`);
      } else if (addedCount > 0) {
        showToast(`已添加 ${addedCount} 道题目`);
      } else {
        showToast('所有题目已存在');
      }
    });
  }

  // 绑定数据直传题目行事件
  function bindDirectQuestionRowEvents(row) {
    row.querySelector('.btn-delete-dq').addEventListener('click', () => {
      row.remove();
      updateDirectQuestionStats();
      showToast('已删除题目');
    });
  }

  // 更新数据直传题目统计
  function updateDirectQuestionStats() {
    const rows = document.querySelectorAll('#directQuestionListBody .question-row');
    rows.forEach((row, index) => {
      row.querySelector('.col-seq').textContent = index + 1;
    });
    document.getElementById('directQuestionCount').textContent = rows.length;
  }

  // 初始化数据直传题目行事件
  document.querySelectorAll('#directQuestionListBody .question-row').forEach(row => {
    bindDirectQuestionRowEvents(row);
  });
  updateDirectQuestionStats();

  // ========== 答题卡上传类型切换 ==========
  document.querySelectorAll('.switch-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.switch-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const type = item.dataset.type;
      const imageArea = document.getElementById('imageUploadArea');
      const jsonArea = document.getElementById('jsonUploadArea');

      if (type === 'image') {
        imageArea.classList.remove('hidden');
        jsonArea.classList.add('hidden');
      } else {
        imageArea.classList.add('hidden');
        jsonArea.classList.remove('hidden');
      }
    });
  });

  // ========== 文件上传交互 ==========
  // 小分表上传
  const scoreFileInput = document.getElementById('scoreFileInput');
  const scoreUploadedFile = document.getElementById('scoreUploadedFile');
  if (scoreFileInput) {
    scoreFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        scoreUploadedFile.querySelector('.file-name').textContent = file.name;
        scoreUploadedFile.querySelector('.file-size').textContent = formatFileSize(file.size);
        scoreUploadedFile.classList.remove('hidden');
        showToast('小分表上传成功');
      }
    });
  }

  const removeScoreFile = document.getElementById('removeScoreFile');
  if (removeScoreFile) {
    removeScoreFile.addEventListener('click', () => {
      scoreFileInput.value = '';
      scoreUploadedFile.classList.add('hidden');
      showToast('已移除文件');
    });
  }

  // 答题卡图片上传
  const cardImageInput = document.getElementById('cardImageInput');
  const uploadedImages = document.getElementById('uploadedImages');
  if (cardImageInput) {
    cardImageInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        Array.from(e.target.files).forEach(file => {
          const item = document.createElement('div');
          item.className = 'image-item';
          item.innerHTML = `
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='80' fill='%23e0e0e0'%3E%3Crect width='60' height='80'/%3E%3C/svg%3E" alt="答题卡">
            <span class="image-name">${file.name}</span>
            <button type="button" class="btn-remove-img">×</button>
          `;
          item.querySelector('.btn-remove-img').addEventListener('click', () => {
            item.remove();
          });
          uploadedImages.appendChild(item);
        });
        showToast(`已上传 ${e.target.files.length} 张图片`);
      }
    });
  }

  // 初始化已有图片的删除按钮
  document.querySelectorAll('.btn-remove-img').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.image-item').remove();
    });
  });

  // JSON文件上传
  const cardJsonInput = document.getElementById('cardJsonInput');
  const jsonUploadedFile = document.getElementById('jsonUploadedFile');
  if (cardJsonInput) {
    cardJsonInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        jsonUploadedFile.querySelector('.file-name').textContent = file.name;
        jsonUploadedFile.querySelector('.file-size').textContent = formatFileSize(file.size);
        jsonUploadedFile.classList.remove('hidden');
        showToast('JSON文件上传成功');
      }
    });
  }

  const removeJsonFile = document.getElementById('removeJsonFile');
  if (removeJsonFile) {
    removeJsonFile.addEventListener('click', () => {
      cardJsonInput.value = '';
      jsonUploadedFile.classList.add('hidden');
      showToast('已移除文件');
    });
  }

  // 格式化文件大小
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ========== 课程咨询名单弹窗 ==========
  const consultModal = document.getElementById('consultModal');

  // 打开咨询名单弹窗
  document.querySelectorAll('.btn-view-consult').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = btn.dataset.count || '0';
      const row = btn.closest('tr');
      const diagnosisName = row.querySelector('td:first-child strong').textContent;

      // 更新弹窗信息
      document.querySelector('.consult-diagnosis').textContent = diagnosisName;
      document.getElementById('consultTotalCount').textContent = count;

      consultModal.classList.add('show');
    });
  });

  // 关闭咨询名单弹窗
  document.getElementById('closeConsult').addEventListener('click', () => {
    consultModal.classList.remove('show');
  });

  // 点击弹窗背景关闭
  consultModal.addEventListener('click', (e) => {
    if (e.target === consultModal) {
      consultModal.classList.remove('show');
    }
  });

  // 咨询名单搜索
  const consultSearchInput = document.getElementById('consultSearchInput');
  if (consultSearchInput) {
    consultSearchInput.addEventListener('input', () => {
      const keyword = consultSearchInput.value.toLowerCase();
      const rows = document.querySelectorAll('#consultTableBody tr');

      rows.forEach(row => {
        const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const phone = row.querySelector('.phone-cell').textContent.toLowerCase();
        const studentId = row.querySelector('td:nth-child(3)').textContent.toLowerCase();

        if (name.includes(keyword) || phone.includes(keyword) || studentId.includes(keyword)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // 导出名单
  const exportConsultBtn = document.getElementById('exportConsultBtn');
  if (exportConsultBtn) {
    exportConsultBtn.addEventListener('click', () => {
      showToast('正在导出咨询名单...');
      setTimeout(() => {
        showToast('咨询名单已导出');
      }, 1000);
    });
  }

  // ========== 报名名单弹窗 ==========
  const enrollModal = document.getElementById('enrollModal');

  // 打开报名名单弹窗
  document.querySelectorAll('.btn-view-enroll').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = btn.dataset.count || '0';
      const row = btn.closest('tr');
      const diagnosisName = row.querySelector('td:first-child strong').textContent;

      document.getElementById('enrollDiagnosisName').textContent = diagnosisName;
      document.getElementById('enrollTotalCount').textContent = count;

      enrollModal.classList.add('show');
    });
  });

  // 关闭报名名单弹窗
  document.getElementById('closeEnroll').addEventListener('click', () => {
    enrollModal.classList.remove('show');
  });

  enrollModal.addEventListener('click', (e) => {
    if (e.target === enrollModal) {
      enrollModal.classList.remove('show');
    }
  });

  // 报名名单搜索
  const enrollSearchInput = document.getElementById('enrollSearchInput');
  if (enrollSearchInput) {
    enrollSearchInput.addEventListener('input', () => {
      const keyword = enrollSearchInput.value.toLowerCase();
      const rows = document.querySelectorAll('#enrollTableBody tr');

      rows.forEach(row => {
        const name = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const studentId = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
        const org = row.querySelector('td:nth-child(2)').textContent.toLowerCase();

        if (name.includes(keyword) || studentId.includes(keyword) || org.includes(keyword)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // 导出报名名单
  const exportEnrollBtn = document.getElementById('exportEnrollBtn');
  if (exportEnrollBtn) {
    exportEnrollBtn.addEventListener('click', () => {
      showToast('正在导出报名名单...');
      setTimeout(() => {
        showToast('报名名单已导出');
      }, 1000);
    });
  }

  // ========== 诊断报告列表弹窗 ==========
  const reportListModal = document.getElementById('reportListModal');

  // 打开诊断报告列表弹窗
  document.querySelectorAll('.btn-view-report').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = btn.dataset.count || '0';
      const row = btn.closest('tr');
      const diagnosisName = row.querySelector('td:first-child strong').textContent;

      document.getElementById('reportListDiagnosisName').textContent = diagnosisName;
      document.getElementById('reportListTotalCount').textContent = count;

      if (count === '0') {
        showToast('暂无已完成的诊断报告');
        return;
      }

      reportListModal.classList.add('show');
    });
  });

  // 关闭诊断报告列表弹窗
  document.getElementById('closeReportList').addEventListener('click', () => {
    reportListModal.classList.remove('show');
  });

  reportListModal.addEventListener('click', (e) => {
    if (e.target === reportListModal) {
      reportListModal.classList.remove('show');
    }
  });

  // 诊断报告搜索
  const reportListSearchInput = document.getElementById('reportListSearchInput');
  if (reportListSearchInput) {
    reportListSearchInput.addEventListener('input', () => {
      const keyword = reportListSearchInput.value.toLowerCase();
      const rows = document.querySelectorAll('#reportListTableBody tr');

      rows.forEach(row => {
        const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const studentId = row.querySelector('td:nth-child(3)').textContent.toLowerCase();

        if (name.includes(keyword) || studentId.includes(keyword)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // 分数段筛选
  const reportScoreFilter = document.getElementById('reportScoreFilter');
  if (reportScoreFilter) {
    reportScoreFilter.addEventListener('change', () => {
      const filterValue = reportScoreFilter.value;
      const rows = document.querySelectorAll('#reportListTableBody tr');

      rows.forEach(row => {
        const scoreText = row.querySelector('.score-cell').textContent;
        const score = parseInt(scoreText);

        let show = true;
        if (filterValue === '90') show = score >= 90;
        else if (filterValue === '80') show = score >= 80 && score < 90;
        else if (filterValue === '70') show = score >= 70 && score < 80;
        else if (filterValue === '60') show = score >= 60 && score < 70;
        else if (filterValue === '0') show = score < 60;

        row.style.display = show ? '' : 'none';
      });
    });
  }

  // 导出报告列表
  const exportReportListBtn = document.getElementById('exportReportListBtn');
  if (exportReportListBtn) {
    exportReportListBtn.addEventListener('click', () => {
      showToast('正在批量导出报告...');
      setTimeout(() => {
        showToast('报告已导出');
      }, 1000);
    });
  }

  // 查看报告详情
  document.querySelectorAll('.btn-view-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      reportListModal.classList.remove('show');
      // 显示已有的报告弹窗
      reportModal.classList.add('show');
      showToast('正在加载学生诊断报告...');
    });
  });

  // ========== 级联选择器交互 ==========
  // 机构选择
  document.querySelectorAll('#orgList .cascade-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('#orgList .cascade-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      // 实际应用中这里会加载对应机构的班级列表
      showToast(`已选择: ${item.querySelector('.item-name').textContent}`);
    });
  });

  // 班级复选框
  document.querySelectorAll('#classList .cascade-item-check').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.type !== 'checkbox') {
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
      }
      updateSelectedCount();
    });
  });

  // 学生复选框
  document.querySelectorAll('#studentListCascade .cascade-item-check').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.type !== 'checkbox') {
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
      }
      updateSelectedCount();
    });
  });

  // 全选班级
  const selectAllClasses = document.getElementById('selectAllClasses');
  if (selectAllClasses) {
    selectAllClasses.addEventListener('change', () => {
      document.querySelectorAll('#classList input[type="checkbox"]').forEach(cb => {
        cb.checked = selectAllClasses.checked;
      });
      updateSelectedCount();
    });
  }

  // 全选学生
  const selectAllStudents = document.getElementById('selectAllStudents');
  if (selectAllStudents) {
    selectAllStudents.addEventListener('change', () => {
      document.querySelectorAll('#studentListCascade input[type="checkbox"]').forEach(cb => {
        cb.checked = selectAllStudents.checked;
      });
      updateSelectedCount();
    });
  }

  // 学生搜索
  const studentSearch = document.getElementById('studentSearch');
  if (studentSearch) {
    studentSearch.addEventListener('input', () => {
      const keyword = studentSearch.value.toLowerCase();
      document.querySelectorAll('#studentListCascade .student-check').forEach(item => {
        const name = item.querySelector('.stu-name').textContent.toLowerCase();
        const id = item.querySelector('.stu-id').textContent.toLowerCase();
        if (name.includes(keyword) || id.includes(keyword)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // 清空选择
  const clearSelection = document.getElementById('clearSelection');
  if (clearSelection) {
    clearSelection.addEventListener('click', () => {
      document.querySelectorAll('.cascade-selector input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      updateSelectedCount();
      showToast('已清空选择');
    });
  }

  // 更新已选数量
  function updateSelectedCount() {
    const classCount = document.querySelectorAll('#classList input[type="checkbox"]:checked').length;
    const studentCount = document.querySelectorAll('#studentListCascade input[type="checkbox"]:checked').length;
    const countEl = document.getElementById('selectedCount');
    if (countEl) {
      countEl.textContent = `${classCount} 个班级，${studentCount} 名学生`;
    }
  }

  // 初始化计数
  updateSelectedCount();

  // 富文本编辑器简单交互
  document.querySelectorAll('.editor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const editor = document.querySelector('.editor-content');
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      // 简单的格式化演示
      document.execCommand('bold', false, null);
    });
  });

  // ========== 学生平板效果模块 ==========

  // 场景切换按钮
  const sceneButtons = document.querySelectorAll('.scene-btn');
  const tabletPages = document.querySelectorAll('.tablet-page');

  sceneButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const scene = btn.dataset.scene;

      // 更新按钮状态
      sceneButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 切换页面
      tabletPages.forEach(page => page.classList.remove('active'));
      if (scene === 'list') {
        document.getElementById('tabletListPage').classList.add('active');
      } else if (scene === 'exam') {
        document.getElementById('tabletExamPage').classList.add('active');
      } else if (scene === 'report') {
        document.getElementById('tabletReportPage').classList.add('active');
      }
    });
  });

  // 开始诊断按钮
  const btnStartExam = document.getElementById('btnStartExam');
  const startExamModal = document.getElementById('startExamModal');
  const cancelStartExam = document.getElementById('cancelStartExam');
  const confirmStartExam = document.getElementById('confirmStartExam');

  if (btnStartExam) {
    btnStartExam.addEventListener('click', () => {
      startExamModal.classList.add('show');
    });
  }

  if (cancelStartExam) {
    cancelStartExam.addEventListener('click', () => {
      startExamModal.classList.remove('show');
    });
  }

  if (confirmStartExam) {
    confirmStartExam.addEventListener('click', () => {
      startExamModal.classList.remove('show');
      // 切换到答题界面
      tabletPages.forEach(page => page.classList.remove('active'));
      document.getElementById('tabletExamPage').classList.add('active');
      sceneButtons.forEach(b => b.classList.remove('active'));
      document.querySelector('.scene-btn[data-scene="exam"]').classList.add('active');
      showToast('已开始诊断，计时开始');
      startExamCountdown();
    });
  }

  // 查看报告按钮
  const btnViewReport = document.getElementById('btnViewReport');
  if (btnViewReport) {
    btnViewReport.addEventListener('click', () => {
      tabletPages.forEach(page => page.classList.remove('active'));
      document.getElementById('tabletReportPage').classList.add('active');
      sceneButtons.forEach(b => b.classList.remove('active'));
      document.querySelector('.scene-btn[data-scene="report"]').classList.add('active');
    });
  }

  // 答题界面返回按钮
  const examBackBtn = document.getElementById('examBackBtn');
  const leaveExamModal = document.getElementById('leaveExamModal');
  const cancelLeave = document.getElementById('cancelLeave');
  const confirmLeave = document.getElementById('confirmLeave');

  if (examBackBtn) {
    examBackBtn.addEventListener('click', () => {
      // 更新剩余时间显示
      const leaveRemainTime = document.getElementById('leaveRemainTime');
      if (leaveRemainTime) {
        leaveRemainTime.textContent = document.getElementById('examCountdown').textContent;
      }
      leaveExamModal.classList.add('show');
    });
  }

  if (cancelLeave) {
    cancelLeave.addEventListener('click', () => {
      leaveExamModal.classList.remove('show');
    });
  }

  if (confirmLeave) {
    confirmLeave.addEventListener('click', () => {
      leaveExamModal.classList.remove('show');
      // 返回列表
      tabletPages.forEach(page => page.classList.remove('active'));
      document.getElementById('tabletListPage').classList.add('active');
      sceneButtons.forEach(b => b.classList.remove('active'));
      document.querySelector('.scene-btn[data-scene="list"]').classList.add('active');
      showToast('已暂时离开，计时继续中');
    });
  }

  // 报告页面返回按钮
  const reportBackBtn = document.getElementById('reportBackBtn');
  if (reportBackBtn) {
    reportBackBtn.addEventListener('click', () => {
      tabletPages.forEach(page => page.classList.remove('active'));
      document.getElementById('tabletListPage').classList.add('active');
      sceneButtons.forEach(b => b.classList.remove('active'));
      document.querySelector('.scene-btn[data-scene="list"]').classList.add('active');
    });
  }

  // 提交答卷
  const submitExamBtn = document.getElementById('submitExamBtn');
  const submitExamModal = document.getElementById('submitExamModal');
  const cancelSubmit = document.getElementById('cancelSubmit');
  const confirmSubmit = document.getElementById('confirmSubmit');

  if (submitExamBtn) {
    submitExamBtn.addEventListener('click', () => {
      submitExamModal.classList.add('show');
    });
  }

  if (cancelSubmit) {
    cancelSubmit.addEventListener('click', () => {
      submitExamModal.classList.remove('show');
    });
  }

  if (confirmSubmit) {
    confirmSubmit.addEventListener('click', () => {
      submitExamModal.classList.remove('show');
      stopExamCountdown();
      // 返回列表
      tabletPages.forEach(page => page.classList.remove('active'));
      document.getElementById('tabletListPage').classList.add('active');
      sceneButtons.forEach(b => b.classList.remove('active'));
      document.querySelector('.scene-btn[data-scene="list"]').classList.add('active');
      showToast('答卷已提交，等待老师诊断');
    });
  }

  // 自动交卷弹窗
  const autoSubmitModal = document.getElementById('autoSubmitModal');
  const confirmAutoSubmit = document.getElementById('confirmAutoSubmit');

  if (confirmAutoSubmit) {
    confirmAutoSubmit.addEventListener('click', () => {
      autoSubmitModal.classList.remove('show');
      // 返回列表
      tabletPages.forEach(page => page.classList.remove('active'));
      document.getElementById('tabletListPage').classList.add('active');
      sceneButtons.forEach(b => b.classList.remove('active'));
      document.querySelector('.scene-btn[data-scene="list"]').classList.add('active');
    });
  }

  // 倒计时功能
  let examCountdownInterval = null;
  let examTimeRemaining = 30 * 60; // 30分钟，单位秒

  function startExamCountdown() {
    examTimeRemaining = 30 * 60;
    updateCountdownDisplay();

    examCountdownInterval = setInterval(() => {
      examTimeRemaining--;
      updateCountdownDisplay();

      if (examTimeRemaining <= 0) {
        stopExamCountdown();
        // 显示自动交卷弹窗
        autoSubmitModal.classList.add('show');
      }
    }, 1000);
  }

  function stopExamCountdown() {
    if (examCountdownInterval) {
      clearInterval(examCountdownInterval);
      examCountdownInterval = null;
    }
  }

  function updateCountdownDisplay() {
    const minutes = Math.floor(examTimeRemaining / 60);
    const seconds = examTimeRemaining % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const countdownEl = document.getElementById('examCountdown');
    if (countdownEl) {
      countdownEl.textContent = display;
    }
  }

  // 课程咨询按钮
  const consultFloatBtns = document.querySelectorAll('.consult-float-btn');
  const consultModal2 = document.getElementById('consultModal2');
  const closeConsultModal = document.getElementById('closeConsultModal');

  consultFloatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      consultModal2.classList.add('show');
    });
  });

  if (closeConsultModal) {
    closeConsultModal.addEventListener('click', () => {
      consultModal2.classList.remove('show');
    });
  }

  // 咨询表单提交
  const submitConsult2 = document.getElementById('submitConsult2');
  if (submitConsult2) {
    submitConsult2.addEventListener('click', () => {
      const phone = document.getElementById('consultPhone2').value;
      const time = document.getElementById('consultTime2').value;
      const phoneError = document.getElementById('phoneError2');

      // 重置错误提示
      phoneError.textContent = '';

      // 校验
      if (!time) {
        showToast('请选择预约时段');
        return;
      }

      if (!phone) {
        phoneError.textContent = '请输入手机号';
        return;
      }

      // 手机号格式校验
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        phoneError.textContent = '请输入正确的手机号格式';
        return;
      }

      // 提交成功
      consultModal2.classList.remove('show');
      showToast('咨询预约已提交，老师会尽快联系您');

      // 清空表单
      document.getElementById('consultPhone2').value = '';
      document.getElementById('consultTime2').value = '';
    });
  }

  // 点击弹窗外部关闭
  [startExamModal, submitExamModal, leaveExamModal, autoSubmitModal, consultModal2].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    }
  });

  // ========== 答卷详情 - 题号切换功能 ==========
  const questionNavTabs = document.getElementById('questionNavTabs');
  const questionDetailContainer = document.getElementById('questionDetailContainer');

  if (questionNavTabs && questionDetailContainer) {
    const qTabs = questionNavTabs.querySelectorAll('.q-tab');
    const qPanels = questionDetailContainer.querySelectorAll('.question-detail-panel');

    qTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const qNum = tab.dataset.q;

        // 更新tab状态
        qTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 切换面板
        qPanels.forEach(panel => {
          if (panel.dataset.q === qNum) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  }

  // ========== 答卷详情 - 展开/收起题干与解析 ==========
  const expandToggles = document.querySelectorAll('.expand-toggle');

  expandToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.dataset.expanded === 'true';
      toggle.dataset.expanded = (!isExpanded).toString();
    });
  });

});
