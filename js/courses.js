const courseGrid = document.querySelector("[data-course-grid]");
const courseStatus = document.querySelector("[data-course-status]");
const courseSearch = document.querySelector("[data-course-search]");
const categoryFilter = document.querySelector("[data-course-category]");
const levelFilter = document.querySelector("[data-course-level]");
const courseSort = document.querySelector("[data-course-sort]");
const courseReset = document.querySelector("[data-course-reset]");
const courseEmpty = document.querySelector("[data-course-empty]");

const createTextElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
};

const createCourseCard = (course) => {
    const detailsUrl = `course-details.html?id=${encodeURIComponent(course.id)}`;
    const card = document.createElement("article");
    card.className = "card card--interactive course-card";

    const imageLink = document.createElement("a");
    imageLink.className = "course-card__image-link";
    imageLink.href = detailsUrl;
    imageLink.setAttribute("aria-label", `عرض تفاصيل كورس ${course.title}`);

    const image = document.createElement("img");
    image.className = "course-card__image";
    image.src = course.image.src;
    image.alt = course.image.alt;
    image.loading = "lazy";
    imageLink.append(image);

    const body = document.createElement("div");
    body.className = "course-card__body";

    const meta = document.createElement("div");
    meta.className = "course-card__meta";
    meta.append(createTextElement("span", "course-card__category", course.category));

    const rating = document.createElement("span");
    rating.className = "course-card__rating";
    rating.setAttribute("aria-label", `التقييم ${course.rating} من 5`);

    const star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    star.classList.add("icon", "icon--star");
    star.setAttribute("viewBox", "0 0 24 24");
    star.setAttribute("aria-hidden", "true");
    const starPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    starPath.setAttribute("d", "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z");
    star.append(starPath);
    rating.append(star, document.createTextNode(` ${course.rating.toFixed(1)}`));
    meta.append(rating);

    const title = document.createElement("h2");
    title.className = "course-card__title";
    const titleLink = createTextElement("a", "", course.title);
    titleLink.href = detailsUrl;
    title.append(titleLink);

    const instructor = createTextElement("p", "course-card__instructor", `مع ${course.instructor}`);

    const facts = document.createElement("ul");
    facts.className = "course-card__facts";
    facts.append(
        createTextElement("li", "course-card__fact", `المستوى: ${course.level}`),
        createTextElement("li", "course-card__fact", `المدة: ${course.duration}`)
    );

    const footer = document.createElement("div");
    footer.className = "course-card__footer";
    const price = document.createElement("span");
    price.className = "course-card__price";
    price.dir = "auto";
    price.append(document.createTextNode(`${course.price} `));
    price.append(createTextElement("small", "", course.currency));

    const detailsLink = createTextElement("a", "button button--outline course-card__detail", "عرض التفاصيل");
    detailsLink.href = detailsUrl;
    footer.append(price, detailsLink);

    body.append(meta, title, instructor, facts, footer);
    card.append(imageLink, body);
    return card;
};

const normalizeCourseName = (value) => String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .trim()
    .toLocaleLowerCase("ar");

if (courseGrid && courseStatus) {
    const courses = window.SkillUpData?.courses;

    if (!Array.isArray(courses)) {
        courseStatus.textContent = "تعذّر تحميل الكورسات. يرجى المحاولة لاحقاً.";
    } else if (courses.length === 0) {
        courseStatus.textContent = "لا توجد كورسات متاحة حالياً.";
        if (courseEmpty) {
            courseEmpty.hidden = false;
            courseEmpty.textContent = "لا توجد كورسات متاحة حالياً.";
        }
    } else {
        const categories = window.SkillUpData.categories;

        if (Array.isArray(categories) && categoryFilter) {
            categories.forEach((category) => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.append(option);
            });
        }

        if (levelFilter) {
            const levels = [...new Set(courses.map((course) => course.level).filter(Boolean))];
            levels.forEach((level) => {
                const option = document.createElement("option");
                option.value = level;
                option.textContent = level;
                levelFilter.append(option);
            });
        }

        const renderCourses = () => {
            const query = normalizeCourseName(courseSearch?.value);
            const selectedCategory = categoryFilter?.value ?? "";
            const selectedLevel = levelFilter?.value ?? "";
            const selectedSort = courseSort?.value ?? "default";

            const matchingCourses = courses.filter((course) => (
                normalizeCourseName(course.title).includes(query) &&
                (!selectedCategory || course.categoryId === selectedCategory) &&
                (!selectedLevel || course.level === selectedLevel)
            ));

            if (selectedSort === "rating-desc") {
                matchingCourses.sort((first, second) => second.rating - first.rating);
            } else if (selectedSort === "price-asc") {
                matchingCourses.sort((first, second) => first.price - second.price);
            } else if (selectedSort === "price-desc") {
                matchingCourses.sort((first, second) => second.price - first.price);
            } else if (selectedSort === "title-asc") {
                matchingCourses.sort((first, second) => first.title.localeCompare(second.title, "ar"));
            }

            const cards = document.createDocumentFragment();
            matchingCourses.forEach((course) => cards.append(createCourseCard(course)));
            courseGrid.replaceChildren(cards);

            const hasResults = matchingCourses.length > 0;
            courseGrid.hidden = !hasResults;
            if (courseEmpty) {
                courseEmpty.hidden = hasResults;
            }
            courseStatus.textContent = hasResults
                ? `${matchingCourses.length} من أصل ${courses.length} كورسات متاحة`
                : "لا توجد كورسات مطابقة";
        };

        courseSearch?.addEventListener("input", renderCourses);
        categoryFilter?.addEventListener("change", renderCourses);
        levelFilter?.addEventListener("change", renderCourses);
        courseSort?.addEventListener("change", renderCourses);

        courseReset?.addEventListener("click", () => {
            if (courseSearch) courseSearch.value = "";
            if (categoryFilter) categoryFilter.value = "";
            if (levelFilter) levelFilter.value = "";
            if (courseSort) courseSort.value = "default";
            renderCourses();
            courseSearch?.focus();
        });

        renderCourses();
    }
}
