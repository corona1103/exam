// 阅卷系统演示 - 交互逻辑

document.addEventListener('DOMContentLoaded', () => {
  // 页面元素
  const pageList = document.getElementById('pageList');
  const pageGrading = document.getElementById('pageGrading');

  // 考试数据
  const examsData = {
    1: { name: '2024年期中考试 - 数学', class: '高三(1)班', total: 30, done: 12 },
    2: { name: '2024年期中考试 - 语文', class: '高三(1)班', total: 30, done: 30 },
    3: { name: '2024年期中考试 - 英语', class: '高三(2)班', total: 32, done: 0 },
    4: { name: '2024年月考 - 物理', class: '高三(1)班', total: 30, done: 30 },
    5: { name: '2024年月考 - 数学', class: '高三(2)班', total: 32, done: 24 }
  };

  let currentExam = null;
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

      // 获取批改模式
      gradingMode = btn.dataset.mode || 'byQuestion';

      // 更新顶部考试名称
      document.getElementById('currentExamName').textContent = currentExam.name;

      // 更新UI
      updateGradingModeUI();

      showPage('grading');
      const modeText = gradingMode === 'byStudent' ? '按学生批改' : '按题批改';
      showToast(`进入${modeText}: ${currentExam.name}`);
    });
  });

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
    if (currentTool === 'select') return;

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
    const allAnnotations = annotations.querySelectorAll('.annotation');
    if (allAnnotations.length > 0) {
      allAnnotations[allAnnotations.length - 1].remove();
      showToast('已撤销');
      addHistory('撤销批注');
    }
  }

  // 清除所有批注
  function clearAllAnnotations() {
    if (annotations.children.length === 0) return;
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

      // 获取该学生的批改进度（模拟数据）
      const progressText = item.querySelector('.student-progress-text').textContent;
      const match = progressText.match(/已批 (\d+)\/(\d+)/);
      const gradedCount = match ? parseInt(match[1]) : 0;

      // 如果已经批完所有题目，直接显示报告
      if (gradedCount >= totalQuestions) {
        showToast(`学生 ${name} 已批改完成，请审核报告`);
        showStudentReport();
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
    addHistory('保存草稿');
  });

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
          showStudentReport();
          scoreInput.value = '';
        }, 500);
      }
    }
  });

  // ========== 学生整体报告 ==========
  function showStudentReport() {
    // 获取当前学生名称
    const activeStudent = document.querySelector('.student-item.active');
    const studentName = activeStudent ? activeStudent.querySelector('.student-name').textContent : '李明';

    // 更新报告中的学生名称
    document.getElementById('reportStudentName').textContent = studentName;
    document.querySelector('.profile-avatar').textContent = studentName.charAt(0);

    // 计算总分
    const totalScore = studentScores.reduce((a, b) => a + b, 0);
    const fullScore = questionScores.reduce((a, b) => a + b, 0);
    document.getElementById('reportTotalScore').textContent = totalScore;
    document.querySelector('.score-full').textContent = `/ ${fullScore} 分`;

    // 更新各题得分条
    const scoreOverview = document.getElementById('scoreOverview');
    scoreOverview.innerHTML = questionScores.map((full, i) => {
      const got = studentScores[i];
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

    // 显示报告弹窗
    reportModal.classList.add('show');
  }

  // 关闭报告
  document.getElementById('closeReport').addEventListener('click', () => {
    reportModal.classList.remove('show');
  });

  // 保存报告草稿
  document.getElementById('saveReportDraft').addEventListener('click', () => {
    showToast('报告草稿已保存');
  });

  // 提交报告并批改下一位
  document.getElementById('submitReport').addEventListener('click', () => {
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
      currentActiveStudent.querySelector('.status').className = 'status done';
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

        // 检查下一个学生是否已批完（需要直接显示报告）
        const progressText = nextStudent.querySelector('.student-progress-text').textContent;
        const match = progressText.match(/已批 (\d+)\/(\d+)/);
        const gradedCount = match ? parseInt(match[1]) : 0;

        if (gradedCount >= totalQuestions) {
          showToast(`学生 ${nextName} 已批改完成，请审核报告`);
          // 清空报告内容准备新的
          document.getElementById('overallComment').value = '';
          document.getElementById('teacherMessage').value = '';
          showStudentReport();
        } else {
          showToast(`已切换到学生: ${nextName}`);
          // 重置题目和得分
          currentQuestion = gradedCount + 1;
          updateQuestionInfo();
          updateSubmitButtonText();
          scoreInput.value = '';
          studentScores = [0, 0, 0, 0, 0]; // 重置得分记录
          annotations.innerHTML = '';

          // 清空报告内容
          document.getElementById('overallComment').value = '';
          document.getElementById('teacherMessage').value = '';
        }
      } else {
        showToast('所有学生批改完成！');
      }
    }, 500);
  });

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
});
