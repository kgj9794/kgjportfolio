const GOOGLE_SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbxBLP_PnF0CfpNmud-9cmhadguTuJeaaederTAkY9eGvwB_q6pb_scjKHp2cdPNlRKd/exec";

function showLoading(text = "데이터를 불러오는 중...") {
  const loader = document.getElementById("globalLoader");
  const loaderText = document.getElementById("loaderText");
  if (loaderText) loaderText.innerText = text;
  if (loader) loader.classList.add("show");
}

function hideLoading() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.classList.remove("show");
}

// 1. 프로필 렌더링
function renderProfile(profile) {
  const container = document.getElementById("profileContent");
  if (!profile || !container) return;

  const defaultImg = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop";

  container.innerHTML = `
    <div class="profile-img-wrap">
      <img src="${profile.profile_image || defaultImg}" alt="${profile.name || '프로필'}">
    </div>
    <div class="profile-info">
      <div class="profile-header-row">
        <h1 class="profile-name">${profile.name || '이름 미입력'}</h1>
        <div class="status-badge">
          <span class="status-dot"></span>
          <span>Open for Work</span>
        </div>
      </div>
      <p class="profile-bio">${profile.bio || '사용자 경험과 엔지니어링의 완벽한 조화를 추구하는 개발자입니다.'}</p>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-icon"><i class="fa-solid fa-venus-mars"></i></div>
          <span class="info-label">성별</span>
          <span class="info-value">${profile.gender || '-'}</span>
        </div>
        <div class="info-item">
          <div class="info-icon"><i class="fa-solid fa-droplet"></i></div>
          <span class="info-label">혈액형</span>
          <span class="info-value">${profile.blood_type || '-'}</span>
        </div>
        <div class="info-item">
          <div class="info-icon"><i class="fa-solid fa-graduation-cap"></i></div>
          <span class="info-label">학력</span>
          <span class="info-value">${profile.education || '-'}</span>
        </div>
        <div class="info-item">
          <div class="info-icon"><i class="fa-solid fa-location-dot"></i></div>
          <span class="info-label">거주지</span>
          <span class="info-value">${profile.residence || '-'}</span>
        </div>
        <div class="info-item" style="grid-column: 1 / -1;">
          <div class="info-icon"><i class="fa-solid fa-heart"></i></div>
          <span class="info-label">취미 및 관심사</span>
          <span class="info-value">${profile.hobby || '-'}</span>
        </div>
      </div>
    </div>
  `;
}

