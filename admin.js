const GOOGLE_SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbxBLP_PnF0CfpNmud-9cmhadguTuJeaaederTAkY9eGvwB_q6pb_scjKHp2cdPNlRKd/exec";
const AUTH_KEY = "portfolio_admin_pw";

const loginOverlay = document.getElementById("loginOverlay");
const adminDashboard = document.getElementById("adminDashboard");
const loginForm = document.getElementById("loginForm");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const logoutBtn = document.getElementById("logoutBtn");
const companySelect = document.getElementById("companySelect");

const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

function showLoading(text = "처리 중입니다...") {
  const loader = document.getElementById("globalLoader");
  const loaderText = document.getElementById("loaderText");
  if (loaderText) loaderText.innerText = text;
  if (loader) loader.classList.add("show");
}

function hideLoading() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.classList.remove("show");
}

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    tabPanels.forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    const targetTab = btn.getAttribute("data-tab");
    const targetPanel = document.getElementById(targetTab);
    if (targetPanel) targetPanel.classList.add("active");

    if (targetTab === "proj-tab") {
      loadInitialData();
    }
  });
});

function showToast(message, isSuccess = true) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.className = `toast ${isSuccess ? 'success' : 'error'}`;
  toast.innerText = message;
  setTimeout(() => {
    toast.className = "toast";
  }, 3500);
}

async function verifyLogin(password) {
  const cleanPassword = (password || '').trim();
  if (!cleanPassword) {
    alert("비밀번호를 입력해주세요.");
    return;
  }

  showLoading("관리자 인증 확인 중...");

  try {
    const res = await fetch(GOOGLE_SCRIPT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type: "login", password: cleanPassword })
    });
    const result = await res.json();

    if (result.status === "success") {
      sessionStorage.setItem(AUTH_KEY, cleanPassword);
      loginOverlay.style.display = "none";
      adminDashboard.style.display = "block";
      await loadInitialData();
    } else {
      sessionStorage.removeItem(AUTH_KEY);
      alert("로그인 실패: " + result.message);
    }
  } catch (err) {
    sessionStorage.removeItem(AUTH_KEY);
    alert("서버 연결 실패: " + err.message);
  } finally {
    hideLoading();
  }
}

function lockDashboard() {
  sessionStorage.removeItem(AUTH_KEY);
  loginOverlay.style.display = "flex";
  adminDashboard.style.display = "none";
  adminPasswordInput.value = "";
}

async function loadInitialData() {
  showLoading("최신 데이터를 동기화하는 중...");
  try {
    const res = await fetch(`${GOOGLE_SCRIPT_API_URL}?action=get_portfolio&_t=${Date.now()}`);
    if (!res.ok) throw new Error("데이터 조회 실패");
    const data = await res.json();

    if (data.profile) {
      const profileForm = document.getElementById("profileForm");
      if (profileForm) {
        Object.keys(data.profile).forEach(key => {
          if (profileForm.elements[key]) {
            profileForm.elements[key].value = data.profile[key];
          }
        });
      }
    }

    if (companySelect) {
      companySelect.innerHTML = `<option value="">소속 회사를 선택하세요</option>`;

      if (data.experiences && data.experiences.length > 0) {
        data.experiences.forEach(exp => {
          const compName = exp.company_name || `회사 ID #${exp.id}`;
          const compId = String(exp.id).trim();

          const opt = document.createElement("option");
          opt.value = compId;
          opt.textContent = `${compName} (ID: ${compId})`;
          companySelect.appendChild(opt);
        });
      } else {
        const emptyOpt = document.createElement("option");
        emptyOpt.value = "";
        emptyOpt.textContent = "등록된 회사가 없습니다. [새 회사 추가] 탭에서 먼저 등록하세요.";
        companySelect.appendChild(emptyOpt);
      }
    }
  } catch (err) {
    console.warn("데이터 로드 실패:", err);
  } finally {
    hideLoading();
  }
}

async function submitData(type, payload, formElement, submitBtn) {
  const password = sessionStorage.getItem(AUTH_KEY) || "admin1234";

  showLoading("스프레드시트에 저장 중입니다...");

  try {
    const response = await fetch(GOOGLE_SCRIPT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        type: type,
        password: password,
        payload: payload
      })
    });

    const result = await response.json();

    if (result.status === "success") {
      showToast(result.message || "성공적으로 저장되었습니다.", true);
      
      if (type !== 'profile') {
        formElement.reset();
        await loadInitialData();
      }
    } else {
      showToast("저장 실패: " + result.message, false);
      if (result.message && result.message.includes("비밀번호")) {
        lockDashboard();
      }
    }
  } catch (err) {
    showToast("전송 중 오류 발생: " + err.message, false);
  } finally {
    hideLoading();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedPassword = sessionStorage.getItem(AUTH_KEY);
  if (savedPassword) {
    verifyLogin(savedPassword);
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    verifyLogin(adminPasswordInput.value);
  });

  logoutBtn.addEventListener("click", lockDashboard);

  // 1. 프로필 수정
  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    submitData("profile", payload, e.target, e.target.querySelector(".submit-btn"));
  });

  // 2. 스킬 등록
  document.getElementById("skillForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    submitData("skills", payload, e.target, e.target.querySelector(".submit-btn"));
  });

  // 3. 이수 교육 등록
  document.getElementById("trainingForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    submitData("trainings", payload, e.target, e.target.querySelector(".submit-btn"));
  });

  // 4. 회사 등록
  document.getElementById("experienceForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    submitData("experience", payload, e.target, e.target.querySelector(".submit-btn"));
  });

  // 5. 프로젝트 등록
  document.getElementById("projectForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    submitData("projects", payload, e.target, e.target.querySelector(".submit-btn"));
  });
});
