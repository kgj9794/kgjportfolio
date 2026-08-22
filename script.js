const GOOGLE_SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbxBLP_PnF0CfpNmud-9cmhadguTuJeaaederTAkY9eGvwB_q6pb_scjKHp2cdPNlRKd/exec";

// ========================================================
// 1. 로딩 중 스크롤/터치/드래그 제어
// ========================================================
let isLoadingActive = true;

function preventDefaultScroll(e) {
  if (isLoadingActive) {
    e.preventDefault();
    return false;
  }
}

function preventScrollKeys(e) {
  if (!isLoadingActive) return;
  const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
  if (keys.includes(e.keyCode)) {
    e.preventDefault();
    return false;
  }
}

window.addEventListener("wheel", preventDefaultScroll, { passive: false });
window.addEventListener("touchmove", preventDefaultScroll, { passive: false });
window.addEventListener("keydown", preventScrollKeys, false);

window.addEventListener("dragstart", (e) => {
  if (isLoadingActive || e.target.tagName === "IMG") {
    e.preventDefault();
    return false;
  }
}, { passive: false });

window.addEventListener("selectstart", (e) => {
  if (isLoadingActive) {
    e.preventDefault();
    return false;
  }
}, { passive: false });

// ========================================================
// 2. 시간 기반 자동 다크모드 및 수동 전환
// ========================================================
function initThemeMode() {
  const currentHour = new Date().getHours();
  const isNight = currentHour >= 18 || currentHour < 6;
  const savedPref = localStorage.getItem("user_theme_pref");

  if (savedPref) {
    if (savedPref === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  } else {
    if (isNight) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  updateToggleIcon();
}

function updateToggleIcon() {
  const icon = document.getElementById("themeToggleIcon");
  if (!icon) return;

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    icon.className = "fa-solid fa-sun";
  } else {
    icon.className = "fa-solid fa-moon";
  }
}

initThemeMode();

// ========================================================
// 3. 로딩 화면 & 페이드 전환
// ========================================================
function showLoading(text = "데이터를 불러오는 중...") {
  isLoadingActive = true;
  document.documentElement.classList.add("loading-locked");
  document.body.classList.add("loading-locked");
  window.scrollTo(0, 0);

  const loader = document.getElementById("globalLoader");
  const loaderText = document.getElementById("loaderText");
  if (loaderText) loaderText.innerText = text;
  if (loader) loader.classList.add("show");
}

function hideLoading() {
  const loader = document.getElementById("globalLoader");
  const mainContainer = document.getElementById("mainContainer");
  
  if (loader) {
    loader.classList.remove("show");
  }

  setTimeout(() => {
    isLoadingActive = false;
    document.documentElement.classList.remove("loading-locked");
    document.body.classList.remove("loading-locked");
    window.scrollTo(0, 0);

    if (mainContainer) {
      mainContainer.classList.add("loaded");
    }

    initScrollSpringReveal();
    handleTopThemeButtonVisibility();
  }, 300);
}

// ========================================================
// 4. 스크롤 최상단 테마 버튼 가시성
// ========================================================
function handleTopThemeButtonVisibility() {
  const btn = document.getElementById("themeToggleBtn");
  if (!btn || isLoadingActive) return;

  if (window.scrollY <= 40) {
    btn.classList.add("visible");
  } else {
    btn.classList.remove("visible");
  }
}

window.addEventListener("scroll", handleTopThemeButtonVisibility, { passive: true });

// ========================================================
// 5. 스크롤 슬라이드 옵저버
// ========================================================
let scrollRevealObserver;

function initScrollSpringReveal() {
  if (scrollRevealObserver) {
    scrollRevealObserver.disconnect();
  }

  const revealElements = document.querySelectorAll(".reveal-spring-left, .reveal-spring-right");
  
  scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
      }
    });
  }, {
    root: null,
    threshold: 0.08,
    rootMargin: "0px 0px -30px 0px"
  });

  revealElements.forEach(el => scrollRevealObserver.observe(el));
}

