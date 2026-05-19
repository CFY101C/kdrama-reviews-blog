const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "陈飞扬";
pres.title = "美伊中东战况深度调研 — 2026年5月";

// Color palette — Modern Minimalist Dark
const C = {
  bg: "1a1c1e",
  bgCard: "252729",
  text: "c8ccd0",
  textDim: "6b6e71",
  accent: "f0a500",
  accent2: "cf3a2c",
  border: "3a3d40",
  white: "ffffff",
};

// Helper: add a full-slide background
function bg(slide, color) {
  slide.background = { fill: color || C.bg };
}

// Helper: add top accent line
function accentLine(slide) {
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent } });
}

// Helper: section heading with accent bar
function sectionTitle(slide, text, y) {
  slide.addShape(pres.ShapeType.rect, { x: 0.6, y: y, w: 0.06, h: 0.5, fill: { color: C.accent } });
  slide.addText(text, { x: 0.85, y: y - 0.08, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
}

// Helper: body text
function body(slide, text, y, size) {
  slide.addText(text, { x: 0.85, y: y, w: 8.3, h: 3, fontSize: size || 13, fontFace: "Arial", color: C.text, lineSpacing: 24, margin: 0 });
}

// Helper: card box
function card(slide, x, y, w, h, color) {
  slide.addShape(pres.ShapeType.rect, { x: x, y: y, w: w, h: h, fill: { color: color || C.bgCard }, rectRadius: 0.05 });
}

// Helper: key stat card
function statCard(slide, x, y, w, num, label, color) {
  card(slide, x, y, w, 1.15);
  slide.addText(num, { x: x + 0.2, y: y + 0.1, w: w - 0.4, h: 0.55, fontSize: 28, fontFace: "Arial", color: color || C.accent, bold: true, margin: 0 });
  slide.addText(label, { x: x + 0.2, y: y + 0.65, w: w - 0.4, h: 0.35, fontSize: 10, fontFace: "Arial", color: C.textDim, margin: 0 });
}

// Helper: timeline item
function timelineItem(slide, x, y, date, desc) {
  slide.addShape(pres.ShapeType.ellipse, { x: x, y: y + 0.04, w: 0.12, h: 0.12, fill: { color: C.accent } });
  slide.addText(date, { x: x + 0.25, y: y - 0.05, w: 1.5, h: 0.25, fontSize: 10, fontFace: "Arial", color: C.accent, bold: true, margin: 0 });
  slide.addText(desc, { x: x + 1.7, y: y - 0.05, w: 7.5, h: 0.25, fontSize: 11, fontFace: "Arial", color: C.text, margin: 0 });
}

// Helper: page number
function pageNum(slide, n) {
  slide.addText(String(n), { x: 9.2, y: 5.15, w: 0.5, h: 0.3, fontSize: 9, fontFace: "Arial", color: C.textDim, align: "right", margin: 0 });
}

// ====================================================================
// SLIDE 1 — Title
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  // Decorative corner elements
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.03, h: 1.2, fill: { color: C.accent } });
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 1.2, h: 0.03, fill: { color: C.accent } });
  s.addShape(pres.ShapeType.rect, { x: 9.97, y: 5.595, w: 0.03, h: -1.2, fill: { color: C.accent } });
  s.addShape(pres.ShapeType.rect, { x: 8.8, y: 5.595, w: 1.2, h: 0.03, fill: { color: C.accent } });

  s.addText("MIDDLE EAST CONFLICT REPORT", { x: 1, y: 1.2, w: 8, h: 0.4, fontSize: 12, fontFace: "Arial", color: C.accent, charSpacing: 6, margin: 0 });
  s.addText("美伊中东战况\n深度调研", { x: 1, y: 1.7, w: 8, h: 2, fontSize: 44, fontFace: "Arial", color: C.white, bold: true, lineSpacing: 56, margin: 0 });
  s.addShape(pres.ShapeType.rect, { x: 1, y: 3.8, w: 1.5, h: 0.03, fill: { color: C.accent } });
  s.addText("2026年5月13日  ·  陈飞扬", { x: 1, y: 4.0, w: 8, h: 0.4, fontSize: 13, fontFace: "Arial", color: C.textDim, margin: 0 });
  pageNum(s, 1);
}

