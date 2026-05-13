// ==========================================
// 🚀 终极版：AI 质检工作台 (修复套娃括号 + 纯汉字降维匹配)
// ==========================================

// ==========================================
// 1. 初始化本地存储与默认 Prompt (修正了双重括号笔误)
// ==========================================
const DEFAULT_PROMPT = `# Role
电商 AI 效果质检专家。你的任务是根据品牌历史真实的质检经验，结合顾客上下文，评估“智能客服”回复的准确性与合理性。

# Labeling Rules (质检评估维度)
你必须严格从以下固定选项中选择：
1. [标注场景] (16选1)：[售后服务], [商品属性问询], [商品对比], [商品推荐], [议价], [服务与知识], [用户闲聊], [用户特殊需求], [开始沟通], [过渡性话语], [询问商品活动], [询问商品价格], [【慕思】床垫定制需求], [库存], [其他], [主动营销]
2. [是否正确] (2选1)：[正确], [错误]
3. [问题原因] (16选1，若“正确”则填“无”)：[意图识别错误], [推荐类目识别错误], [知识选择错误], [推荐话术输出错误], [无知识自己编], [商品选择错误], [策略实现不好], [上下文理解错误], [意图排序错误], [推荐条件识别错误], [知识错误], [知识改写错误], [商品信息缺失], [商品知识错误], [未解决用户问题], [其他]

# 🟥 核心质检算法（请按步骤严格推理）
【第一步：确定“标注场景”（综合判断，只看顾客意图及当前草稿动作！）】
- 🚀 状态界定（主动营销 vs 正常业务，最高优先级打断！）：
  1. 绝对时间线判断：请严格查看【当前需质检的AI生成草稿】的上一行！只要最后一条背景信息是“系统底层规则触发”且带有“跟单策略”字眼，说明顾客已停止回复对话中断，当前是系统在强制调度 AI 主动出击。此时无视前文任何话题（包括定制），【标注场景】无条件且拥有最高一票否决权地锁定为👉[主动营销]。
  2. 状态解除：只有在系统触发了跟单策略之后，顾客又发送了新的消息，主动营销状态才会被打断解除，重新回归正常业务场景判断。
- 🥇 明确喊人工：只要顾客原话中有“人工/转人工”，锁定为👉[用户特殊需求]。
- 💎 “定制星球”的次级统御权：一旦上下文中出现了“定制/定做”，就相当于进入了“定制星球”！后续连贯的上下文对话（包括讨论尺寸改动、厚度、退换规则，甚至因为无法定制而退而求其次问“有没有现成Xcm的款”），统统属于定制场景的延续！在该连贯话题彻底结束前（除非被上述的‘跟单策略’强制打断），场景无条件锁定为👉[【慕思】床垫定制需求]！
- 🗣️ 开场与隐性问询界限（看当前AI在干嘛）：
  1. 开场客套：当顾客仅发链接、图片或“你好”，尚未提问时，如果当前质检的AI回复仅仅是“稍等我帮您看下”等客套话，强制统一归属为👉[开始沟通]。
  2. 【甩链接的实质介绍】：如果顾客开场发了链接，当AI真正开始介绍该商品的款式、材质等实质内容时，这是隐性咨询的解答，强制归属为👉[商品属性问询]！绝不可误判为主动营销！
- 🥈 【服务与知识】与【售后服务】的绝对界限：
  1. 通用政策与纯知识：物流/服务政策（包安装、几天到等）、包装、发票👉[服务与知识]。
  2. 针对具体订单的实质干预：催发货、修改地址、退差价、退款👉[售后服务]。
- 🥉 属性与推荐的绝对界限（极其重要）：
  1. 问具体特征与标配：问“长宽高/材质”，或使用“带/含”确认商品出厂标配（如“这款床带床垫吗”）👉[商品属性问询]。
  2. 用条件让客服找商品：凡是使用“有没有...（长1900、偏硬）的款/床垫”让客服帮忙挑选👉强制归属[商品推荐]。
  3. 【推荐状态流转】：当客服已经发了链接完成推荐，顾客随后针对该推荐商品提出细节疑问（如“0胶水的吗”），场景强制流转为👉[商品属性问询]。
- 🏅 活动优惠与议价界限（字眼极度敏感！）：
  1. 问活动与常规赠品：或使用“送”字确认店铺当前的常规福利（如“买床送床垫吗”）👉[询问商品活动]。
  2. 试图索要额外福利：试图更换赠品，或使用“能不能送/多送点”主动试探并索要额外赠品👉[议价]。

【第二步：确定“是否正确”】
👉 路径 1：响应跟单策略的主动营销
- ✅ 【正确】：此时必须无条件判为正确！绝对禁止以“突兀”、“未解决用户问题”判错！
👉 路径 2：商品推荐（盲猜禁止令！）
- ✅ 【纯链接免死金牌】：如果 AI 只回复了“详细链接如下：[链接]”，大模型无法访问外网，绝对禁止主观盲猜“链接里的商品发错了”！必须默认该新链接是对的，无条件判为正确！
- ✅ 【近似推荐豁免】：如果 AI 找不到完全一致的商品，主动推荐了近似的替代品描述，应判为正确。
👉 路径 3：业务解答
- ✅ 【灵活答复与举一反三豁免】：顾客问国补，AI 综合介绍消费券并说明可叠加，属于优秀导购话术，绝对禁止判错！
👉 路径 4：开场与过渡礼仪
- ✅ 【客套话豁免】：进店发链接后的“稍等帮您看下”是正确 SOP，禁止判错！

# Output Format (强制拆解思维链)
强制返回纯 JSON 对象：
{
  "防幻觉分析_1_顾客真实诉求": "【最高优先级校验】：目标草稿的前一行到底有没有‘跟单策略’？如果有，必须强制判定为主动营销！如果没有，前文是否处于‘定制星球’的连贯对话中？",
  "防幻觉分析_2_AI表现校验": "如果有跟单策略，AI的表现是否符合主动营销豁免？如果处于连贯对话，AI是在发纯链接还是在介绍商品属性/定制政策？",
  "标注场景": "若前一行有跟单策略，无条件填 主动营销。否则根据上下文填入（定制星球内填 【慕思】床垫定制需求）。",
  "是否正确": "正确 或 错误",
  "问题原因": "若正确填无，若错误从16个原因中复制1个",
  "评价": "精炼专业理由，限30字"
}`;

