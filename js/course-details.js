(() => {
    const detailView = document.querySelector("[data-course-view]");
    const errorView = document.querySelector("[data-course-error]");

    if (!detailView || !errorView) {
        return;
    }

    const getElement = (selector) => document.querySelector(selector);
    const setText = (selector, value) => {
        const element = getElement(selector);
        if (element) {
            element.textContent = String(value ?? "");
        }
        return element;
    };

    const showError = (title, message) => {
        setText("[data-course-error-title]", title);
        setText("[data-course-error-message]", message);
        errorView.hidden = false;
        detailView.hidden = true;
        document.title = `${title} | SkillUp`;
    };

    const courseId = new URLSearchParams(window.location.search).get("id");
    if (!courseId) {
        showError("لم يتم تحديد الكورس", "افتح صفحة الكورسات واختر كورساً لعرض تفاصيله.");
        return;
    }

    const courses = window.SkillUpData?.courses;
    if (!Array.isArray(courses)) {
        showError("تعذّر تحميل الكورس", "لم نتمكن من تحميل بيانات الكورسات. حاول العودة إلى القائمة.");
        return;
    }

    const course = courses.find((item) => item.id === courseId);
    if (!course) {
        showError("الكورس غير موجود", "لم نعثر على كورس بهذا الرابط. يمكنك استعراض الكورسات المتاحة.");
        return;
    }

    const formatNumber = new Intl.NumberFormat("ar");
    document.title = `${course.title} | SkillUp`;
    setText("[data-course-breadcrumb]", course.title);
    setText("[data-course-category]", course.category);
    setText("[data-course-title]", course.title);
    setText("[data-course-description]", course.description);
    setText("[data-course-level]", course.level);
    setText("[data-course-duration]", course.duration);

    const instructorFact = getElement("[data-course-instructor-fact]");
    if (course.instructor) {
        setText("[data-course-instructor]", course.instructor);
    } else if (instructorFact) {
        instructorFact.hidden = true;
    }

    if (Number.isFinite(course.rating)) {
        setText("[data-course-rating]", `${formatNumber.format(course.rating)} من ٥`);
    } else {
        const ratingFact = getElement("[data-course-rating-fact]");
        if (ratingFact) {
            ratingFact.hidden = true;
        }
    }

    const lessons = Array.isArray(course.curriculum)
        ? course.curriculum.reduce((total, module) => (
            total + (Array.isArray(module.lessons) ? module.lessons.length : 0)
        ), 0)
        : 0;
    const lessonFact = getElement("[data-course-lesson-fact]");
    if (lessons > 0) {
        const lessonLabel = lessons === 1 ? "درس" : lessons === 2 ? "درسان" : "دروس";
        setText("[data-course-lesson-count]", `${formatNumber.format(lessons)} ${lessonLabel}`);
    } else if (lessonFact) {
        lessonFact.hidden = true;
    }

    if (Number.isFinite(course.price)) {
        const currency = course.currency ? ` ${course.currency}` : "";
        setText("[data-course-price]", `${formatNumber.format(course.price)}${currency}`);
    } else {
        const priceElement = getElement("[data-course-price]");
        if (priceElement) {
            priceElement.hidden = true;
        }
    }

    const imageElement = getElement("[data-course-image]");
    const imageCaption = getElement("[data-course-image-caption]");
    const imageSource = course.image?.src;
    if (imageElement && imageSource) {
        try {
            const imageUrl = new URL(imageSource, window.location.href);
            if (imageUrl.protocol !== "https:" && imageUrl.protocol !== "http:") {
                throw new TypeError("Unsupported image URL protocol");
            }
            imageElement.src = imageUrl.href;
            imageElement.alt = String(course.image.alt || course.title);
            imageElement.addEventListener("error", () => {
                imageElement.hidden = true;
            }, { once: true });
            if (imageCaption) {
                imageCaption.textContent = String(course.image.alt || "");
                imageCaption.hidden = !course.image.alt;
            }
        } catch {
            imageElement.hidden = true;
            if (imageCaption) {
                imageCaption.hidden = true;
            }
        }
    } else if (imageElement) {
        imageElement.hidden = true;
    }

    const outcomes = Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [];
    const outcomesList = getElement("[data-course-outcomes]");
    const outcomesSection = getElement("[data-course-outcomes-section]");
    if (outcomesList && outcomesSection && outcomes.length > 0) {
        const outcomeItems = document.createDocumentFragment();
        outcomes.forEach((outcome) => {
            const item = document.createElement("li");
            item.textContent = String(outcome);
            outcomeItems.append(item);
        });
        outcomesList.append(outcomeItems);
    } else if (outcomesSection) {
        outcomesSection.hidden = true;
    }

    const curriculum = Array.isArray(course.curriculum) ? course.curriculum : [];
    const curriculumList = getElement("[data-course-curriculum]");
    const curriculumSection = getElement("[data-course-curriculum-section]");
    if (curriculumList && curriculumSection && curriculum.length > 0) {
        const modules = document.createDocumentFragment();
        curriculum.forEach((module, index) => {
            const moduleElement = document.createElement("div");
            moduleElement.className = "course-detail__module";

            const toggle = document.createElement("button");
            toggle.className = "course-detail__module-summary";
            toggle.type = "button";
            toggle.setAttribute("aria-expanded", "false");
            toggle.dataset.courseModuleToggle = "";

            const panelId = `${course.id}-module-${index + 1}-lessons`;
            toggle.setAttribute("aria-controls", panelId);

            const title = document.createElement("span");
            title.textContent = String(module.title ?? "");
            const moduleLessons = Array.isArray(module.lessons) ? module.lessons : [];
            const lessonLabel = moduleLessons.length === 1 ? "درس" : "دروس";
            const lessonCount = document.createElement("span");
            lessonCount.className = "course-detail__module-count";
            lessonCount.textContent = `${formatNumber.format(moduleLessons.length)} ${lessonLabel}`;
            const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            chevron.classList.add("course-detail__module-chevron");
            chevron.setAttribute("viewBox", "0 0 24 24");
            chevron.setAttribute("aria-hidden", "true");
            const chevronPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            chevronPath.setAttribute("d", "m6 9 6 6 6-6");
            chevron.append(chevronPath);
            toggle.append(title, lessonCount, chevron);

            const panel = document.createElement("div");
            panel.className = "course-detail__module-panel";
            panel.id = panelId;
            panel.setAttribute("aria-hidden", "true");
            panel.inert = true;

            const panelInner = document.createElement("div");
            panelInner.className = "course-detail__module-panel-inner";

            const lessonList = document.createElement("ol");
            lessonList.className = "course-detail__lesson-list";
            moduleLessons.forEach((lesson) => {
                const item = document.createElement("li");
                item.textContent = String(lesson);
                lessonList.append(item);
            });

            panelInner.append(lessonList);
            panel.append(panelInner);
            moduleElement.append(toggle, panel);
            modules.append(moduleElement);
        });
        curriculumList.append(modules);

        curriculumList.addEventListener("click", (event) => {
            const toggle = event.target.closest("[data-course-module-toggle]");
            if (!toggle) {
                return;
            }

            const panel = document.getElementById(toggle.getAttribute("aria-controls"));
            if (!panel) {
                return;
            }

            const isExpanded = toggle.getAttribute("aria-expanded") !== "true";
            toggle.setAttribute("aria-expanded", String(isExpanded));
            panel.setAttribute("aria-hidden", String(!isExpanded));
            panel.inert = !isExpanded;
            panel.classList.toggle("is-open", isExpanded);
        });
    } else if (curriculumSection) {
        curriculumSection.hidden = true;
    }

    const enrollButton = getElement("[data-course-enroll]");
    const enrollMessage = getElement("[data-course-enroll-message]");
    if (enrollButton && enrollMessage) {
        enrollButton.addEventListener("click", () => {
            enrollMessage.textContent = "هذه واجهة تجريبية فقط؛ لم يتم تسجيل الالتحاق بالكورس.";
            enrollMessage.hidden = false;
        });
    }

    detailView.hidden = false;
})();