// ====================================================================
// SLIDE 2 — Agenda
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  sectionTitle(s, "今日议程", 0.5);
  s.addShape(pres.ShapeType.rect, { x: 0.85, y: 1.15, w: 8.3, h: 0.01, fill: { color: C.border } });

  const items = [
    ["01", "战争缘起", "\"史诗怒火行动\"全过程"],
    ["02", "关键时间线", "72天战事节点回顾"],
    ["03", "军事对峙", "霍尔木兹海峡当前态势"],
    ["04", "外交博弈", "谈判桌上的拉锯战"],
    ["05", "经济冲击", "全球能源市场震荡"],
    ["06", "多方战场", "黎巴嫩 · 也门 · 加沙"],
    ["07", "国际反应", "大国博弈与盟友裂痕"],
    ["08", "未来预测", "三种情景分析"],
  ];

  items.forEach((item, i) => {
    const y = 1.4 + i * 0.5;
    s.addText(item[0], { x: 0.85, y: y, w: 0.5, h: 0.4, fontSize: 18, fontFace: "Arial", color: C.accent, bold: true, margin: 0 });
    s.addText(item[1], { x: 1.5, y: y + 0.02, w: 2, h: 0.35, fontSize: 14, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
    s.addText(item[2], { x: 3.5, y: y + 0.02, w: 5, h: 0.35, fontSize: 11, fontFace: "Arial", color: C.textDim, margin: 0 });
    if (i < items.length - 1) {
      s.addShape(pres.ShapeType.rect, { x: 0.85, y: y + 0.45, w: 8.3, h: 0.005, fill: { color: C.border } });
    }
  });
  pageNum(s, 2);
}

// ====================================================================
// SLIDE 3 — 战争缘起
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  sectionTitle(s, "战争缘起：\"史诗怒火行动\"", 0.5);

  card(s, 0.6, 1.3, 3.8, 3.8);
  s.addText([
    { text: "2026.02.28", options: { fontSize: 14, color: C.accent, bold: true, breakLine: true } },
    { text: "美以联合发动代号 \"Operation Epic Fury\"", options: { fontSize: 13, color: C.text, breakLine: true, breakLine: true } },
    { text: "大规模空袭", options: { fontSize: 20, color: C.white, bold: true, breakLine: true } },
    { text: "击杀伊朗最高精神领袖哈梅内伊及多名军政高层", options: { fontSize: 11, color: C.textDim } },
  ], { x: 0.85, y: 1.5, w: 3.3, h: 3, lineSpacing: 22, margin: 0 });

  card(s, 4.7, 1.3, 4.7, 1.7);
  s.addText([
    { text: "直接后果", options: { fontSize: 12, color: C.accent, bold: true, breakLine: true, breakLine: true } },
    { text: "▸ 穆杰塔巴·哈梅内伊继任最高领袖", options: { fontSize: 11, color: C.text, breakLine: true } },
    { text: "▸ 伊朗对以色列及海湾地区发动大规模导弹报复", options: { fontSize: 11, color: C.text, breakLine: true } },
    { text: "▸ 霍尔木兹海峡被封锁", options: { fontSize: 11, color: C.accent2, breakLine: true } },
    { text: "▸ 全球能源市场剧烈震荡", options: { fontSize: 11, color: C.accent2 } },
  ], { x: 4.95, y: 1.5, w: 4.2, h: 1.5, lineSpacing: 22, margin: 0 });

  card(s, 4.7, 3.2, 4.7, 1.9);
  s.addText([
    { text: "战前背景", options: { fontSize: 12, color: C.accent, bold: true, breakLine: true, breakLine: true } },
    { text: "▸ 2025年10月：伊朗终止2015年伊核协议（JCPOA）", options: { fontSize: 11, color: C.text, breakLine: true } },
    { text: "▸ 2025年末：联合国制裁\"回弹\"，伊朗核浓缩水平上升", options: { fontSize: 11, color: C.text, breakLine: true } },
    { text: "▸ 2026年1月：伊朗爆发全国抗议，约550人死亡", options: { fontSize: 11, color: C.text, breakLine: true } },
    { text: "▸ 2026年2月：日内瓦间接谈判破裂", options: { fontSize: 11, color: C.text } },
  ], { x: 4.95, y: 3.4, w: 4.2, h: 1.7, lineSpacing: 22, margin: 0 });

  pageNum(s, 3);
}