// 2. 스킬 & 자격증 렌더링
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

  container.innerHTML = Object.keys(grouped).map(cat => {
    const items = grouped[cat];
    const displayTitle = categoryTitles[cat] || cat;
    const catIcon = categoryIcons[cat] || 'fa-solid fa-check';
    const isCert = cat.toLowerCase().includes('cert') || cat.includes('자격');

    return `
      <div class="skill-category-block">
        <h3 class="skill-category-title">
          <i class="${catIcon}"></i> ${displayTitle} (${items.length})
        </h3>
        <div class="skills-grid">
          ${items.map(item => {
            const isImg = item.icon && (item.icon.startsWith('http') || item.icon.startsWith('data:image'));
            const iconHTML = isImg 
              ? `<img src="${item.icon}" alt="${item.name}">` 
              : `<i class="${item.icon || (isCert ? 'fa-solid fa-award' : 'fa-solid fa-code')}"></i>`;

            return `
              <div class="skill-card ${isCert ? 'cert-card' : ''}">
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

// 3. 이수 교육 자료 렌더링
function renderTrainings(trainings) {
  const container = document.getElementById("trainingContent");
  if (!container) return;

  if (!trainings || trainings.length === 0) {
    container.innerHTML = `<p style="color: var(--text-light); text-align: center; grid-column: 1 / -1; padding: 30px;">등록된 이수 교육 내역이 없습니다.</p>`;
    return;
  }

  container.innerHTML = trainings.map(t => {
    const title = t.title || '교육 과정명 미입력';
    const inst = t.institution || '교육 기관 미입력';
    const period = t.period || '-';
    const badge = t.badge_text || '수료';
    const desc = t.description || '';
    const fileUrl = t.file_url || '';

    return `
      <div class="training-card">
        <div class="training-top-row">
          <span class="training-inst-badge"><i class="fa-solid fa-building-columns"></i> ${inst}</span>
          ${badge ? `<span class="training-status-tag">${badge}</span>` : ''}
        </div>
        <h3 class="training-title">${title}</h3>
        <div class="training-period"><i class="fa-regular fa-calendar-check"></i> ${period}</div>
        <p class="training-desc">${desc}</p>
        ${fileUrl ? `
          <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="training-btn">
            <i class="fa-solid fa-file-arrow-down"></i> 수료증 / 이수 자료 확인
          </a>
        ` : ''}
      </div>
    `;
  }).join("");
}

// 4. 상단 메뉴 드롭다운 렌더링
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
        <a href="#${compId}" class="dropdown-company-link nav-target-link">
          ${compLogo ? `<img src="${compLogo}" alt="logo" style="width:16px;height:16px;object-fit:contain;border-radius:3px;">` : `<i class="fa-solid fa-building"></i>`}
          <span>${compName}</span>
        </a>
        ${projects.length > 0 ? `
          <div class="dropdown-project-list">
            ${projects.map(proj => {
              const projName = proj.project_name || `프로젝트 #${proj.id}`;
              const projId = `project-${proj.id}`;
              return `
                <a href="#${projId}" class="dropdown-project-link nav-target-link">
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

  const targetLinks = dropdownMenu.querySelectorAll(".nav-target-link");
  targetLinks.forEach(link => {
    link.addEventListener("click", () => {
      document.getElementById("navDropdown").classList.remove("open");
      const navMenu = document.getElementById("navMenu");
      if (navMenu) navMenu.classList.remove("open");
    });
  });
}

// 5. 회사 및 프로젝트 렌더링
function renderExperiencesWithProjects(experiences) {
  const container = document.getElementById("experienceContent");
  if (!container) return;

  if (!experiences || experiences.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 40px;">등록된 회사 및 프로젝트 이력이 없습니다.</p>`;
    return;
  }

  const defaultCompImg = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop";
  const defaultProjImg = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop";

  container.innerHTML = experiences.map(exp => {
    const compName = exp.company_name || '회사명 미입력';
    const compLogo = exp.logo_url || '';
    const compPeriod = exp.period || '-';
    const compRole = exp.role || '직무 미입력';
    const compDesc = exp.description || '';
    const compImg = exp.image_url || defaultCompImg;
    const projects = exp.projects || [];
    const compElementId = `company-${exp.id}`;

    return `
      <div class="company-block" id="${compElementId}">
        <div class="company-header-card">
          <div class="comp-img-wrap">
            <img src="${compImg}" alt="${compName}">
          </div>
          <div class="comp-info">
            <div class="comp-title-row">
              <div class="comp-title-left">
                ${compLogo ? `<img src="${compLogo}" alt="${compName} 로고" class="comp-logo-img">` : ''}
                <h3 class="comp-name">${compName}</h3>
              </div>
              <span class="comp-period"><i class="fa-regular fa-calendar"></i> ${compPeriod}</span>
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
              ${projects.map(proj => {
                const projName = proj.project_name || '프로젝트명 미입력';
                const projPeriod = proj.period || '-';
                const projDesc = proj.description || '';
                const projImg = proj.image_url || defaultProjImg;
                const refLink = proj.ref_link || '';
                const projElementId = `project-${proj.id}`;

                return `
                  <div class="project-card" id="${projElementId}">
                    <div class="project-img-wrap">
                      <img src="${projImg}" alt="${projName}">
                    </div>
                    <div class="project-body">
                      <span class="project-period"><i class="fa-regular fa-clock"></i> ${projPeriod}</span>
                      <h4 class="project-name">${projName}</h4>
                      <p class="project-desc">${projDesc}</p>
                      ${refLink ? `
                        <a href="${refLink}" target="_blank" rel="noopener noreferrer" class="project-btn">
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

// 6. Fetch API
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

// 7. 이벤트 리스너
document.addEventListener("DOMContentLoaded", () => {
  fetchPortfolioData();

  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");
  const navDropdown = document.getElementById("navDropdown");
  const navDropdownBtn = document.getElementById("navDropdownBtn");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }

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

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (navMenu) navMenu.classList.remove("open");
      if (navDropdown) navDropdown.classList.remove("open");
    });
  });

  const sections = document.querySelectorAll(".section");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { rootMargin: "-20% 0px -70% 0px" });

  sections.forEach(section => observer.observe(section));
});
