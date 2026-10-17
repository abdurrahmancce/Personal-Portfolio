(function () {
  "use strict";

  /* 
     Utility: run a function once the DOM is ready
      */
  function onReady(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  onReady(() => {
    initThemeToggle();
    initMobileNav();
    initStickyHeaderAndScrollSpy();
    initScrollProgress();
    initScrollReveal();
    initTypingEffect();
    initSmoothAnchors();
    initProjectFiltering();
    initProjectModal();
    initContactForm();
    initBackToTop();
    initFooterYear();
    initGitHubStats();
    initContributionHeatmap();
    initHeroGlow();
    initSkillDots();
    initCardTilt();
  });

  /* 
     Hero cursor-follow glow (subtle radial spotlight)
      */
  function initHeroGlow() {
    const hero = document.getElementById("home");
    const glow = document.getElementById("heroGlow");
    if (!hero || !glow || prefersReducedMotion) return;

    hero.addEventListener("pointermove", (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      glow.style.setProperty("--glow-x", x + "%");
      glow.style.setProperty("--glow-y", y + "%");
    });
  }

  /* 
     Skill proficiency dots — derived from each skill's tag
     class rather than duplicated in markup, so the level
     lives in one place (the tag label + class).
      */
  function initSkillDots() {
    const levelMap = {
      "tag-intermediate": 3,
      "tag-familiar": 2,
      "tag-learning": 2,
      "tag-exploring": 1,
    };

    document.querySelectorAll(".skill-list li").forEach((li) => {
      const tag = li.querySelector(".tag");
      const nameEl = li.querySelector("span:first-child");
      if (!tag || !nameEl) return;

      const levelClass = Object.keys(levelMap).find((cls) => tag.classList.contains(cls));
      const filled = levelMap[levelClass] || 1;

      const dotsWrap = document.createElement("span");
      dotsWrap.className = "skill-dots";
      dotsWrap.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        if (i < filled) dot.classList.add("filled");
        dotsWrap.appendChild(dot);
      }
      nameEl.prepend(dotsWrap);
    });
  }

  /* 
     Subtle 3D tilt on project cards, following the cursor.
     Disabled for touch devices and reduced-motion users.
      */
  function initCardTilt() {
    if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

    document.querySelectorAll(".project-card").forEach((card) => {
      card.style.transformStyle = "preserve-3d";

      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          `translateY(-6px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* 
     Theme toggle (dark default, persisted in localStorage)
      */
  function initThemeToggle() {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    const STORAGE_KEY = "portfolio-theme";
    const saved = localStorage.getItem(STORAGE_KEY);

    // Dark mode is the default; only switch to light if explicitly saved.
    if (saved === "light") {
      document.body.classList.add("light-theme");
      toggle.setAttribute("aria-pressed", "true");
      toggle.setAttribute("aria-label", "Switch to dark theme");
    }

    toggle.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-theme");
      localStorage.setItem(STORAGE_KEY, isLight ? "light" : "dark");
      toggle.setAttribute("aria-pressed", String(isLight));
      toggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark theme" : "Switch to light theme"
      );
    });
  }

  /* 
     Mobile hamburger navigation
      */
  function initMobileNav() {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");
    if (!hamburger || !navLinks) return;

    function closeMenu() {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", "Open menu");
    }

    hamburger.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
      hamburger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    // Close the mobile menu whenever a link is chosen.
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close on Escape for keyboard users.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* 
     Sticky header background + scroll-spy for active nav link
      */
  function initStickyHeaderAndScrollSpy() {
    const header = document.getElementById("siteHeader");
    const navLinkEls = Array.from(document.querySelectorAll(".nav-link"));
    const sections = navLinkEls
      .map((link) => document.getElementById(link.dataset.section))
      .filter(Boolean);

    if (!header) return;

    function updateHeader() {
      header.classList.toggle("scrolled", window.scrollY > 12);
    }

    function updateActiveLink() {
      const scrollPos = window.scrollY + 120; // offset for nav height + buffer
      let currentId = sections[0] ? sections[0].id : null;

      sections.forEach((section) => {
        if (section.offsetTop <= scrollPos) {
          currentId = section.id;
        }
      });

      navLinkEls.forEach((link) => {
        link.classList.toggle("active", link.dataset.section === currentId);
      });
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateHeader();
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateHeader();
    updateActiveLink();

    // Scroll cue on hero scrolls to About.
    const scrollCue = document.getElementById("scrollCue");
    if (scrollCue) {
      scrollCue.addEventListener("click", () => {
        const about = document.getElementById("about");
        if (about) about.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      });
    }
  }

  /* 
     Scroll progress bar across the top of the viewport
      */
  function initScrollProgress() {
    const bar = document.getElementById("scrollProgress");
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* 
     Scroll reveal using IntersectionObserver
      */
  function initScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* 
     Typing effect in the hero role line
      */
  function initTypingEffect() {
    const el = document.getElementById("typingRole");
    if (!el) return;

    const phrases = [
      "Computer & Communication Engineering Student",
      "Software Developer",
      "Technology Enthusiast",
      "Curious about AI & Machine Learning",
    ];

    if (prefersReducedMotion) {
      el.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let deleting = false;

    function tick() {
      const current = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        if (charIndex >= current.length) {
          deleting = true;
          window.setTimeout(tick, 1600);
          el.textContent = current;
          return;
        }
      } else {
        charIndex--;
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }

      el.textContent = current.slice(0, charIndex);
      window.setTimeout(tick, deleting ? 35 : 55);
    }

    // Start the loop after the initial phrase has displayed for a moment.
    window.setTimeout(tick, 1800);
  }

  /* 
     Smooth-scrolling for in-page anchors (fallback for browsers
     that ignore the CSS scroll-behavior property)
      */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    });
  }

  /* 
     Project filtering (All / Web / ML / Database / Research / Academic)
      */
  function initProjectFiltering() {
    const buttons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".project-card");
    const emptyMsg = document.getElementById("filterEmpty");
    if (!buttons.length || !cards.length) return;

    // Only the top projects show under "All"; the rest open with the toggle
    // or automatically when a category filter is chosen.
    const grid = document.getElementById("projectsGrid");
    const toggle = document.getElementById("projectsToggle");
    const toggleWrap = toggle ? toggle.parentElement : null;
    let activeFilter = "all";
    let userExpanded = false;
    function syncExpanded() {
      const open = userExpanded || activeFilter !== "all";
      if (grid) grid.classList.toggle("expanded", open);
      if (toggle) {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = userExpanded ? "Show fewer projects" : "Show all 12 projects";
      }
      if (toggleWrap) toggleWrap.classList.toggle("hidden", activeFilter !== "all");
    }
    if (toggle) {
      toggle.addEventListener("click", () => {
        userExpanded = !userExpanded;
        syncExpanded();
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;
        let visibleCount = 0;
        activeFilter = filter;
        syncExpanded();

        cards.forEach((card) => {
          const categories = (card.dataset.category || "").split(" ");
          const matches = filter === "all" || categories.includes(filter);
          card.classList.toggle("filtered-out", !matches);
          if (matches) visibleCount++;
        });

        if (emptyMsg) {
          emptyMsg.classList.toggle("hidden", visibleCount > 0);
        }
      });
    });
  }

  /* 
     Project "View Details" modal
      */
  function initProjectModal() {
    const overlay = document.getElementById("modalOverlay");
    const closeBtn = document.getElementById("modalClose");
    const titleEl = document.getElementById("modalTitle");
    const bodyEl = document.getElementById("modalBody");
    const triggers = document.querySelectorAll(".project-details-btn");
    if (!overlay || !triggers.length) return;

    // Extra detail copy per project. Kept factual and consistent with the
    // project cards already in the page — no invented claims.
    const details = {
      student: {
        title: "Student Performance Prediction System",
        body:
          "<p>A machine learning project that predicts student academic outcomes using attendance, class test marks, midterm marks, and previous semester GPA.</p>" +
          "<p><strong>Approach:</strong> data preprocessing and feature selection on a structured dataset of roughly 500 records, followed by classification with logistic regression.</p>",
      },
      conflict: {
        title: "ConflictSense — Requirement Conflict Detection",
        body:
          "<p>A research project that automatically detects and explains conflicts between requirements in Software Requirement Specification (SRS) documents.</p>" +
          "<p><strong>Approach:</strong> NLP techniques such as named-entity recognition combined with machine-learning classification (scikit-learn) to find and explain contradictory requirements.</p>" +
          "<p>This is active research, not a finished or published result.</p>",
      },
      farm: {
        title: "Greenfield Smart Farming",
        body:
          "<p>A full-stack farm management web application for monitoring weather, calculating fertilizer needs, tracking farm locations, and reviewing analytics.</p>" +
          "<p><strong>Built with:</strong> Flask and PostgreSQL on the backend, JavaScript on the frontend, and Leaflet with OpenStreetMap for location tracking, delivered as a progressive web app.</p>",
      },
      expense: {
        title: "Expense Tracker",
        body:
          "<p>A responsive personal finance web app for recording expenses and income, reviewing spending through charts, and keeping each user data private behind a login.</p>" +
          "<p><strong>Accounts:</strong> Firebase Authentication handles sign-up, email/password login, logout, and password reset. Records are stored per user in Cloud Firestore.</p>" +
          "<p><strong>Expenses:</strong> each entry has an item, amount, category, date, and optional note. Entries can be searched, filtered by category or month, and sorted by date or amount. Categories are customizable, and frequently used items can be pinned for faster entry.</p>" +
          "<p><strong>Income &amp; insights:</strong> a separate income tracker, monthly and yearly summaries, and Chart.js charts for spending by month, year, and category.</p>" +
          "<p><strong>Extras:</strong> PDF export (jsPDF) and Excel export (SheetJS), a trash that keeps deleted records for 7 days so they can be restored, dark mode, and an installable PWA with offline caching. Older browser-stored data can be migrated into the account.</p>" +
          "<p><strong>Built with:</strong> HTML, CSS, vanilla JavaScript, Firebase, and Chart.js, hosted on GitHub Pages.</p>",
      },
      newsanalyzer: {
        title: "AI News Analyzer",
        body:
          "<p>A Python/Tkinter desktop application that searches live news via NewsAPI, then runs each article through an AI summarization and sentiment-analysis pipeline.</p>" +
          "<p><strong>Approach:</strong> Hugging Face Transformers generate summaries when available, falling back to extractive summarization; VADER (with a TextBlob backup) scores sentiment as positive, negative, or neutral with a confidence level.</p>" +
          "<p><strong>Extras:</strong> multi-threaded requests keep the GUI responsive, and results can be exported to TXT or CSV.</p>",
      },
      face: {
        title: "Face Detection System",
        body:
          "<p>A real-time face detection app built with Python and OpenCV, using Haar Cascade classifiers for faces, eyes, and smiles from a live webcam feed.</p>" +
          "<p><strong>Tracking:</strong> a centroid-tracking algorithm assigns stable IDs to faces across frames, with an FPS monitor and a modern UI overlay.</p>" +
          "<p><strong>Capture:</strong> manual full-frame screenshots plus an auto-snapshot mode that periodically saves cropped, per-face images.</p>",
      },
    };

    let lastFocusedEl = null;

    function openModal(key) {
      const data = details[key];
      if (!data) return;

      titleEl.textContent = data.title;
      bodyEl.innerHTML = data.body;
      overlay.hidden = false;
      lastFocusedEl = document.activeElement;
      closeBtn.focus();
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      overlay.hidden = true;
      document.body.style.overflow = "";
      if (lastFocusedEl) lastFocusedEl.focus();
    }

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.dataset.project));
    });

    closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.hidden) closeModal();
    });
  }

  /*
     Contact form — validated client-side, then actually delivered via
     Web3Forms (https://web3forms.com), a free service built exactly for
     static/no-backend sites: the browser POSTs directly to their API with
     an access key, and they relay the message to the owner's real inbox.
     No server code or secret key is needed — the "access key" is a public,
     write-only token safe to ship in frontend JS (it can only submit forms
     tied to the account that created it, never read anything back).
     If the request fails for any reason (offline, key not set up yet,
     service hiccup), we fall back to a mailto: link so the message can
     still reach an inbox some other way.
      */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

    const fields = {
      name: { el: document.getElementById("name"), error: document.getElementById("nameError") },
      email: { el: document.getElementById("email"), error: document.getElementById("emailError") },
      subject: { el: document.getElementById("subject"), error: document.getElementById("subjectError") },
      message: { el: document.getElementById("message"), error: document.getElementById("messageError") },
    };

    const statusEl = document.getElementById("formStatus");
    const submitBtn = form.querySelector('button[type="submit"]');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(fieldKey, message) {
      const field = fields[fieldKey];
      field.el.closest(".form-row").classList.toggle("invalid", Boolean(message));
      field.error.textContent = message || "";
    }

    function validate() {
      let isValid = true;

      if (!fields.name.el.value.trim()) {
        setError("name", "Please enter your name.");
        isValid = false;
      } else {
        setError("name", "");
      }

      if (!fields.email.el.value.trim()) {
        setError("email", "Please enter your email.");
        isValid = false;
      } else if (!emailPattern.test(fields.email.el.value.trim())) {
        setError("email", "Please enter a valid email address.");
        isValid = false;
      } else {
        setError("email", "");
      }

      if (!fields.subject.el.value.trim()) {
        setError("subject", "Please enter a subject.");
        isValid = false;
      } else {
        setError("subject", "");
      }

      if (!fields.message.el.value.trim()) {
        setError("message", "Please write a message.");
        isValid = false;
      } else if (fields.message.el.value.trim().length < 10) {
        setError("message", "Message should be at least 10 characters.");
        isValid = false;
      } else {
        setError("message", "");
      }

      return isValid;
    }

    function buildMailtoFallback(name, email, subject, message) {
      return (
        "mailto:akash.abdur.2002@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(`From: ${name} (${email})\n\n${message}`)
      );
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!validate()) {
        statusEl.textContent = "Please fix the highlighted fields.";
        statusEl.className = "form-status error";
        return;
      }

      const name = fields.name.el.value.trim();
      const email = fields.email.el.value.trim();
      const subject = fields.subject.el.value.trim();
      const message = fields.message.el.value.trim();
      const accessKey = (form.querySelector('input[name="access_key"]') || {}).value || "";
      const mailtoLink = buildMailtoFallback(name, email, subject, message);

      // Honeypot: a bot ticked the invisible checkbox. Pretend success, send nothing.
      const honeypot = form.querySelector('input[name="botcheck"]');
      if (honeypot && honeypot.checked) {
        statusEl.textContent = "Thanks! Your message has been sent.";
        statusEl.className = "form-status success";
        form.reset();
        return;
      }

      // hCaptcha: Web3Forms' script adds a hidden "h-captcha-response" field once
      // the widget has loaded. If it never loaded (blocked script, offline), skip the
      // client-side check and let the server decide, so the mailto fallback still works.
      const captchaField = form.querySelector('textarea[name="h-captcha-response"]');
      if (captchaField && !captchaField.value) {
        statusEl.textContent = "Please complete the captcha check before sending.";
        statusEl.className = "form-status error";
        return;
      }
      // The key is still the unfilled placeholder: nothing to submit to yet.
      if (!accessKey || accessKey === "YOUR_ACCESS_KEY_HERE") {
        statusEl.innerHTML =
          "This form isn't connected to an email service yet. " +
          '<a href="' + mailtoLink + '">Click here to send your message via your email app</a> instead.';
        statusEl.className = "form-status error";
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      statusEl.textContent = "Sending your message…";
      statusEl.className = "form-status";

      try {
        const response = await fetch(WEB3FORMS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: accessKey,
            name: name,
            email: email,
            subject: subject,
            message: message,
            from_name: "Abdur Rahman — Portfolio Contact Form",
            botcheck: false, // Web3Forms also rejects submissions where this is true
            "h-captcha-response": captchaField ? captchaField.value : "",
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          statusEl.textContent =
            "Thanks, " + name + "! Your message has been sent — I'll get back to you soon.";
          statusEl.className = "form-status success";
          form.reset();
        } else {
          throw new Error((result && result.message) || "Delivery failed");
        }
      } catch (err) {
        // Delivery failed (offline, service issue, misconfigured key, etc.)
        // — offer the mailto fallback so the message isn't lost.
        statusEl.innerHTML =
          "Couldn't send that automatically. " +
          '<a href="' + mailtoLink + '">Click here to send it via your email app</a> instead.';
        statusEl.className = "form-status error";
      } finally {
        // A captcha token is single-use, so ask for a fresh one after every attempt.
        if (window.hcaptcha && typeof window.hcaptcha.reset === "function") {
          try { window.hcaptcha.reset(); } catch (e) { /* ignore */ }
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Message";
        }
      }
    });
  }

  /* 
     Back-to-top button
      */
  function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      () => {
        btn.classList.toggle("visible", window.scrollY > 500);
      },
      { passive: true }
    );

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* 
     Dynamic footer year
      */
  function initFooterYear() {
    const el = document.getElementById("footerYear");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* 
     Optional GitHub stats (public API, no auth token in the
     frontend). Fails gracefully if offline or rate-limited.
      */
  function initGitHubStats() {
    const container = document.getElementById("githubStats");
    if (!container) return;

    const username = "abdurrahmancce";

    fetch(`https://api.github.com/users/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("GitHub API request failed");
        return res.json();
      })
      .then((data) => {
        container.innerHTML =
          '<div class="about-card-row"><span class="label">Public_Repos</span><span>' + data.public_repos + "</span></div>" +
          '<div class="about-card-row"><span class="label">Followers</span><span>' + data.followers + "</span></div>" +
          '<div class="about-card-row"><span class="label">Joined</span><span>' + new Date(data.created_at).getFullYear() + "</span></div>";
      })
      .catch(() => {
        // Graceful fallback — no broken UI if the API is unreachable
        // or rate-limited. The static CTA buttons still work.
        container.innerHTML =
          '<p class="github-stats-msg">Live GitHub stats aren&rsquo;t available right now &mdash; explore the profile directly instead.</p>';
      });
  }

  /* 
     Live GitHub contribution heatmap. Fetches real per-day
     contribution counts from the public github-contributions-api
     (github-contributions-api.jogruber.de) — no auth token needed,
     since it only mirrors publicly visible profile data — then
     renders an actual DOM grid so each cell can show a GitHub-style
     hover tooltip ("N contributions on Month Day"). Falls back to a
     text link if the request fails.
      */
  function initContributionHeatmap() {
    const grid = document.getElementById("heatmapGrid");
    const loading = document.getElementById("heatmapLoading");
    const fallback = document.getElementById("heatmapFallback");
    const titleEl = document.getElementById("heatmapTitle");
    const tooltip = document.getElementById("heatmapTooltip");
    if (!grid || !fallback || !tooltip) return;

    // The heatmap card uses backdrop-filter, which makes a position:fixed child
    // position itself relative to the card instead of the viewport. Moving the
    // tooltip to body keeps it next to the cursor.
    document.body.appendChild(tooltip);

    const username = "abdurrahmancce";
    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const MONTH_NAMES_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function ordinal(n) {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    function showFallback() {
      grid.innerHTML = "";
      fallback.classList.remove("hidden");
    }

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((res) => {
        if (!res.ok) throw new Error("Contribution API request failed");
        return res.json();
      })
      .then((data) => {
        const days = Array.isArray(data.contributions) ? data.contributions : [];
        if (!days.length) throw new Error("No contribution data returned");

        // Parse each date as a local-time date object (not UTC) so the
        // weekday lines up correctly regardless of the viewer's timezone.
        const parsed = days.map((d) => {
          const [y, m, day] = d.date.split("-").map(Number);
          return { date: new Date(y, m - 1, day), count: d.count, level: d.level };
        });

        const totalContributions = parsed.reduce((sum, d) => sum + d.count, 0);
        if (titleEl) {
          titleEl.textContent = `${totalContributions} contribution${totalContributions === 1 ? "" : "s"} in the last year`;
        }

        // Pad the front of the grid so the first real day lands on its
        // correct weekday row (grid-auto-flow: column wraps every 7 cells).
        const leadingBlanks = parsed[0].date.getDay();
        const cellSize = 14; // 11px cell + 3px gap, must match the CSS

        grid.innerHTML = "";
        if (loading) loading.remove();

        for (let i = 0; i < leadingBlanks; i++) {
          const spacer = document.createElement("div");
          spacer.className = "heatmap-cell";
          spacer.style.visibility = "hidden";
          grid.appendChild(spacer);
        }

        let lastLabeledMonth = -1;
        parsed.forEach((d, i) => {
          const globalIndex = leadingBlanks + i;
          const column = Math.floor(globalIndex / 7);
          const row = globalIndex % 7;

          // Place a month label above the column where that month first
          // appears in row 0 (or the earliest row available for column 0).
          if (d.date.getMonth() !== lastLabeledMonth && (row === 0 || column === 0)) {
            lastLabeledMonth = d.date.getMonth();
            const label = document.createElement("span");
            label.className = "heatmap-month-label";
            label.style.left = column * cellSize + "px";
            label.textContent = MONTH_NAMES[d.date.getMonth()];
            grid.appendChild(label);
          }

          const cell = document.createElement("div");
          cell.className = "heatmap-cell";
          cell.dataset.level = d.level;
          cell.dataset.count = d.count;
          cell.dataset.date = d.date.toISOString();
          grid.appendChild(cell);
        });

        // Shared tooltip, positioned near the cursor on hover.
        function showTooltip(e, cell) {
          const count = Number(cell.dataset.count);
          const date = new Date(cell.dataset.date);
          const label = `${MONTH_NAMES_LONG[date.getMonth()]} ${ordinal(date.getDate())}`;
          tooltip.textContent =
            count === 0
              ? `No contributions on ${label}.`
              : `${count} contribution${count === 1 ? "" : "s"} on ${label}.`;
          tooltip.style.left = e.clientX + "px";
          tooltip.style.top = e.clientY + "px";
          tooltip.hidden = false;
        }

        grid.querySelectorAll(".heatmap-cell:not([style*='hidden'])").forEach((cell) => {
          if (!cell.dataset.date) return;
          cell.addEventListener("pointerenter", (e) => showTooltip(e, cell));
          cell.addEventListener("pointermove", (e) => showTooltip(e, cell));
          cell.addEventListener("pointerleave", () => {
            tooltip.hidden = true;
          });
        });
      })
      .catch(() => {
        showFallback();
      });
  }
})();