// ====================================================================
// SLIDE 4 — Timeline
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  sectionTitle(s, "72天关键时间线", 0.5);

  // Vertical line
  s.addShape(pres.ShapeType.rect, { x: 1.5, y: 1.3, w: 0.015, h: 3.8, fill: { color: C.border } });

  const events = [
    ["02.28", "美以联合空袭，\"史诗怒火行动\"，战争爆发"],
    ["03.02", "以色列入侵黎巴嫩南部，推进至利塔尼河"],
    ["03.28", "也门胡塞武装参战，向以色列发射弹道导弹"],
    ["04.08", "美方宣布\"无限期停火\""],
    ["05.07", "美伊在霍尔木兹海峡再度交火"],
    ["05.10", "伊朗通过巴基斯坦渠道正式拒绝美方方案"],
  ];

  events.forEach((e, i) => {
    const y = 1.4 + i * 0.63;
    s.addShape(pres.ShapeType.ellipse, { x: 1.42, y: y + 0.04, w: 0.17, h: 0.17, fill: { color: i < 3 ? C.accent : C.accent2 } });
    s.addText(e[0], { x: 1.75, y: y - 0.02, w: 1, h: 0.25, fontSize: 10, fontFace: "Arial", color: C.accent, bold: true, margin: 0 });
    s.addText(e[1], { x: 3, y: y - 0.02, w: 6.2, h: 0.25, fontSize: 11, fontFace: "Arial", color: C.text, margin: 0 });
  });

  // "We are here" marker
  s.addShape(pres.ShapeType.rect, { x: 1.15, y: 5.0, w: 8.7, h: 0.35, fill: { color: C.bgCard } });
  s.addText("▲ 当前：Day 72  —  停火脆弱，谈判僵持，\"边打边谈\"常态化", { x: 1.3, y: 5.03, w: 8.4, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.accent, italic: true, margin: 0 });

  pageNum(s, 4);
}

// ====================================================================
// SLIDE 5 — 军事态势
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  sectionTitle(s, "当前军事态势：霍尔木兹海峡", 0.5);

  // Top stats row
  statCard(s, 0.6, 1.3, 2.8, "16艘", "美军中东部署军舰");
  statCard(s, 3.55, 1.3, 2.8, "120%", "伊朗导弹产能（vs战前）");
  statCard(s, 6.5, 1.3, 2.8, "61艘", "商船被迫绕行好望角");

  // US side
  card(s, 0.6, 2.75, 4.2, 2.4);
  s.addText("美方部署", { x: 0.85, y: 2.9, w: 3.5, h: 0.35, fontSize: 14, fontFace: "Arial", color: C.accent, bold: true, margin: 0 });
  s.addText([
    { text: "▸ 16艘军舰（含航母战斗群）部署中东", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "▸ 对伊朗港口实施海上封锁", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "▸ \"Project Freedom\"：为商船提供护航", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "▸ 5月7-8日空袭格什姆港、阿巴斯港", options: { breakLine: true, fontSize: 11, color: C.text } },
  ], { x: 0.85, y: 3.35, w: 3.7, h: 1.8, lineSpacing: 22, margin: 0 });

  // Iran side
  card(s, 5.1, 2.75, 4.3, 2.4);
  s.addText("伊朗部署", { x: 5.35, y: 2.9, w: 3.5, h: 0.35, fontSize: 14, fontFace: "Arial", color: C.accent2, bold: true, margin: 0 });
  s.addText([
    { text: "▸ 革命卫队封锁海峡两条航道", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "▸ 轻型潜艇在霍尔木兹海峡部署待命", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "▸ 保留战前约70%导弹库存", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "▸ 警告：任何侵犯将招致对美目标打击", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "▸ 成立\"波斯湾海峡管理局\"收取通行费", options: { breakLine: true, fontSize: 11, color: C.text } },
  ], { x: 5.35, y: 3.35, w: 3.7, h: 1.8, lineSpacing: 22, margin: 0 });

  pageNum(s, 5);
}