// ========================================================
// 6. 데이터 렌더링 함수들
// ========================================================
function renderProfile(profile) {
  const container = document.getElementById("profileContent");
  if (!profile || !container) return;

  const defaultImg = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop";

  container.innerHTML = `
    <div class="profile-img-wrap spring-hover">
      <img src="${profile.profile_image || defaultImg}" alt="${profile.name || '프로필'}" draggable="false">
    </div>
    <div class="profile-info">
      <div class="profile-header-row">
        <h1 class="profile-name">${profile.name || '이름 미입력'}</h1>
        <div class="status-badge spring-hover">
          <span class="status-dot"></span>
          <span>Open for Work</span>
        </div>
      </div>
      <p class="profile-bio">${profile.bio || '사용자 경험과 엔지니어링의 완벽한 조화를 추구하는 개발자입니다.'}</p>
      
      <div class="info-grid">
        <div class="info-item spring-hover">
          <div class="info-icon"><i class="fa-solid fa-venus-mars"></i></div>
          <span class="info-label">성별</span>
          <span class="info-value">${profile.gender || '-'}</span>
        </div>
        <div class="info-item spring-hover">
          <div class="info-icon"><i class="fa-solid fa-droplet"></i></div>
          <span class="info-label">혈액형</span>
          <span class="info-value">${profile.blood_type || '-'}</span>
        </div>
        <div class="info-item spring-hover">
          <div class="info-icon"><i class="fa-solid fa-graduation-cap"></i></div>
          <span class="info-label">학력</span>
          <span class="info-value">${profile.education || '-'}</span>
        </div>
        <div class="info-item spring-hover">
          <div class="info-icon"><i class="fa-solid fa-location-dot"></i></div>
          <span class="info-label">거주지</span>
          <span class="info-value">${profile.residence || '-'}</span>
        </div>
        <div class="info-item spring-hover" style="grid-column: 1 / -1;">
          <div class="info-icon"><i class="fa-solid fa-heart"></i></div>
          <span class="info-label">취미 및 관심사</span>
          <span class="info-value">${profile.hobby || '-'}</span>
        </div>
      </div>
    </div>
  `;
}

