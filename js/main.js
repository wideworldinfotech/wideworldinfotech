(function () {
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const year = document.getElementById("year");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = String(new Date().getFullYear());

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const clocks = document.querySelectorAll(".clock");
  function paintClocks() {
    clocks.forEach(function (node) {
      const zone = node.getAttribute("data-tz");
      const label = node.getAttribute("data-label") || "";
      try {
        const time = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: zone
        }).format(new Date());
        node.textContent = time;
        node.setAttribute("aria-label", label + " " + time);
      } catch (err) {
        node.textContent = label;
      }
    });
  }
  paintClocks();
  window.setInterval(paintClocks, 30000);

  const slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  const stage = document.getElementById("stage");
  let slideIndex = 0;
  let slideTimer = 0;

  function showSlide(next) {
    if (!slides.length) return;
    slideIndex = (next + slides.length) % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle("is-active", index === slideIndex);
    });
  }

  function queueSlides() {
    if (reduce || slides.length < 2) return;
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 4500);
  }

  const prev = document.getElementById("slidePrev");
  const next = document.getElementById("slideNext");
  if (prev) prev.addEventListener("click", function () { showSlide(slideIndex - 1); queueSlides(); });
  if (next) next.addEventListener("click", function () { showSlide(slideIndex + 1); queueSlides(); });
  if (stage) {
    stage.addEventListener("mouseenter", function () { window.clearInterval(slideTimer); });
    stage.addEventListener("mouseleave", queueSlides);
  }
  queueSlides();

  const reviewTrack = document.getElementById("reviewTrack");
  const reviewSlider = document.getElementById("reviewSlider");
  const reviewDots = document.getElementById("reviewDots");
  const reviewCards = reviewTrack ? Array.prototype.slice.call(reviewTrack.children) : [];
  let reviewIndex = 0;
  let reviewTimer = 0;

  function showReview(next) {
    if (!reviewCards.length || !reviewTrack) return;
    reviewIndex = (next + reviewCards.length) % reviewCards.length;
    reviewTrack.style.transform = "translateX(-" + (reviewIndex * 100) + "%)";
    if (reviewDots) {
      Array.prototype.forEach.call(reviewDots.children, function (dot, index) {
        dot.classList.toggle("is-on", index === reviewIndex);
        if (index === reviewIndex) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }
  }

  function queueReviews() {
    if (reduce || reviewCards.length < 2) return;
    window.clearInterval(reviewTimer);
    reviewTimer = window.setInterval(function () {
      showReview(reviewIndex + 1);
    }, 3800);
  }

  if (reviewDots) {
    reviewCards.forEach(function (_, index) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show review " + (index + 1));
      dot.addEventListener("click", function () {
        showReview(index);
        queueReviews();
      });
      reviewDots.appendChild(dot);
    });
  }
  const reviewPrev = document.getElementById("reviewPrev");
  const reviewNext = document.getElementById("reviewNext");
  if (reviewPrev) reviewPrev.addEventListener("click", function () { showReview(reviewIndex - 1); queueReviews(); });
  if (reviewNext) reviewNext.addEventListener("click", function () { showReview(reviewIndex + 1); queueReviews(); });
  if (reviewSlider) {
    reviewSlider.addEventListener("mouseenter", function () { window.clearInterval(reviewTimer); });
    reviewSlider.addEventListener("mouseleave", queueReviews);
  }
  showReview(0);
  queueReviews();

  const reel = document.getElementById("reelRow");
  const reelPrev = document.getElementById("reelPrev");
  const reelNext = document.getElementById("reelNext");
  function reelBy(direction) {
    if (!reel) return;
    const amount = Math.max(reel.clientWidth * 0.8, 280) * direction;
    reel.scrollBy({ left: amount, behavior: reduce ? "auto" : "smooth" });
  }
  if (reelPrev) reelPrev.addEventListener("click", function () { reelBy(-1); });
  if (reelNext) reelNext.addEventListener("click", function () { reelBy(1); });

  const videos = Array.prototype.slice.call(document.querySelectorAll("video"));
  const filmToggle = document.getElementById("filmToggle");

  if (reduce) {
    videos.forEach(function (video) {
      video.removeAttribute("autoplay");
      video.pause();
    });
    if (filmToggle) filmToggle.textContent = "Play films";
  }

  if (filmToggle) {
    filmToggle.addEventListener("click", function () {
      const heroVideos = document.querySelectorAll(".hero video");
      const paused = heroVideos[0] && heroVideos[0].paused;
      heroVideos.forEach(function (video) {
        if (paused) video.play();
        else video.pause();
      });
      filmToggle.textContent = paused ? "Pause films" : "Play films";
    });
  }

  if ("IntersectionObserver" in window && !reduce) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const video = entry.target;
        if (entry.isIntersecting) video.play().catch(function () {});
        else video.pause();
      });
    }, { threshold: 0.45 });
    document.querySelectorAll(".reel video, .ai video").forEach(function (video) {
      observer.observe(video);
    });
  }

  const form = document.getElementById("enquiry");
  const note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const company = String(data.get("company") || "").trim();
      const service = String(data.get("service") || "").trim();
      const message = String(data.get("message") || "").trim();
      const body = [
        "Name: " + name,
        "Email: " + email,
        "Company: " + (company || "—"),
        "Service: " + service,
        "",
        message
      ].join("\n");
      const href = "mailto:info@wideworldinfotech.com?subject=" +
        encodeURIComponent("Project enquiry from " + name) +
        "&body=" + encodeURIComponent(body);
      if (note) note.textContent = "Your email app should open with this note. If it does not, write to info@wideworldinfotech.com.";
      window.location.href = href;
    });
  }
})();