// ====================================================================
// SLIDE 6 — 外交博弈
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  sectionTitle(s, "外交博弈：谈判桌上的拉锯", 0.5);

  // US column
  card(s, 0.6, 1.3, 4.2, 3.8);
  s.addShape(pres.ShapeType.rect, { x: 0.6, y: 1.3, w: 4.2, h: 0.04, fill: { color: C.accent } });
  s.addText("美方方案", { x: 0.85, y: 1.5, w: 3.7, h: 0.35, fontSize: 16, fontFace: "Arial", color: C.accent, bold: true, margin: 0 });
  s.addText([
    { text: "\"一页备忘录\"", options: { bold: true, fontSize: 12, color: C.white, breakLine: true, breakLine: true } },
    { text: "▸ 结束战事，开放霍尔木兹海峡", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "▸ 启动30天细则谈判", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "▸ 核问题等核心分歧被搁置", options: { breakLine: true, fontSize: 11, color: C.textDim } },
    { text: "▸ 坚持\"零浓缩\"红线", options: { breakLine: true, fontSize: 11, color: C.accent2 } },
    { text: "▸ 特朗普：伊方回应 \"TOTALLY UNACCEPTABLE\"", options: { breakLine: true, fontSize: 11, color: C.accent2 } },
  ], { x: 0.85, y: 2.0, w: 3.7, h: 2.8, lineSpacing: 20, margin: 0 });

  // Iran column
  card(s, 5.1, 1.3, 4.3, 3.8);
  s.addShape(pres.ShapeType.rect, { x: 5.1, y: 1.3, w: 4.3, h: 0.04, fill: { color: C.accent2 } });
  s.addText("伊方六条反条件", { x: 5.35, y: 1.5, w: 3.7, h: 0.35, fontSize: 16, fontFace: "Arial", color: C.accent2, bold: true, margin: 0 });
  s.addText([
    { text: "2026.05.10 通过巴基斯坦渠道递送", options: { bold: true, fontSize: 10, color: C.textDim, breakLine: true, breakLine: true } },
    { text: "1. 永久停火（非\"无限期\"口头承诺）", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "2. 解除海上封锁", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "3. 全面撤销制裁", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "4. 释放冻结资产", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "5. 赔偿战争损失", options: { breakLine: true, fontSize: 11, color: C.text } },
    { text: "6. 承认伊朗对霍尔木兹海峡主权", options: { breakLine: true, fontSize: 11, color: C.text } },
  ], { x: 5.35, y: 2.0, w: 3.7, h: 2.8, lineSpacing: 20, margin: 0 });

  // Bottom note
  s.addText("调解方：巴基斯坦 · 瑞士  |  核心僵局：\"零浓缩\" vs \"和平利用核能权利\"", { x: 0.6, y: 5.0, w: 8.8, h: 0.3, fontSize: 10, fontFace: "Arial", color: C.textDim, italic: true, align: "center", margin: 0 });

  pageNum(s, 6);
}

