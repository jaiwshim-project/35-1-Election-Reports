/* ============================================
   선거 후보자 비교 분석 플랫폼 - 공유 유틸리티
   ============================================ */

const METRICS = ['공익성','정책실행력','전문성','대응성','책임성','소통능력','리더십','비전명확성','청렴성','윤리성'];

const METRIC_LABELS = {
  '공익성': '공익성',
  '정책실행력': '정책 실행력',
  '전문성': '전문성',
  '대응성': '대응성',
  '책임성': '책임성',
  '소통능력': '소통능력',
  '리더십': '리더십',
  '비전명확성': '비전 명확성',
  '청렴성': '청렴성',
  '윤리성': '윤리성'
};

const CANDIDATE_COLORS = [
  { border: '#2563eb', bg: 'rgba(37,99,235,0.15)', light: '#dbeafe', text: '#1e40af', solid: '#2563eb' },
  { border: '#dc2626', bg: 'rgba(220,38,38,0.15)',  light: '#fee2e2', text: '#991b1b', solid: '#dc2626' },
  { border: '#16a34a', bg: 'rgba(22,163,74,0.15)',  light: '#dcfce7', text: '#166534', solid: '#16a34a' },
  { border: '#d97706', bg: 'rgba(217,119,6,0.15)',  light: '#fef3c7', text: '#92400e', solid: '#d97706' },
  { border: '#7c3aed', bg: 'rgba(124,58,237,0.15)', light: '#ede9fe', text: '#5b21b6', solid: '#7c3aed' },
];

const AI_MODELS = ['claude','chatgpt','gemini','grok'];
const AI_LABELS = { claude:'Claude', chatgpt:'ChatGPT', gemini:'Gemini', grok:'Grok' };
const AI_COLORS = ['#7c3aed','#16a34a','#2563eb','#dc2626'];

// ── LocalStorage ──
function getData() {
  try { return JSON.parse(localStorage.getItem('election_data') || 'null'); }
  catch { return null; }
}
function setData(data) { localStorage.setItem('election_data', JSON.stringify(data)); }
function getApiKey() { return localStorage.getItem('anthropic_api_key') || ''; }
function setApiKey(key) { localStorage.setItem('anthropic_api_key', key); }
function getTargetIdx() { const v = localStorage.getItem('target_candidate_idx'); return v !== null ? parseInt(v) : null; }
function setTargetIdx(idx) { localStorage.setItem('target_candidate_idx', idx); }

// ── 내비게이션 렌더링 ──
const NAV_PAGES = [
  { href: 'index.html',           icon: '🏠', label: '홈 · 분석' },
  { href: 'report_compare.html',  icon: '📊', label: '종합 비교' },
  { href: 'report_scores.html',   icon: '📈', label: '점수 상세' },
  { href: 'report_profiles.html', icon: '👤', label: '후보 프로파일' },
  { href: 'report_gaps.html',     icon: '🎯', label: '격차 분석' },
  { href: 'report_ai.html',       icon: '🤖', label: 'AI 모델 비교' },
  { href: 'report_full.html',      icon: '📋', label: '01. 통합 분석 리포트' },
  { href: 'report_landscape.html', icon: '🗺️', label: '02. 선거 판세 인텔리전스' },
  { href: 'report_strategy.html',   icon: '🏆', label: '03. 당선 전략' },
  { href: 'diagram_workflow.html', icon: '📊', label: '분석 구조도' },
];

function renderNav() {
  const el = document.getElementById('main-nav');
  if (!el) return;
  const current = window.location.pathname.split('/').pop() || 'index.html';
  el.innerHTML = NAV_PAGES.map(p =>
    `<a href="${p.href}" class="nav-item${p.href===current?' active':''}">${p.icon} ${p.label}</a>`
  ).join('');
}

// ── 데이터 확인 (리포트 페이지용) ──
function requireData() {
  const data = getData();
  if (!data || !data.candidates || data.candidates.length === 0) {
    const content = document.getElementById('page-content');
    if (content) {
      content.innerHTML = `
        <div class="no-data">
          <div style="font-size:48px;margin-bottom:16px">📂</div>
          <h3>분석된 데이터가 없습니다</h3>
          <p>먼저 홈 페이지에서 후보자 PDF 리포트를 업로드하고 분석을 완료해주세요.</p>
          <a href="index.html" class="btn btn-primary">🏠 홈으로 이동</a>
        </div>`;
    }
    return null;
  }
  return data;
}

