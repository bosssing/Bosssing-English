// 单词悬浮提示器 - 渲染进程逻辑
(function () {
  'use strict';

  let words = [];
  let currentIndex = 0;
  let isPlaying = false;
  let playInterval = null;
  let speed = 5; // 秒

  const els = {
    wordText: document.getElementById('word-text'),
    phoneticText: document.getElementById('phonetic-text'),
    definitionText: document.getElementById('definition-text'),
    wordIndex: document.getElementById('word-index'),
    speedSlider: document.getElementById('speed-slider'),
    speedValue: document.getElementById('speed-value'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    btnPlay: document.getElementById('btn-play'),
    iconPlay: document.getElementById('icon-play'),
    iconPause: document.getElementById('icon-pause'),
    btnOpen: document.getElementById('btn-open'),
    btnPin: document.getElementById('btn-pin'),
    btnHide: document.getElementById('btn-hide'),
    wordDisplay: document.getElementById('word-display'),
    progressBarTrack: document.getElementById('progress-bar-track'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    progressBarThumb: document.getElementById('progress-bar-thumb'),
    progressBarLabel: document.getElementById('progress-bar-label')
  };

  // 进度条拖拽状态
  let isDragging = false;

  // 保存当前状态到持久化存储
  async function persistState() {
    await window.wordFloater.saveState({
      currentIndex,
      speed,
      isPlaying
    });
  }

  // 显示当前单词
  function showWord(index) {
    if (words.length === 0) {
      els.wordText.textContent = 'No words loaded';
      els.phoneticText.textContent = '';
      els.definitionText.textContent = '';
      els.wordIndex.textContent = '0 / 0';
      return;
    }

    currentIndex = ((index % words.length) + words.length) % words.length;
    const word = words[currentIndex];

    // 切换动画
    els.wordText.classList.remove('fade');
    void els.wordText.offsetWidth; // 触发重排
    els.wordText.classList.add('fade');

    els.wordText.textContent = word.word || '';
    els.phoneticText.textContent = word.phonetic || '';
    els.definitionText.textContent = word.definition || '';
    els.wordIndex.textContent = `${currentIndex + 1} / ${words.length}`;
    updateProgressBar();
    persistState();
  }

  // 更新进度条状态
  function updateProgressBar() {
    if (words.length === 0) {
      els.progressBarFill.style.width = '0%';
      els.progressBarThumb.style.left = '0%';
      els.progressBarLabel.textContent = '0 / 0';
      return;
    }
    const percent = (currentIndex / (words.length - 1)) * 100;
    els.progressBarFill.style.width = percent + '%';
    els.progressBarThumb.style.left = percent + '%';
    els.progressBarLabel.textContent = `${currentIndex + 1} / ${words.length}`;
  }

  // 根据进度条位置计算单词序号
  function indexFromProgressPosition(clientX) {
    const rect = els.progressBarTrack.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    return Math.round(ratio * (words.length - 1));
  }

  // 进度条拖拽交互
  function onProgressDragStart(e) {
    if (words.length === 0) return;
    e.preventDefault();
    isDragging = true;
    els.progressBarTrack.classList.add('dragging');
    const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const idx = indexFromProgressPosition(clientX);
    showWord(idx);
  }

  function onProgressDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const idx = indexFromProgressPosition(clientX);
    showWord(idx);
  }

  function onProgressDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    els.progressBarTrack.classList.remove('dragging');
    if (isPlaying) startInterval();
  }

  // 进度条点击定位
  els.progressBarTrack.addEventListener('mousedown', onProgressDragStart);
  document.addEventListener('mousemove', onProgressDragMove);
  document.addEventListener('mouseup', onProgressDragEnd);
  // 触摸支持
  els.progressBarTrack.addEventListener('touchstart', onProgressDragStart, { passive: false });
  document.addEventListener('touchmove', onProgressDragMove, { passive: false });
  document.addEventListener('touchend', onProgressDragEnd);

  // 播放/暂停
  function togglePlay() {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }

  function play() {
    if (words.length === 0) return;
    isPlaying = true;
    els.iconPlay.style.display = 'none';
    els.iconPause.style.display = 'block';
    startInterval();
  }

  function pause() {
    isPlaying = false;
    els.iconPlay.style.display = 'block';
    els.iconPause.style.display = 'none';
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }

  function startInterval() {
    if (playInterval) clearInterval(playInterval);
    playInterval = setInterval(() => {
      showWord(currentIndex + 1);
    }, speed * 1000);
  }

  // 上一个/下一个
  function prevWord() {
    showWord(currentIndex - 1);
    if (isPlaying) startInterval(); // 重置计时器
  }

  function nextWord() {
    showWord(currentIndex + 1);
    if (isPlaying) startInterval();
  }

  // 速度控制
  function setSpeed(val) {
    speed = parseInt(val, 10);
    els.speedValue.textContent = speed + 's';
    if (isPlaying) startInterval();
  }

  // 加载单词数据
  async function loadWords(filePath) {
    const result = await window.wordFloater.loadExcel(filePath);
    if (result.error) {
      els.wordText.textContent = 'Error: ' + result.error;
      return;
    }
    if (result.words && result.words.length > 0) {
      words = result.words;
      // 恢复上次的状态
      const savedState = await window.wordFloater.loadState();
      const startIdx = (savedState.currentIndex >= 0 && savedState.currentIndex < words.length)
        ? savedState.currentIndex : 0;
      if (savedState.speed) {
        speed = savedState.speed;
        els.speedSlider.value = speed;
        els.speedValue.textContent = speed + 's';
      }
      showWord(startIdx);
      if (savedState.isPlaying) play();
    }
  }

  // 打开文件对话框
  async function openExcelDialog() {
    const result = await window.wordFloater.openExcelDialog();
    if (result.error) {
      els.wordText.textContent = 'Error: ' + result.error;
      return;
    }
    if (result.words && result.words.length > 0) {
      words = result.words;
      showWord(0);
      if (!isPlaying) play();
    }
  }

  // 事件绑定
  els.btnPrev.addEventListener('click', prevWord);
  els.btnNext.addEventListener('click', nextWord);
  els.btnPlay.addEventListener('click', togglePlay);
  els.btnOpen.addEventListener('click', openExcelDialog);
  els.btnHide.addEventListener('click', () => window.wordFloater.toggleAlwaysOnTop());

  els.speedSlider.addEventListener('input', (e) => setSpeed(e.target.value));

  // 置顶切换
  els.btnPin.addEventListener('click', async () => {
    const isPinned = await window.wordFloater.toggleAlwaysOnTop();
    els.btnPin.style.color = isPinned ? 'rgba(130, 180, 255, 0.9)' : '';
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevWord();
    else if (e.key === 'ArrowRight') nextWord();
    else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
  });

  // 监听主进程发来的单词数据
  window.wordFloater.onWordsLoaded((newWords) => {
    if (newWords && newWords.length > 0) {
      words = newWords;
      currentIndex = 0;
      showWord(0);
      if (!isPlaying) play();
    }
  });

  // 初始化 - 尝试加载默认Excel文件
  loadWords(null);
})();