// ====================================================================
// SLIDE 7 — 经济冲击
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  sectionTitle(s, "全球经济冲击", 0.5);

  // Oil price visual bar
  card(s, 0.6, 1.3, 8.8, 1.6);
  s.addText("布伦特原油价格走势", { x: 0.85, y: 1.4, w: 4, h: 0.3, fontSize: 13, fontFace: "Arial", color: C.accent, bold: true, margin: 0 });

  // Bar chart using shapes
  const bars = [
    ["战前", 0.2, C.textDim],
    ["3月初", 0.6, C.accent2],
    ["4月高点", 0.95, C.accent2],
    ["5月当前", 0.72, C.accent],
  ];
  bars.forEach((b, i) => {
    const x = 1 + i * 2.2;
    s.addShape(pres.ShapeType.rect, { x: x, y: 2.1 - b[1] * 0.7, w: 1, h: b[1] * 0.7, fill: { color: b[2] } });
    s.addText("$" + Math.round(b[1] * 130), { x: x, y: 2.1 - b[1] * 0.7 - 0.3, w: 1, h: 0.25, fontSize: 14, fontFace: "Arial", color: b[2], bold: true, align: "center", margin: 0 });
    s.addText(b[0], { x: x, y: 2.15, w: 1, h: 0.25, fontSize: 10, fontFace: "Arial", color: C.textDim, align: "center", margin: 0 });
  });

  // Bottom stats
  statCard(s, 0.6, 3.2, 2.8, "$108", "布伦特原油/桶（风险溢价$10-15）");
  statCard(s, 3.55, 3.2, 2.8, "1:150万", "伊朗里亚尔兑美元汇率");
  statCard(s, 6.5, 3.2, 2.8, "40-50%", "伊朗通胀率");

  // Impact items
  card(s, 0.6, 4.05, 8.8, 1.1);
  s.addText([
    { text: "关键影响：", options: { bold: true, fontSize: 11, color: C.accent, breakLine: true } },
    { text: "▸ 若局势升级，油价或冲击$150/桶，引发全球衰退  |  ▸ 若达成协议，100-150万桶/日伊朗石油预计6-12个月内回归市场  |  ▸ 多家机构下调全球经济增长预期  |  ▸ 《日经亚洲》称为\"半个世纪以来最具经济破坏性的战事\"", options: { fontSize: 10, color: C.text } },
  ], { x: 0.85, y: 4.15, w: 8.3, h: 0.9, lineSpacing: 18, margin: 0 });

  pageNum(s, 7);
}

// ====================================================================
// SLIDE 8 — 多方战场
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  sectionTitle(s, "多方战场格局", 0.5);

  // 3 front cards
  const fronts = [
    ["黎巴嫩", "🇱🇧", C.accent2,
      "▸ 以军地面入侵，推进至利塔尼河\n▸ 37万+儿童流离失所（UNICEF）\n▸ 真主党22次攻击以军（5月9日）\n▸ 黎政府禁止真主党军事活动"],
    ["也门", "🇾🇪", C.accent,
      "▸ 胡塞武装3月28日参战\n▸ 向别是巴、埃拉特发射弹道导弹\n▸ 威胁封锁曼德海峡\n▸ 声称协同伊朗与真主党"],
    ["加沙", "🇵🇸", C.textDim,
      "▸ 2025年10月停火基本维持\n▸ 第二阶段谈判停滞\n▸ 以色列控制53%加沙领土\n▸ 哈马斯拒绝无条件解除武装"],
  ];

  fronts.forEach((f, i) => {
    const x = 0.6 + i * 3.1;
    card(s, x, 1.3, 2.9, 3.7);
    s.addShape(pres.ShapeType.rect, { x: x, y: 1.3, w: 2.9, h: 0.03, fill: { color: f[2] } });
    s.addText(f[1] + "  " + f[0], { x: x + 0.2, y: 1.5, w: 2.5, h: 0.4, fontSize: 16, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
    s.addText(f[3], { x: x + 0.2, y: 2.1, w: 2.5, h: 2.5, fontSize: 10, fontFace: "Arial", color: C.text, lineSpacing: 22, margin: 0 });
  });

  // Bottom: Gulf states
  card(s, 0.6, 4.35, 8.8, 0.8);
  s.addText("海湾国家：阿联酋拦截伊朗无人机（3人受伤）| 科威特机场燃料库遭袭 | 卡塔尔水域商船被击中 | 韩国货船被\"不明飞行器\"击中", { x: 0.85, y: 4.45, w: 8.3, h: 0.6, fontSize: 10, fontFace: "Arial", color: C.text, lineSpacing: 18, margin: 0 });

  pageNum(s, 8);
}

// ====================================================================
// SLIDE 9 — 国际反应
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  sectionTitle(s, "国际反应与大国博弈", 0.5);

  const reactions = [
    ["G7 / 欧洲", C.accent, "表达关切但\"撇清关系\"", "跨大西洋裂痕加深；卢比奥称盟国应对美\"心存感激\""],
    ["俄罗斯 & 中国", C.accent, "\"有限回应\"策略", "与伊朗保持联系，但不愿直接军事介入"],
    ["中东盟国", C.accent2, "陷入\"安全外包\"困境", "依赖美国越深，安全风险越高 — 沙特基地遭袭，12名美军受伤"],
    ["美国国内", C.accent2, "近60%民众反对动武", "中期选举选情动荡；多数学者将此战比作\"苏伊士运河时刻\""],
  ];

  reactions.forEach((r, i) => {
    const y = 1.3 + i * 0.85;
    card(s, 0.6, y, 8.8, 0.7);
    s.addShape(pres.ShapeType.rect, { x: 0.6, y: y, w: 0.06, h: 0.7, fill: { color: r[1] } });
    s.addText(r[0], { x: 0.85, y: y + 0.05, w: 1.8, h: 0.25, fontSize: 13, fontFace: "Arial", color: r[1], bold: true, margin: 0 });
    s.addText(r[2], { x: 0.85, y: y + 0.35, w: 3, h: 0.25, fontSize: 11, fontFace: "Arial", color: C.white, margin: 0 });
    s.addText(r[3], { x: 4.2, y: y + 0.15, w: 5, h: 0.5, fontSize: 10, fontFace: "Arial", color: C.textDim, margin: 0 });
  });

  // quote box
  card(s, 0.6, 4.7, 8.8, 0.55);
  s.addText("\"这可能是美国霸权的苏伊士运河时刻\" — 多国学者评论", { x: 0.85, y: 4.78, w: 8.3, h: 0.4, fontSize: 12, fontFace: "Arial", color: C.accent, italic: true, align: "center", margin: 0 });

  pageNum(s, 9);
}