function createPromptArchive(name, content) {
  return {
    id: `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    content
  };
}

function readPromptArchives() {
  try {
    const parsed = JSON.parse(localStorage.getItem('qc_prompt_archives') || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter(item => item && item.id && typeof item.content === 'string');
    }
  } catch (err) {}
  return [];
}

function savePromptArchives(archives) {
  localStorage.setItem('qc_prompt_archives', JSON.stringify(archives));
}

function migratePromptArchives() {
  if (localStorage.getItem('qc_prompt_archives')) return;

  const legacyArchives = [
    {
      id: 'legacy_1',
      name: '存档 1',
      content: localStorage.getItem('qc_prompt_1') || DEFAULT_PROMPT
    },
    {
      id: 'legacy_2',
      name: '存档 2',
      content: localStorage.getItem('qc_prompt_2') || '这是存档 2，你可以粘贴新的 Prompt'
    },
    {
      id: 'legacy_3',
      name: '存档 3',
      content: localStorage.getItem('qc_prompt_3') || '这是存档 3，你可以粘贴新的 Prompt'
    }
  ];

  savePromptArchives(legacyArchives);
  localStorage.setItem('qc_active_prompt_id', `legacy_${localStorage.getItem('qc_active_slot') || '1'}`);
}

function ensurePromptArchiveState() {
  migratePromptArchives();
  let archives = readPromptArchives();
  if (archives.length === 0) {
    archives = [createPromptArchive('默认质检 Prompt', DEFAULT_PROMPT)];
    savePromptArchives(archives);
  }

  const activeId = localStorage.getItem('qc_active_prompt_id');
  if (!activeId || !archives.some(item => item.id === activeId)) {
    localStorage.setItem('qc_active_prompt_id', archives[0].id);
  }
}

function getActivePromptArchive() {
  ensurePromptArchiveState();
  const archives = readPromptArchives();
  const activeId = localStorage.getItem('qc_active_prompt_id');
  return archives.find(item => item.id === activeId) || archives[0];
}

function getActivePromptLabel() {
  const archive = getActivePromptArchive();
  return archive ? archive.name : '未命名存档';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

const SELECTORS = {
  panel: "#ai-qc-panel",
  modal: ".ai-qc-modal",
  modalHandle: ".modal-drag-handle",
  activeCustomer: ".bg-blue-50",
  customerRow: ".justify-start",
  botRow: ".justify-end",
  messageRows: ".justify-start, .justify-end",
  senderName: "span.font-medium",
  messageText: ".whitespace-pre-wrap",
  messageImage: "img.rc-image-img",
  messageCardBody: ".rounded-lg .p-4.text-sm.relative",
  messageTime: "span[title]",
  thumbsUpIcon: "svg.lucide-thumbs-up",
  thumbsDownIcon: "svg.lucide-thumbs-down",
  qcDialog: 'div[role="dialog"]',
  remarkTextarea: 'textarea[name="thumbsDescription"]',
  closeIcon: "button .lucide-x"
};

ensurePromptArchiveState();

// ==========================================
// 2. 构建主面板与浮窗 UI
// ==========================================
const oldPanel = document.querySelector(SELECTORS.panel);
if (oldPanel) oldPanel.remove();
const oldModals = document.querySelectorAll(SELECTORS.modal);
oldModals.forEach(m => m.remove());

const panel = document.createElement("div");
panel.id = "ai-qc-panel";
panel.style.cssText = `
  position: fixed; top: 20px; left: 20px; z-index: 2147483640;
  background: #1e293b; color: white; border-radius: 8px;
  padding: 10px; font-family: sans-serif; width: 160px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.5); border: 1px solid #334155;
  user-select: none; transition: opacity 0.3s;
`;
panel.innerHTML = `
  <div id="ai-drag-header" style="font-weight: bold; margin-bottom: 8px; font-size: 13px; border-bottom: 1px solid #475569; padding-bottom: 5px; cursor: move; display: flex; justify-content: space-between; align-items: center;">
    <span>🤖 质检挂件</span><span style="cursor: move;">✋</span>
  </div>
  <div id="ai-status" style="font-size: 11px; color: #10b981; margin-bottom: 8px; font-weight: bold; min-height: 14px; line-height: 1.2;">就绪: ${escapeHtml(getActivePromptLabel())}</div>
  
  <button id="ai-config-btn" style="width: 100%; padding: 6px 0; background: #475569; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; margin-bottom: 5px;">⚙️ 配置 Prompt</button>
  <button id="ai-debug-btn" style="width: 100%; padding: 6px 0; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; margin-bottom: 5px;">🧪 单步调试(含报告)</button>
  <div style="display: flex; gap: 5px; margin-bottom: 5px;">
    <button id="ai-start-btn" style="flex: 1; min-width: 0; padding: 6px 0; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">▶️ 全自动打标</button>
    <button id="ai-concurrency-btn" style="width: 34px; padding: 6px 0; background: #0f172a; color: #bfdbfe; border: 1px solid #3b82f6; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;" title="AI 并发线程数">x2</button>
  </div>
  <button id="ai-stop-btn" style="width: 100%; padding: 6px 0; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;" disabled>⏹️ 紧急停止</button>
`;
document.documentElement.appendChild(panel);

const modalOverlay = document.createElement("div");
modalOverlay.className = "ai-qc-modal";
modalOverlay.style.cssText = `
  display: none; position: fixed; top: 15px; left: 15px; z-index: 2147483647;
  width: 30vw; min-width: 320px; max-width: 450px; max-height: 95vh;
  background: #1e293b; color: #f8fafc; border-radius: 12px;
  flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
  border: 1px solid #475569; font-family: sans-serif; overflow: hidden;
`;
document.documentElement.appendChild(modalOverlay);

// ==========================================
// 3. UI 交互与工具函数
// ==========================================
const dragHeader = panel.querySelector("#ai-drag-header");
const statusEl = panel.querySelector("#ai-status");
const configBtn = panel.querySelector("#ai-config-btn");
const concurrencyBtn = panel.querySelector("#ai-concurrency-btn");
const debugBtn = panel.querySelector("#ai-debug-btn");
const startBtn = panel.querySelector("#ai-start-btn");
const stopBtn = panel.querySelector("#ai-stop-btn");

const LONG_PRESS_DRAG_DELAY = 300;
const DRAG_VISIBLE_EDGE = 48;
let longPressDragTimer = null;

function clampDragPosition(left, top, element) {
  const rect = element.getBoundingClientRect();
  const maxLeft = window.innerWidth - DRAG_VISIBLE_EDGE;
  const maxTop = window.innerHeight - DRAG_VISIBLE_EDGE;
  const minLeft = DRAG_VISIBLE_EDGE - rect.width;
  const minTop = DRAG_VISIBLE_EDGE - rect.height;
  return {
    left: Math.min(Math.max(left, minLeft), maxLeft),
    top: Math.min(Math.max(top, minTop), maxTop)
  };
}

function isBlockedDragTarget(target) {
  if (!target || !target.closest) return true;
  return !!target.closest('button, input, textarea, select, a, pre, [contenteditable="true"], [role="button"]');
}

function clearLongPressDrag() {
  if (longPressDragTimer) {
    clearTimeout(longPressDragTimer.id);
    longPressDragTimer = null;
  }
  document.removeEventListener("mouseup", clearLongPressDrag);
}

function setupLongPressDrag(container, ignoredSelector, beginDrag) {
  container.addEventListener("mousedown", (e) => {
    if (!e.target.closest) return;
    if (e.button !== 0 || e.target.closest(ignoredSelector) || isBlockedDragTarget(e.target)) return;
    clearLongPressDrag();
    const startEvent = e;
    const timerId = setTimeout(() => {
      longPressDragTimer = null;
      beginDrag(startEvent);
    }, LONG_PRESS_DRAG_DELAY);
    longPressDragTimer = {
      id: timerId,
      startX: e.clientX,
      startY: e.clientY
    };
    document.addEventListener("mouseup", clearLongPressDrag);
  });
}

let isDragging = false, startX, startY, initialLeft, initialTop;
function beginPanelDrag(e) {
  clearLongPressDrag();
  isDragging = true; startX = e.clientX; startY = e.clientY;
  const rect = panel.getBoundingClientRect();
  initialLeft = rect.left; initialTop = rect.top;
  panel.style.right = "auto"; panel.style.bottom = "auto";
  panel.style.cursor = "grabbing";
  dragHeader.style.cursor = "grabbing";
}
dragHeader.addEventListener("mousedown", beginPanelDrag);
setupLongPressDrag(panel, "#ai-drag-header", beginPanelDrag);

let modalDragging = false, mStartX, mStartY, mInitialLeft, mInitialTop;
function beginModalDrag(e) {
  clearLongPressDrag();
  modalDragging = true;
  mStartX = e.clientX; mStartY = e.clientY;
  const rect = modalOverlay.getBoundingClientRect();
  mInitialLeft = rect.left; mInitialTop = rect.top;
  modalOverlay.style.cursor = "grabbing";
  const header = modalOverlay.querySelector(SELECTORS.modalHandle);
  if (header) header.style.cursor = "grabbing";
}
setupLongPressDrag(modalOverlay, SELECTORS.modalHandle, beginModalDrag);

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const nextPosition = clampDragPosition(initialLeft + (e.clientX - startX), initialTop + (e.clientY - startY), panel);
    panel.style.left = nextPosition.left + "px";
    panel.style.top = nextPosition.top + "px";
  }
  if (modalDragging) {
    const nextPosition = clampDragPosition(mInitialLeft + (e.clientX - mStartX), mInitialTop + (e.clientY - mStartY), modalOverlay);
    modalOverlay.style.left = nextPosition.left + "px";
    modalOverlay.style.top = nextPosition.top + "px";
  }
});
document.addEventListener("mouseup", () => { 
  clearLongPressDrag();
  if (isDragging) { isDragging = false; panel.style.cursor = ""; dragHeader.style.cursor = "move"; } 
  if (modalDragging) {
    modalDragging = false; 
    modalOverlay.style.cursor = "";
    const mHeader = modalOverlay.querySelector(SELECTORS.modalHandle);
    if (mHeader) mHeader.style.cursor = "move";
  }
});

let isRunning = false;
const AI_CONCURRENCY_OPTIONS = [1, 2, 3, 5];
let aiConcurrency = Number(localStorage.getItem("qc_ai_concurrency") || 2);
if (!AI_CONCURRENCY_OPTIONS.includes(aiConcurrency)) aiConcurrency = 2;
function refreshConcurrencyButton() {
  concurrencyBtn.innerText = `x${aiConcurrency}`;
  concurrencyBtn.title = `AI 并发线程数: ${aiConcurrency}`;
}
refreshConcurrencyButton();
concurrencyBtn.addEventListener("click", () => {
  const currentIndex = AI_CONCURRENCY_OPTIONS.indexOf(aiConcurrency);
  aiConcurrency = AI_CONCURRENCY_OPTIONS[(currentIndex + 1) % AI_CONCURRENCY_OPTIONS.length];
  localStorage.setItem("qc_ai_concurrency", String(aiConcurrency));
  refreshConcurrencyButton();
  updateStatus(`并发数: ${aiConcurrency} 线程`, "#3b82f6");
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function updateStatus(text, color = "#10b981") { statusEl.innerText = text; statusEl.style.color = color; }

function setPanelBusy(isBusy) {
  configBtn.disabled = isBusy;
  debugBtn.disabled = isBusy;
  startBtn.disabled = isBusy;
  concurrencyBtn.disabled = isBusy;
  configBtn.style.opacity = isBusy ? "0.55" : "";
  debugBtn.style.opacity = isBusy ? "0.55" : "";
  startBtn.style.opacity = isBusy ? "0.55" : "";
  concurrencyBtn.style.opacity = isBusy ? "0.55" : "";
}

function simulateClick(el) {
  if (!el) return;
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  el.click();
  el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
}

// 💥 终极拔毛法：过滤一切符号，纯汉字匹配，免疫所有多余的括号和省略号！
async function clickOptionByText(dialog, textToFind) {
  if (!textToFind || textToFind === "无") return false;
  
  // 核心：拔掉双方所有的 【 】 [ ] 空格 以及 .（省略号），只对比干净的汉字
  const normalize = (str) => str.replace(/[\[\]【】\s\.]/g, '');
  const cleanTarget = normalize(textToFind);
  
  const labels = Array.from(dialog.querySelectorAll('label'));
  
  // 策略A：去标点后的绝对精确匹配
  let targetLabel = labels.find(l => normalize(l.textContent) === cleanTarget);
  
  // 策略B：去标点后的前缀匹配（取前5个纯汉字比对，比如“慕思床垫定”）
  if (!targetLabel) {
    const matchKeyword = cleanTarget.substring(0, 5); 
    targetLabel = labels.find(l => {
      const uiTextClean = normalize(l.textContent);
      return uiTextClean.startsWith(matchKeyword) || uiTextClean.includes(matchKeyword);
    });
  }

  if (targetLabel) {
    const btnId = targetLabel.getAttribute('for');
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(400); 
      const isChecked = btn.getAttribute('data-state') === 'checked' || btn.getAttribute('aria-checked') === 'true';
      if (isChecked) return true;
      btn.click(); return true;
    }
  }
  return false;
}

// 💥 专杀丢失 Bug：React/Vue 穿透赋值核心函数
async function forceInjectTextToReact(textarea, textToInject) {
  textarea.focus();
  await sleep(200);

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  nativeInputValueSetter.call(textarea, textToInject);

  textarea.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: "a" }));
  textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: "a" }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));

  await sleep(500); 
  
  textarea.blur();
  textarea.dispatchEvent(new Event('focusout', { bubbles: true }));
}


// ==========================================
// 4. 高级自定义弹窗
// ==========================================
function openModal(htmlContent) {
  modalOverlay.innerHTML = htmlContent;
  modalOverlay.style.display = "flex";
  const header = modalOverlay.querySelector(SELECTORS.modalHandle);
  if (header) {
    header.onmousedown = (e) => {
      if (isBlockedDragTarget(e.target)) return;
      beginModalDrag(e);
    };
  }
}
function closeModal() { modalOverlay.style.display = "none"; modalOverlay.innerHTML = ""; }

// --- Prompt 配置面板 ---
configBtn.addEventListener("click", () => {
  if (isRunning) {
    updateStatus("单步测试/自动运行中，先完成当前流程", "#f59e0b");
    return;
  }

  const archives = readPromptArchives();
  const currentArchive = getActivePromptArchive();
  const optionHtml = archives.map(item => `
        <option value="${escapeHtml(item.id)}" ${item.id === currentArchive.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>
  `).join('');

  openModal(`
    <div class="modal-drag-handle" style="padding: 12px 20px; background: #0f172a; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; cursor: move;">
      <h3 style="margin:0; font-size:15px; pointer-events:none;">⚙️ Prompt 配置</h3>
      <select id="slot-selector" style="max-width: 180px; background: #1e293b; color: white; border: 1px solid #475569; padding: 4px; border-radius: 4px; outline: none;">
${optionHtml}
      </select>
    </div>
    <div style="padding: 15px; flex: 1; overflow: hidden; display: flex; flex-direction: column; gap: 10px;">
      <label style="font-size: 12px; color: #cbd5e1;">存档名称</label>
      <input id="prompt-name-editor" type="text" style="width: 100%; background: #0f172a; color: #e2e8f0; border: 1px solid #475569; border-radius: 6px; padding: 8px 10px; box-sizing: border-box; font-size: 12px; outline: none;" />
      <div style="display: flex; gap: 8px;">
        <button id="prompt-add" style="flex: 1; padding: 6px 10px; background: #10b981; border: none; color: white; border-radius: 6px; font-size: 12px; cursor: pointer;">➕ 新增存档</button>
        <button id="prompt-delete" style="flex: 1; padding: 6px 10px; background: #ef4444; border: none; color: white; border-radius: 6px; font-size: 12px; cursor: pointer;">🗑️ 删除当前</button>
      </div>
      <textarea id="prompt-editor" style="width: 100%; height: 400px; background: #0f172a; color: #e2e8f0; border: 1px solid #475569; border-radius: 6px; padding: 10px; font-family: monospace; font-size: 12px; resize: none; outline: none;"></textarea>
    </div>
    <div style="padding: 12px 20px; border-top: 1px solid #334155; display: flex; justify-content: flex-end; gap: 10px;">
      <button id="modal-cancel" style="padding: 6px 12px; background: transparent; border: 1px solid #64748b; color: #cbd5e1; border-radius: 6px; cursor: pointer;">关闭</button>
      <button id="modal-save" style="padding: 6px 12px; background: #3b82f6; border: none; color: white; border-radius: 6px; font-weight: bold; cursor: pointer;">💾 保存当前</button>
    </div>
  `);

  const selector = document.getElementById("slot-selector");
  const editor = document.getElementById("prompt-editor");
  const nameEditor = document.getElementById("prompt-name-editor");
  let selectedPromptId = currentArchive.id;

  const saveDraft = (archiveId, nameValue = nameEditor.value, contentValue = editor.value) => {
    const nextName = nameValue.trim() || "未命名存档";
    const nextArchives = readPromptArchives().map(item => item.id === archiveId ? {
      ...item,
      name: nextName,
      content: contentValue
    } : item);
    savePromptArchives(nextArchives);
    return nextName;
  };

  const syncEditor = () => {
    const archive = readPromptArchives().find(item => item.id === selector.value) || getActivePromptArchive();
    nameEditor.value = archive.name || "";
    editor.value = archive.content || "";
  };

  const refreshSelector = (selectedId) => {
    selector.innerHTML = readPromptArchives().map(item => `
      <option value="${escapeHtml(item.id)}" ${item.id === selectedId ? 'selected' : ''}>${escapeHtml(item.name)}</option>
    `).join('');
  };

  syncEditor();

  selector.addEventListener("change", (e) => {
    saveDraft(selectedPromptId);
    selectedPromptId = e.target.value;
    localStorage.setItem('qc_active_prompt_id', e.target.value);
    syncEditor();
  });

  document.getElementById("prompt-add").addEventListener("click", () => {
    saveDraft(selectedPromptId);
    const existing = readPromptArchives();
    const newArchive = createPromptArchive(`新存档 ${existing.length + 1}`, DEFAULT_PROMPT);
    const nextArchives = [...existing, newArchive];
    savePromptArchives(nextArchives);
    localStorage.setItem('qc_active_prompt_id', newArchive.id);
    selectedPromptId = newArchive.id;
    refreshSelector(newArchive.id);
    syncEditor();
    updateStatus(`已新增: ${newArchive.name}`);
  });

  document.getElementById("prompt-delete").addEventListener("click", () => {
    const existing = readPromptArchives();
    if (existing.length <= 1) {
      alert("至少需要保留 1 个 Prompt 存档");
      return;
    }
    const current = existing.find(item => item.id === selector.value);
    if (!confirm(`确定删除「${current ? current.name : '当前存档'}」吗？`)) return;

    const nextArchives = existing.filter(item => item.id !== selector.value);
    const nextActive = nextArchives[0];
    savePromptArchives(nextArchives);
    localStorage.setItem('qc_active_prompt_id', nextActive.id);
    selectedPromptId = nextActive.id;
    refreshSelector(nextActive.id);
    syncEditor();
    updateStatus(`已切换: ${nextActive.name}`);
  });

  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-save").addEventListener("click", () => {
    const activeId = selector.value;
    const nextName = saveDraft(activeId);
    localStorage.setItem('qc_active_prompt_id', activeId);
    updateStatus(`切换至: ${nextName}`);
    closeModal();
  });
});

// --- Debug 步骤 1：抓取核对 ---
function showStep1Modal(progressInfo, targetText, debugText) {
  return new Promise((resolve, reject) => {
    const safeProgressInfo = escapeHtml(progressInfo);
    const safeTargetText = escapeHtml(targetText);
    const safeDebugText = escapeHtml(debugText);

    openModal(`
      <div class="modal-drag-handle" style="padding: 12px 20px; background: #0f172a; border-bottom: 1px solid #334155; cursor: move; display: flex; justify-content: space-between;">
        <h3 style="margin:0; font-size:15px; pointer-events:none;">👀 步骤 1: 核对上下文 ${safeProgressInfo}</h3>
        <span style="font-size:14px; pointer-events:none;">✋</span>
      </div>
      <div style="padding: 15px; max-height: 50vh; overflow-y: auto;">
        <p style="font-size: 12px; color: #94a3b8; margin-top:0;">🎯 将打标的回复：</p>
        <div style="background: #0f172a; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 12px; border-left: 4px solid #8b5cf6;">${safeTargetText}</div>
        <p style="font-size: 12px; color: #94a3b8; margin-top:0;">📜 净化后的上帝视角上下文：</p>
        <pre style="background: #0f172a; padding: 10px; border-radius: 6px; font-size: 11px; white-space: pre-wrap; word-wrap: break-word; font-family: sans-serif;">${safeDebugText}</pre>
      </div>
      <div style="padding: 12px 15px; border-top: 1px solid #334155; display: flex; justify-content: flex-end; gap: 10px;">
        <button id="step1-cancel" style="padding: 8px 12px; background: #ef4444; border: none; color: white; border-radius: 6px; font-size: 12px; cursor: pointer;">⏹️ 终止</button>
        <button id="step1-ok" style="padding: 8px 12px; background: #10b981; border: none; color: white; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;">✅ 无误, 呼叫大模型</button>
      </div>
    `);
    document.getElementById("step1-cancel").addEventListener("click", () => { closeModal(); reject(new Error("用户手动终止")); });
    document.getElementById("step1-ok").addEventListener("click", () => { closeModal(); resolve(); });
  });
}

// --- Debug 步骤 2：报告导出 ---
function showStep2Modal(progressInfo, debugText, aiResult) {
  return new Promise((resolve, reject) => {
    const safeProgressInfo = escapeHtml(progressInfo);
    const safeCorrectness = escapeHtml(aiResult['是否正确']);
    const safeScene = escapeHtml(aiResult['标注场景']);
    const safeReason = escapeHtml(aiResult['问题原因']);
    const safeNeedAnalysis = escapeHtml(aiResult['防幻觉分析_1_顾客真实诉求']);
    const safePerformanceCheck = escapeHtml(aiResult['防幻觉分析_2_AI表现校验']);
    const safeEvaluation = escapeHtml(aiResult['评价']);

    openModal(`
      <div class="modal-drag-handle" style="padding: 12px 20px; background: #0f172a; border-bottom: 1px solid #334155; cursor: move; display: flex; justify-content: space-between;">
        <h3 style="margin:0; font-size:15px; pointer-events:none;">🧠 步骤 2: 模型判定 ${safeProgressInfo}</h3>
        <span style="font-size:14px; pointer-events:none;">✋</span>
      </div>
      <div style="padding: 15px; max-height: 60vh; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 12px;">
          <span style="background: ${aiResult['是否正确']==='正确'?'#064e3b':'#7f1d1d'}; color: ${aiResult['是否正确']==='正确'?'#34d399':'#fca5a5'}; padding: 4px 6px; border-radius: 4px; font-weight: bold;">${safeCorrectness}</span>
          <span style="background: #1e3a8a; color: #60a5fa; padding: 4px 6px; border-radius: 4px;">🏷️ ${safeScene}</span>
          <span style="background: #451a03; color: #fbbf24; padding: 4px 6px; border-radius: 4px;">⚠️ ${safeReason}</span>
        </div>
        <div style="background: #0f172a; padding: 10px; border-radius: 6px; font-size: 12px; line-height: 1.5;">
          <b style="color:#cbd5e1;">[诉求]</b> <span style="color:#94a3b8;">${safeNeedAnalysis}</span><br/>
          <b style="color:#cbd5e1;">[校验]</b> <span style="color:#94a3b8;">${safePerformanceCheck}</span><br/>
          <b style="color:#cbd5e1;">[评语]</b> <span style="color:#94a3b8;">${safeEvaluation}</span>
        </div>
        <div>
          <p style="font-size: 12px; font-weight: bold; margin: 0 0 4px 0;">✍️ 我的测试评语 (附于报告末尾)：</p>
          <textarea id="user-feedback" placeholder="写下优化建议..." style="width: 100%; height: 60px; background: #0f172a; color: white; border: 1px solid #475569; border-radius: 6px; padding: 8px; font-size: 12px; outline: none; resize: none;"></textarea>
        </div>
      </div>
      <div style="padding: 12px 15px; border-top: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <button id="step2-export" style="padding: 6px 10px; background: #8b5cf6; border: none; color: white; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">📋 复制报告</button>
        <div style="display: flex; gap: 8px;">
          <button id="step2-cancel" style="padding: 6px 10px; background: #ef4444; border: none; color: white; border-radius: 6px; cursor: pointer; font-size: 11px;">⏹️ 终止不填</button>
          <button id="step2-ok" style="padding: 6px 10px; background: #10b981; border: none; color: white; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">✅ 认同, 自动填表</button>
        </div>
      </div>
    `);

    document.getElementById("step2-cancel").addEventListener("click", () => { closeModal(); reject(new Error("用户手动终止")); });
    document.getElementById("step2-ok").addEventListener("click", () => { closeModal(); resolve(); });
    
    document.getElementById("step2-export").addEventListener("click", () => {
      const feedback = document.getElementById("user-feedback").value || "（无）";
      const report = `=========== AI 质检测试报告 ===========
【当前使用的 Prompt 存档】
${getActivePromptLabel()}

【净化后上下文】
${debugText}
【大模型判定结果】
判定：${aiResult['是否正确']}
场景：${aiResult['标注场景']}
原因：${aiResult['问题原因']}
【大模型思维链】
诉求：${aiResult['防幻觉分析_1_顾客真实诉求']}
校验：${aiResult['防幻觉分析_2_AI表现校验']}
评价：${aiResult['评价']}

【人工调试评语/优化建议】
${feedback}
=======================================`;
      navigator.clipboard.writeText(report).then(() => {
        const btn = document.getElementById("step2-export");
        btn.innerText = "✅ 复制成功";
        btn.style.background = "#059669";
        setTimeout(() => { btn.innerText = "📋 复制报告"; btn.style.background = "#8b5cf6"; }, 3000);
      }).catch(err => alert("复制失败，请手动选择文字复制"));
    });
  });
}

// ==========================================
// 5. 核心打标流程控制
// ==========================================
debugBtn.addEventListener("click", async () => {
    isRunning = true; updateStatus("🧪 调试中...", "#8b5cf6");
    setPanelBusy(true);
    try { await processCurrentCustomer(true); updateStatus("✅ 调试完成！", "#10b981"); } 
    catch (err) { updateStatus(`❌ 终止: ${err.message}`, "#ef4444"); }
    isRunning = false; setPanelBusy(false);
});

startBtn.addEventListener("click", async () => {
  isRunning = true; setPanelBusy(true); startBtn.style.background = "#475569"; stopBtn.disabled = false;
  updateStatus("🚀 自动运行中...", "#f59e0b");
  while (isRunning) {
    try {
      await processCurrentCustomer(false); 
      if (!isRunning) break;
      const hasNext = await moveToNextCustomer();
      if (!hasNext) break;
      updateStatus("⏳ 等待加载...", "#3b82f6");
      await sleep(3500); 
    } catch (err) {
      updateStatus(`❌ 跳过异常`, "#ef4444"); await moveToNextCustomer(); await sleep(3500);
    }
  }
  isRunning = false; setPanelBusy(false); startBtn.style.background = "#3b82f6"; stopBtn.disabled = true;
});

stopBtn.addEventListener("click", () => { isRunning = false; updateStatus("🛑 正在停止...", "#ef4444"); });

async function moveToNextCustomer() {
  const currentCustomer = document.querySelector(SELECTORS.activeCustomer);
  if (!currentCustomer) return false;
  const nextCustomer = currentCustomer.nextElementSibling;
  if (nextCustomer) {
    nextCustomer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(600); simulateClick(nextCustomer); return true;
  }
  updateStatus("🏁 处理完毕！", "#10b981"); return false;
}

function isButtonActive(btn) {
  if (!btn) return false;
  const svg = btn.querySelector("svg");
  return btn.getAttribute('data-state') === 'on' ||
         btn.getAttribute('aria-pressed') === 'true' ||
         btn.classList.contains('text-primary') ||
         (svg && svg.getAttribute('fill') && svg.getAttribute('fill') !== 'none');
}

function getPendingBotRows() {
  const allBotRows = Array.from(document.querySelectorAll(SELECTORS.botRow))
    .filter(row => row.querySelector(SELECTORS.thumbsUpIcon));

  return allBotRows.filter(row => {
    const upBtn = row.querySelector(SELECTORS.thumbsUpIcon)?.closest('button');
    const downBtn = row.querySelector(SELECTORS.thumbsDownIcon)?.closest('button');
    return !(isButtonActive(upBtn) || isButtonActive(downBtn));
  });
}

function getCleanCardBodyText(cardBody) {
  const clone = cardBody.cloneNode(true);
  clone.querySelectorAll(".absolute, svg, button").forEach(node => node.remove());
  return (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim();
}

function getMessageText(row) {
  let textContent = "";
  row.querySelectorAll(SELECTORS.messageText).forEach(span => {
    if (span.innerText) textContent += span.innerText.trim() + " ";
  });
  if (!textContent.trim()) {
    row.querySelectorAll(SELECTORS.messageCardBody).forEach(cardBody => {
      const cardText = getCleanCardBodyText(cardBody);
      if (cardText) textContent += cardText + " ";
    });
  }
  row.querySelectorAll(SELECTORS.messageImage).forEach(img => {
    if (img.src) textContent += `\n[发送了图片: ${img.src}]\n`;
  });
  return textContent.trim();
}

function getSenderName(row) {
  const nameNode = row.querySelector(SELECTORS.senderName);
  return nameNode ? nameNode.innerText.trim() : "未知";
}

function getMessageTime(row) {
  const timeReg = /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/;
  const titleNode = Array.from(row.querySelectorAll(SELECTORS.messageTime))
    .find(node => timeReg.test(node.getAttribute("title") || ""));
  if (titleNode) return (titleNode.getAttribute("title").match(timeReg) || [])[0] || "";

  const textNode = Array.from(row.querySelectorAll(SELECTORS.messageTime))
    .find(node => timeReg.test(node.innerText || node.textContent || ""));
  return textNode ? ((textNode.innerText || textNode.textContent || "").match(timeReg) || [])[0] || "" : "";
}

function getMessageDate(row) {
  const messageTime = getMessageTime(row);
  return messageTime ? messageTime.slice(0, 10) : "";
}

function formatMessagePrefix(row) {
  const messageTime = getMessageTime(row);
  return messageTime ? `[${messageTime}] ` : "";
}

function isInternalActionCard(row) {
  const cardTitle = Array.from(row.querySelectorAll(".rounded-lg span.font-medium"))
    .map(node => node.innerText.trim())
    .find(text => text);
  return row.querySelector(".border-dashed") || cardTitle === "转人工服务";
}

function buildQcContext(targetMessageRow) {
  const targetText = getMessageText(targetMessageRow);

  const aiPayloadContent = [{ type: "text", text: "请基于以下截断的上下文进行质检：\n" }];
  let debugText = "";
  const allMessageRows = document.querySelectorAll(SELECTORS.messageRows);
  const targetMessageDate = getMessageDate(targetMessageRow);

  for (let row of allMessageRows) {
    const isCustomer = row.classList.contains(SELECTORS.customerRow.slice(1));
    const senderName = getSenderName(row);
    const textContent = getMessageText(row);
    const messageDate = getMessageDate(row);
    const messagePrefix = formatMessagePrefix(row);

    if (!textContent) continue;

    if (row === targetMessageRow) {
      const targetLabel = isInternalActionCard(row)
        ? `【当前需质检的AI内部判断/动作卡片 - ${senderName}】`
        : `【当前需质检的AI生成草稿 - ${senderName}】`;
      const targetNote = isInternalActionCard(row)
        ? "\n说明：这是一张 AI 内部判断/动作卡片，顾客不可见，不是客服要发给顾客的话术；请评估这个内部判断或动作本身是否合理。\n"
        : "";
      const line = `\n👇 --- 以下是本次需要你评估的 AI 生成内容 --- 👇\n${messagePrefix}${targetLabel}: ${textContent}${targetNote}\n`;
      aiPayloadContent.push({ type: "text", text: line });
      debugText += line;
      break;
    }

    if (targetMessageDate && messageDate && messageDate !== targetMessageDate) continue;

    if (isCustomer) {
      const line = `${messagePrefix}【顾客(同一人)】: ${textContent}\n`;
      aiPayloadContent.push({ type: "text", text: line });
      debugText += line;
    } else if (senderName.includes("系统")) {
      const line = `${messagePrefix}【系统底层规则触发 (顾客不可见)】: ${textContent}\n`;
      aiPayloadContent.push({ type: "text", text: line });
      debugText += line;
    } else if (isInternalActionCard(row)) {
      const line = `${messagePrefix}【AI内部判断/动作卡片 (顾客不可见) - ${senderName}】: ${textContent}\n`;
      aiPayloadContent.push({ type: "text", text: line });
      debugText += line;
    } else if (row.querySelector(SELECTORS.thumbsUpIcon)) {
      continue;
    } else {
      const line = `${messagePrefix}【发给顾客的外露回复 - ${senderName}】: ${textContent}\n`;
      aiPayloadContent.push({ type: "text", text: line });
      debugText += line;
    }
  }

  return { aiPayloadContent, debugText, targetText };
}

function getCurrentSystemPrompt() {
  // ⚠️ 这里加了一步保险，如果当前存档里的 prompt 还是带双重括号的旧版，强制覆盖掉，防止用户没有点“恢复默认”
  const activePromptArchive = getActivePromptArchive();
  let systemPrompt = activePromptArchive.content;
  if (systemPrompt.includes('【【慕思】')) {
     systemPrompt = systemPrompt.replace(/【【慕思】/g, '[【慕思】').replace(/需求】】/g, '需求]');
     const archives = readPromptArchives().map(item => item.id === activePromptArchive.id ? {
       ...item,
       content: systemPrompt
     } : item);
     savePromptArchives(archives);
  }
  return systemPrompt;
}

function parseAIResult(res) {
  if (!res || res.error) throw new Error(res ? res.error : "后台无响应");
  const rawContent = res.result?.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error("模型返回为空");
  return JSON.parse(rawContent.replace(/```json|```/g, ""));
}

function callAIForQC(systemPrompt, aiPayloadContent) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: "callAI",
      payload: [{ role: "system", content: systemPrompt }, { role: "user", content: aiPayloadContent }]
    }, res => {
      if (chrome.runtime.lastError) return reject(new Error("通讯错误"));
      try {
        resolve(parseAIResult(res));
      } catch (parseErr) {
        reject(new Error(parseErr.message || "JSON解析失败"));
      }
    });
  });
}

async function openQCDialog(targetMessageRow, isCorrect, progressInfo) {
  const iconSelector = isCorrect ? SELECTORS.thumbsUpIcon : SELECTORS.thumbsDownIcon;
  const actionBtn = targetMessageRow.querySelector(iconSelector)?.closest("button");
  if (!actionBtn) throw new Error("找不到操作按钮");

  updateStatus(`👁️ 滚动至按钮 ${progressInfo}`);
  actionBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(600);
  simulateClick(actionBtn);
  await sleep(1500);

  const dialog = document.querySelector(SELECTORS.qcDialog);
  if (!dialog) throw new Error("弹窗未打开");
  dialog.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(400);
  return dialog;
}

async function closeQCDialog(dialog) {
  await sleep(800);
  const closeBtn = dialog.querySelector(SELECTORS.closeIcon)?.closest('button');
  if (closeBtn) simulateClick(closeBtn);
  else simulateClick(document.documentElement);
  await sleep(1200);
}

async function applyQCResult(targetMessageRow, aiResult, progressInfo, isDebug) {
  const isCorrect = aiResult['是否正确'] === "正确";
  updateStatus(`🎯 ${aiResult['是否正确']}|${aiResult['标注场景']}`, isCorrect ? "#10b981" : "#f59e0b");

  const dialog = await openQCDialog(targetMessageRow, isCorrect, progressInfo);
  const sceneClicked = await clickOptionByText(dialog, aiResult['标注场景']);
  if (!sceneClicked && isDebug) alert(`警告：没找到叫【${aiResult['标注场景']}】的场景！`);
  await sleep(600);

  if (!isCorrect) {
    if (aiResult['问题原因'] !== "无") {
      await clickOptionByText(dialog, aiResult['问题原因']);
      await sleep(600);
    }

    const remarkTa = dialog.querySelector(SELECTORS.remarkTextarea);
    if (remarkTa) {
      remarkTa.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const finalRemark = aiResult['评价'] || "判断为错误";
      await forceInjectTextToReact(remarkTa, finalRemark);
    }
  }

  await closeQCDialog(dialog);
}

// --- 💥 核心进化：带神级去重与身份翻译的提取逻辑 ---
async function processCurrentCustomer(isDebug) {
  updateStatus("🧠 扫描对话...");

  const botRows = getPendingBotRows();
  if (botRows.length === 0) {
     if(isDebug) alert("⚠️ 本会话的所有客服消息都已经打过标了，没有需要处理的新内容！");
     updateStatus("⏭️ 全部已评，跳过", "#64748b"); return;
  }

  const systemPrompt = getCurrentSystemPrompt();
  const tasks = botRows.map((targetMessageRow, i) => {
    const progressInfo = `(${i + 1}/${botRows.length})`;
    const { aiPayloadContent, debugText, targetText } = buildQcContext(targetMessageRow);
    return { targetMessageRow, progressInfo, aiPayloadContent, debugText, targetText };
  });

  if (isDebug) {
    for (let i = 0; i < tasks.length; i++) {
      if (!isRunning) break;

      const task = tasks[i];
      updateStatus(`🧠 质检进度: ${task.progressInfo}`);

      await showStep1Modal(task.progressInfo, task.targetText, task.debugText);

      updateStatus(`🧠 呼叫大模型 ${task.progressInfo}`);
      let aiResult;
      try {
        aiResult = await callAIForQC(systemPrompt, task.aiPayloadContent);
      } catch (err) {
        alert("报错：\n" + err.message);
        throw err;
      }

      if (!isRunning) return;

      await showStep2Modal(task.progressInfo, task.debugText, aiResult);
      await applyQCResult(task.targetMessageRow, aiResult, task.progressInfo, true);
    }
    return;
  }

  const effectiveConcurrency = Math.min(aiConcurrency, tasks.length);
  for (let batchStart = 0; batchStart < tasks.length && isRunning; batchStart += effectiveConcurrency) {
    const batch = tasks.slice(batchStart, batchStart + effectiveConcurrency);
    const batchEnd = batchStart + batch.length;
    updateStatus(`🧠 并发质检 ${batchStart + 1}-${batchEnd}/${tasks.length}`, "#3b82f6");

    const analyzedBatch = await Promise.all(batch.map(async (task) => {
      const aiResult = await callAIForQC(systemPrompt, task.aiPayloadContent);
      return { ...task, aiResult };
    }));

    for (let i = 0; i < analyzedBatch.length; i++) {
      if (!isRunning) break;

      const item = analyzedBatch[i];
      updateStatus(`🖱️ 正在写入 ${item.progressInfo}`);
      await applyQCResult(item.targetMessageRow, item.aiResult, item.progressInfo, false);
    }
  }
}