// ── 점수 색상 ──
function scoreColor(score) {
  if (score >= 85) return '#16a34a';
  if (score >= 75) return '#2563eb';
  if (score >= 65) return '#d97706';
  return '#dc2626';
}
function scoreBgClass(score) {
  if (score >= 85) return 'score-excellent';
  if (score >= 75) return 'score-good';
  if (score >= 65) return 'score-average';
  return 'score-low';
}

// ── 순위 태그 ──
function rankTag(rank) {
  const cls = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
  return `<span class="rank-tag ${cls}">${rank}</span>`;
}

// ── 점수 → 텍스트 등급 ──
function scoreGrade(score) {
  if (score >= 880) return { label: 'S', color: '#7c3aed', desc: '최우수' };
  if (score >= 840) return { label: 'A', color: '#16a34a', desc: '우수' };
  if (score >= 760) return { label: 'B', color: '#2563eb', desc: '양호' };
  if (score >= 680) return { label: 'C', color: '#d97706', desc: '보통' };
  return { label: 'D', color: '#dc2626', desc: '미흡' };
}

// ── 점수 숫자 포맷 ──
function fmtScore(v) { return v == null ? '-' : Math.round(v); }

// ── 종합 설명 박스 ──
function summaryBox(title, paras) {
  return `<div class="summary-section">
    <div class="summary-section-title">📝 ${title}</div>
    ${paras.map(p => `<p>${p}</p>`).join('')}
  </div>`;
}

// ── 항목별 순위 계산 ──
function calcMetricRankings(candidates) {
  const rankings = {};
  METRICS.forEach(m => {
    const sorted = [...candidates]
      .map((c,i) => ({ idx: i, name: c.name, score: c.metrics?.[m] ?? 0 }))
      .sort((a,b) => b.score - a.score);
    sorted.forEach((item, rank) => { rankings[`${item.idx}_${m}`] = rank + 1; });
  });
  return rankings;
}

// ── 종합 순위 계산 ──
function calcTotalRankings(candidates) {
  const sorted = [...candidates]
    .map((c,i) => ({ idx: i, score: c.total_score ?? 0 }))
    .sort((a,b) => b.score - a.score);
  const ranks = {};
  sorted.forEach((item, rank) => { ranks[item.idx] = rank + 1; });
  return ranks;
}

// ── 헤더 날짜 업데이트 ──
function updateHeaderDate() {
  const el = document.getElementById('header-date');
  if (!el) return;
  const data = getData();
  if (data) {
    el.textContent = `${data.district || ''} · 분석일: ${data.analysis_date || '-'}`;
  }
}

// ── 푸터 렌더링 ──
function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo">Election<span class="logo-analysis">Analysis</span><span class="logo-report">Report</span><span class="logo-ai">AI</span></div>
          <div class="footer-tagline">
            선거 후보자 비교 분석 플랫폼<br>
            AI 기반 전략 리포트 · 가격 산정 · 당선 전략 설계
          </div>
        </div>
        <div class="footer-contact">
          <div class="footer-contact-name">심재우 대표</div>
          <div class="footer-contact-items">
            <div class="footer-contact-item">
              <span>010-2397-5734</span>
              <div class="footer-contact-icon">📞</div>
            </div>
            <div class="footer-contact-item">
              <a href="mailto:jaiwshim@gmail.com">jaiwshim@gmail.com</a>
              <div class="footer-contact-icon">✉️</div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-links">
        <a href="diagram_workflow.html" class="footer-link-btn">📊 분석 구조도</a>
        <a href="report_pricing.html" class="footer-link-btn">💰 가격 산정</a>
        <a href="report_guide.html" class="footer-link-btn">📋 안내자료</a>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <span>© 2026 ElectionAI · 무단 복제 및 배포 금지</span>
        <span><strong>ElectionAI Pricing Engine v1.0</strong> · Powered by Claude AI</span>
      </div>
    </div>
  `;
  document.body.appendChild(footer);
}

// ── 초기화 ──
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  updateHeaderDate();
  renderFooter();
});