// ====================================================================
// SLIDE 10 — 未来预测
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  sectionTitle(s, "专家分析：三种情景预测", 0.5);

  const scenarios = [
    ["① 长期冻结冲突", "最可能", C.accent, "0.7",
      "低烈度对峙持续，双方均无力全面升级\n\"用时间换取战略空间\"\n大概率成为未来数月主旋律"],
    ["② 谈判突破", "中等概率", C.text, "0.5",
      "分阶段解决：海峡开放 → 永久停火\n→ 核问题谈判\n需要至少一方做出重大让步"],
    ["③ 战火重燃", "低概率高风险", C.accent2, "0.3",
      "大规模军事冲突重启\n霍尔木兹海峡全面关闭\n油价冲击$150+，全球衰退风险"],
  ];

  scenarios.forEach((sc, i) => {
    const x = 0.6 + i * 3.1;
    const h = 3.8;
    card(s, x, 1.3, 2.9, h);
    // probability indicator
    s.addShape(pres.ShapeType.rect, { x: x, y: 1.3, w: 2.9, h: parseFloat(sc[3]) * h, fill: { color: sc[2] }, transparency: 85 });
    s.addText(sc[0], { x: x + 0.15, y: 1.5, w: 2.6, h: 0.35, fontSize: 14, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
    s.addText(sc[1], { x: x + 0.15, y: 1.9, w: 2.6, h: 0.25, fontSize: 10, fontFace: "Arial", color: sc[2], italic: true, margin: 0 });
    s.addShape(pres.ShapeType.rect, { x: x + 0.15, y: 2.2, w: 1, h: 0.01, fill: { color: C.border } });
    s.addText(sc[4], { x: x + 0.15, y: 2.4, w: 2.6, h: 2.5, fontSize: 10, fontFace: "Arial", color: C.text, lineSpacing: 20, margin: 0 });
  });

  pageNum(s, 10);
}

// ====================================================================
// SLIDE 11 — Key Data
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);
  sectionTitle(s, "关键数据一览", 0.5);

  const stats = [
    ["72", "战争已持续天数\n（截至5月10日）", C.accent],
    ["16艘+", "美军中东部署军舰\n（含航母战斗群）", C.accent],
    ["$108", "布伦特原油/桶\n（风险溢价$10-15）", C.accent2],
    ["70%", "伊朗战前导弹保有量\n（宣称产能达120%）", C.accent2],
    ["37万+", "黎巴嫩流离失所儿童\n（UNICEF数据）", C.textDim],
    ["61艘", "商船被迫绕行\n好望角", C.accent],
    ["40-50%", "伊朗通胀率\n（里亚尔崩盘）", C.accent2],
    ["~550人", "伊朗国内抗议死亡\n（2026.1前，ACLED）", C.textDim],
  ];

  stats.forEach((st, i) => {
    const x = 0.6 + (i % 4) * 2.3;
    const y = 1.3 + Math.floor(i / 4) * 2.1;
    card(s, x, y, 2.1, 1.85);
    s.addText(st[0], { x: x + 0.15, y: y + 0.2, w: 1.8, h: 0.65, fontSize: 30, fontFace: "Arial", color: st[2], bold: true, margin: 0 });
    s.addText(st[1], { x: x + 0.15, y: y + 0.9, w: 1.8, h: 0.8, fontSize: 9, fontFace: "Arial", color: C.textDim, lineSpacing: 14, margin: 0 });
  });

  pageNum(s, 11);
}