function renderSkills(skills) {
  const container = document.getElementById("skillsContent");
  if (!container) return;

  if (!skills || skills.length === 0) {
    container.innerHTML = `<p style="color: var(--text-light); text-align: center; padding: 30px;">등록된 기술 스택 및 자격증이 없습니다.</p>`;
    return;
  }

  const grouped = {};
  skills.forEach(s => {
    const cat = s.category || 'Etc';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  const categoryTitles = {
    'Language': 'Programming Languages',
    'Framework': 'Frameworks & Libraries',
    'DevOps': 'DevOps & Tools',
    'Certificate': 'Certifications & Awards',
    'Etc': 'Other Skills'
  };

  const categoryIcons = {
    'Language': 'fa-solid fa-code',
    'Framework': 'fa-solid fa-layer-group',
    'DevOps': 'fa-solid fa-server',
    'Certificate': 'fa-solid fa-award',
    'Etc': 'fa-solid fa-circle-nodes'
  };

  let globalSkillIndex = 0;

  container.innerHTML = Object.keys(grouped).map(cat => {
    const items = grouped[cat];
    const displayTitle = categoryTitles[cat] || cat;
    const catIcon = categoryIcons[cat] || 'fa-solid fa-check';
    const isCert = cat.toLowerCase().includes('cert') || cat.includes('자격');

    return `
      <div class="skill-category-block">
        <h3 class="skill-category-title reveal-spring-left">
          <i class="${catIcon}"></i> ${displayTitle} (${items.length})
        </h3>
        <div class="skills-grid">
          ${items.map(item => {
            const isImg = item.icon && (item.icon.startsWith('http') || item.icon.startsWith('data:image'));
            const iconHTML = isImg 
              ? `<img src="${item.icon}" alt="${item.name}">` 
              : `<i class="${item.icon || (isCert ? 'fa-solid fa-award' : 'fa-solid fa-code')}"></i>`;

            const motionDirection = (globalSkillIndex++ % 2 === 0) ? 'reveal-spring-left' : 'reveal-spring-right';

            return `
              <div class="skill-card spring-hover ${isCert ? 'cert-card' : ''} ${motionDirection}">
                <div class="skill-icon-box">
                  ${iconHTML}
                </div>
                <div class="skill-details">
                  <div class="skill-header-row">
                    <span class="skill-name">${item.name}</span>
                    <span class="skill-tag">${item.category}</span>
                  </div>
                  <p class="skill-desc">${item.description || ''}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderTrainings(trainings) {
  const container = document.getElementById("trainingContent");
  if (!container) return;

  if (!trainings || trainings.length === 0) {
    container.innerHTML = `<p style="color: var(--text-light); text-align: center; grid-column: 1 / -1; padding: 30px;">등록된 이수 교육 내역이 없습니다.</p>`;
    return;
  }

  container.innerHTML = trainings.map((t, idx) => {
    const title = t.title || '교육 과정명 미입력';
    const inst = t.institution || '교육 기관 미입력';
    const period = t.period || '-';
    const badge = t.badge_text || '수료';
    const desc = t.description || '';
    const fileUrl = t.file_url || '';
    const motionDirection = (idx % 2 === 0) ? 'reveal-spring-left' : 'reveal-spring-right';

    return `
      <div class="training-card spring-hover ${motionDirection}">
        <div class="training-top-row">
          <span class="training-inst-badge"><i class="fa-solid fa-building-columns"></i> ${inst}</span>
          ${badge ? `<span class="training-status-tag">${badge}</span>` : ''}
        </div>
        <h3 class="training-title">${title}</h3>
        <div class="training-period"><i class="fa-regular fa-calendar-check"></i> ${period}</div>
        <p class="training-desc">${desc}</p>
        ${fileUrl ? `
          <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="training-btn spring-hover">
            <i class="fa-solid fa-file-arrow-down"></i> 수료증 / 이수 자료 확인
          </a>
        ` : ''}
      </div>
    `;
  }).join("");
}

function renderNavDropdown(experiences) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (!dropdownMenu) return;

  if (!experiences || experiences.length === 0) {
    dropdownMenu.innerHTML = `<div class="dropdown-empty">등록된 회사/프로젝트가 없습니다.</div>`;
    return;
  }

  dropdownMenu.innerHTML = experiences.map(exp => {
    const compName = exp.company_name || `회사 #${exp.id}`;
    const compId = `company-${exp.id}`;
    const compLogo = exp.logo_url;
    const projects = exp.projects || [];

    return `
      <div class="dropdown-group">
        <a href="#${compId}" class="dropdown-company-link nav-target-link spring-hover">
          ${compLogo ? `<img src="${compLogo}" alt="logo" style="width:15px;height:15px;object-fit:contain;border-radius:3px;" draggable="false">` : `<i class="fa-solid fa-building"></i>`}
          <span>${compName}</span>
        </a>
        ${projects.length > 0 ? `
          <div class="dropdown-project-list">
            ${projects.map(proj => {
              const projName = proj.project_name || `프로젝트 #${proj.id}`;
              const projId = `project-${proj.id}`;
              return `
                <a href="#${projId}" class="dropdown-project-link nav-target-link spring-hover">
                  <i class="fa-solid fa-arrow-turn-down-right"></i>
                  <span>${projName}</span>
                </a>
              `;
            }).join("")}
          </div>
        ` : ''}
      </div>
    `;
  }).join("");

  // 메뉴 클릭 시 모바일 드로어 닫기
  const targetLinks = dropdownMenu.querySelectorAll(".nav-target-link");
  targetLinks.forEach(link => {
    link.addEventListener("click", closeMobileMenu);
  });
}

function renderExperiencesWithProjects(experiences) {
  const container = document.getElementById("experienceContent");
  if (!container) return;

  if (!experiences || experiences.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 40px;">등록된 회사 및 프로젝트 이력이 없습니다.</p>`;
    return;
  }

  const defaultCompImg = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop";
  const defaultProjImg = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop";

  container.innerHTML = experiences.map((exp, compIdx) => {
    const compName = exp.company_name || '회사명 미입력';
    const compLogo = exp.logo_url || '';
    const compPeriod = exp.period || '-';
    const compRole = exp.role || '직무 미입력';
    const compDesc = exp.description || '';
    const compImg = exp.image_url || defaultCompImg;
    const projects = exp.projects || [];
    const compElementId = `company-${exp.id}`;
    const compMotionDirection = (compIdx % 2 === 0) ? 'reveal-spring-left' : 'reveal-spring-right';

    return `
      <div class="company-block spring-hover ${compMotionDirection}" id="${compElementId}">
        <div class="company-header-card">
          <div class="comp-img-wrap spring-hover">
            <img src="${compImg}" alt="${compName}" draggable="false">
          </div>
          <div class="comp-info">
            <div class="comp-title-row">
              <div class="comp-title-left">
                ${compLogo ? `<img src="${compLogo}" alt="${compName} 로고" class="comp-logo-img spring-hover" draggable="false">` : ''}
                <h3 class="comp-name">${compName}</h3>
              </div>
              <span class="comp-period spring-hover"><i class="fa-regular fa-calendar"></i> ${compPeriod}</span>
            </div>
            <div class="comp-role"><i class="fa-solid fa-id-badge"></i> ${compRole}</div>
            <p class="comp-desc">${compDesc}</p>
          </div>
        </div>

        <div class="nested-projects-wrapper">
          <div class="nested-projects-title">
            <i class="fa-solid fa-code-commit"></i> 수행 프로젝트 (${projects.length})
          </div>
          
          ${projects.length > 0 ? `
            <div class="project-grid">
              ${projects.map((proj, projIdx) => {
                const projName = proj.project_name || '프로젝트명 미입력';
                const projPeriod = proj.period || '-';
                const projDesc = proj.description || '';
                const projImg = proj.image_url || defaultProjImg;
                const refLink = proj.ref_link || '';
                const projElementId = `project-${proj.id}`;
                const projMotionDirection = (projIdx % 2 === 0) ? 'reveal-spring-left' : 'reveal-spring-right';

                return `
                  <div class="project-card spring-hover ${projMotionDirection}" id="${projElementId}">
                    <div class="project-img-wrap">
                      <img src="${projImg}" alt="${projName}" draggable="false">
                    </div>
                    <div class="project-body">
                      <span class="project-period"><i class="fa-regular fa-clock"></i> ${projPeriod}</span>
                      <h4 class="project-name">${projName}</h4>
                      <p class="project-desc">${projDesc}</p>
                      ${refLink ? `
                        <a href="${refLink}" target="_blank" rel="noopener noreferrer" class="project-btn spring-hover">
                          <i class="fa-solid fa-arrow-up-right-from-square"></i> 참고 자료 / 배포 링크
                        </a>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          ` : `
            <p class="no-projects">등록된 프로젝트가 없습니다.</p>
          `}
        </div>
      </div>
    `;
  }).join("");
}

// ========================================================
// 7. 모바일 메뉴 컨트롤
// ========================================================
function closeMobileMenu() {
  const navMenu = document.getElementById("navMenu");
  const navDropdown = document.getElementById("navDropdown");
  const navOverlay = document.getElementById("navOverlay");
  const hamburgerIcon = document.getElementById("hamburgerIcon");

  if (navMenu) navMenu.classList.remove("open");
  if (navDropdown) navDropdown.classList.remove("open");
  if (navOverlay) navOverlay.classList.remove("active");
  if (hamburgerIcon) {
    hamburgerIcon.className = "fa-solid fa-bars-staggered";
  }
}

// ========================================================
// 8. Fetch & 이벤트 초기화
// ========================================================
async function fetchPortfolioData() {
  showLoading("포트폴리오 데이터를 불러오는 중...");
  try {
    const res = await fetch(`${GOOGLE_SCRIPT_API_URL}?action=get_portfolio&_t=${Date.now()}`);
    if (!res.ok) throw new Error("서버 응답 오류");
    const data = await res.json();

    renderProfile(data.profile);
    renderSkills(data.skills);
    renderTrainings(data.trainings);
    renderExperiencesWithProjects(data.experiences);
    renderNavDropdown(data.experiences);
  } catch (err) {
    console.error("데이터 로드 실패:", err);
  } finally {
    hideLoading();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchPortfolioData();

  // 테마 토글 버튼
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("user_theme_pref", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("user_theme_pref", "dark");
      }
      updateToggleIcon();
    });
  }

  // 모바일 햄버거 토글
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");
  const navOverlay = document.getElementById("navOverlay");
  const hamburgerIcon = document.getElementById("hamburgerIcon");
  const navDropdown = document.getElementById("navDropdown");
  const navDropdownBtn = document.getElementById("navDropdownBtn");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      if (navOverlay) navOverlay.classList.toggle("active", isOpen);
      if (hamburgerIcon) {
        hamburgerIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars-staggered";
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", closeMobileMenu);
  }

  // 상단 Career & Projects 드롭다운
  if (navDropdownBtn && navDropdown) {
    navDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navDropdown.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!navDropdown.contains(e.target)) {
        navDropdown.classList.remove("open");
      }
    });
  }

  // 일반 네비 링크 클릭 시 모바일 메뉴 닫기
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", closeMobileMenu);
  });

  // 스크롤 감지 메뉴 하이라이트
  const sections = document.querySelectorAll(".section");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute("id");

        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
        });

        if (navDropdownBtn) {
          navDropdownBtn.classList.toggle("active", currentId === "experience");
        }
      }
    });
  }, { rootMargin: "-25% 0px -65% 0px", threshold: 0.08 });

  sections.forEach(section => observer.observe(section));
});
