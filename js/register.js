(() => {
    const form = document.querySelector("[data-register-form]");
    if (!form) {
        return;
    }

    const fullName = form.elements.name;
    const email = form.elements.email;
    const password = form.elements.password;
    const confirmPassword = form.elements.confirmPassword;
    const terms = form.elements.terms;
    const formMessage = form.querySelector("[data-form-message]");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const setFieldError = (fieldName, message) => {
        const field = form.elements[fieldName];
        const error = form.querySelector(`[data-error-for="${fieldName}"]`);
        field.setAttribute("aria-invalid", "true");
        error.textContent = message;
        error.hidden = false;
    };

    const clearFieldError = (fieldName) => {
        const field = form.elements[fieldName];
        const error = form.querySelector(`[data-error-for="${fieldName}"]`);
        field.removeAttribute("aria-invalid");
        error.textContent = "";
        error.hidden = true;
    };

    form.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const input = document.getElementById(toggle.dataset.passwordToggle);
            const isVisible = input.type === "text";
            input.type = isVisible ? "password" : "text";
            toggle.textContent = isVisible ? "إظهار" : "إخفاء";
            toggle.setAttribute("aria-label", isVisible ? "إظهار كلمة المرور" : "إخفاء كلمة المرور");
            toggle.setAttribute("aria-pressed", String(!isVisible));
        });
    });

    [fullName, email, password, confirmPassword].forEach((field) => {
        field.addEventListener("input", () => {
            clearFieldError(field.name);
            formMessage.hidden = true;
            if (field === password) {
                clearFieldError("confirmPassword");
            }
        });
    });

    terms.addEventListener("change", () => {
        clearFieldError("terms");
        formMessage.hidden = true;
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        ["name", "email", "password", "confirmPassword", "terms"].forEach(clearFieldError);
        formMessage.hidden = true;

        const invalidFields = [];
        if (!fullName.value.trim()) {
            setFieldError("name", "أدخل الاسم الكامل.");
            invalidFields.push(fullName);
        }

        const emailValue = email.value.trim();
        if (!emailValue) {
            setFieldError("email", "أدخل البريد الإلكتروني.");
            invalidFields.push(email);
        } else if (!emailPattern.test(emailValue)) {
            setFieldError("email", "أدخل بريداً إلكترونياً بصيغة صحيحة.");
            invalidFields.push(email);
        }

        if (password.value.length < 8) {
            setFieldError("password", "يجب ألا تقل كلمة المرور عن 8 أحرف.");
            invalidFields.push(password);
        }

        if (!confirmPassword.value) {
            setFieldError("confirmPassword", "أعد كتابة كلمة المرور.");
            invalidFields.push(confirmPassword);
        } else if (password.value !== confirmPassword.value) {
            setFieldError("confirmPassword", "كلمتا المرور غير متطابقتين.");
            invalidFields.push(confirmPassword);
        }

        if (!terms.checked) {
            setFieldError("terms", "يجب الموافقة على الشروط والأحكام للمتابعة.");
            invalidFields.push(terms);
        }

        if (invalidFields.length > 0) {
            invalidFields[0].focus();
            return;
        }

        formMessage.className = "auth-message auth-message--success";
        formMessage.textContent = "تم التحقق من البيانات محلياً فقط. لم يتم إنشاء الحساب.";
        formMessage.hidden = false;
    });
})();