// ====================================================================
// SLIDE 12 — Summary & Refs
// ====================================================================
{
  const s = pres.addSlide();
  bg(s);
  accentLine(s);

  // Decorative bottom corners (matching slide 1)
  s.addShape(pres.ShapeType.rect, { x: 0, y: 5.595, w: 0.03, h: -1.2, fill: { color: C.accent } });
  s.addShape(pres.ShapeType.rect, { x: 8.8, y: 0, w: 1.2, h: 0.03, fill: { color: C.accent } });

  sectionTitle(s, "总结与展望", 0.5);

  card(s, 0.6, 1.3, 8.8, 2.5);
  s.addText([
    { text: "核心判断", options: { fontSize: 14, color: C.accent, bold: true, breakLine: true, breakLine: true } },
    { text: "▸ 2026年中东已进入\"后霸权时代\"的震荡调整期 — 旧秩序加速瓦解，新格局尚未成形", options: { breakLine: true, fontSize: 12, color: C.text } },
    { text: "▸ 美伊双方均陷入消耗战困局，短期难见根本性突破 — \"边打边谈\"将成为新常态", options: { breakLine: true, fontSize: 12, color: C.text } },
    { text: "▸ 霍尔木兹海峡安全成全球最大不确定性因素 — 全球1/3海运石油命脉悬于一线", options: { breakLine: true, fontSize: 12, color: C.text } },
    { text: "▸ 世界正在为这场战争\"买单\" — 能源价格、供应链、国际秩序均受深刻重塑", options: { breakLine: true, fontSize: 12, color: C.accent2 } },
  ], { x: 0.85, y: 1.4, w: 8.3, h: 2.3, lineSpacing: 28, margin: 0 });

  card(s, 0.6, 4.0, 8.8, 1.2);
  s.addText("参考文献", { x: 0.85, y: 4.1, w: 2, h: 0.3, fontSize: 12, fontFace: "Arial", color: C.accent, bold: true, margin: 0 });
  s.addText("CNN / BBC / Reuters / Al Jazeera / France24 / 新华社 / 人民日报 / Chatham House / FDD / ACLED / 央视新闻 / 环球视线", { x: 0.85, y: 4.4, w: 8.3, h: 0.7, fontSize: 10, fontFace: "Arial", color: C.textDim, lineSpacing: 18, margin: 0 });

  s.addText("陈飞扬 · 2026.05.13", { x: 0.6, y: 5.0, w: 8.8, h: 0.3, fontSize: 10, fontFace: "Arial", color: C.textDim, align: "right", margin: 0 });

  pageNum(s, 12);
}

// ====================================================================
// Write file
// ====================================================================
pres.writeFile({ fileName: "c:/cfcode/美伊中东战况调研_2026年5月.pptx" })
  .then(() => console.log("PPTX created successfully!"))
  .catch(err => console.error("Error:", err));
