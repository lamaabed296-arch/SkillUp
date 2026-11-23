(() => {
    const form = document.querySelector("[data-login-form]");
    if (!form) {
        return;
    }

    const email = form.elements.email;
    const password = form.elements.password;
    const formMessage = form.querySelector("[data-form-message]");
    const forgotPassword = document.querySelector("[data-forgot-password]");
    const forgotMessage = document.querySelector("#forgot-password-message");
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

    forgotPassword?.addEventListener("click", (event) => {
        event.preventDefault();
        forgotMessage.hidden = false;
    });

    [email, password].forEach((field) => {
        field.addEventListener("input", () => {
            clearFieldError(field.name);
            formMessage.hidden = true;
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearFieldError("email");
        clearFieldError("password");
        formMessage.hidden = true;

        const invalidFields = [];
        const emailValue = email.value.trim();
        if (!emailValue) {
            setFieldError("email", "أدخل البريد الإلكتروني.");
            invalidFields.push(email);
        } else if (!emailPattern.test(emailValue)) {
            setFieldError("email", "أدخل بريداً إلكترونياً بصيغة صحيحة.");
            invalidFields.push(email);
        }

        if (!password.value) {
            setFieldError("password", "أدخل كلمة المرور.");
            invalidFields.push(password);
        }

        if (invalidFields.length > 0) {
            invalidFields[0].focus();
            return;
        }

        formMessage.className = "auth-message auth-message--success";
        formMessage.textContent = "تم التحقق من البيانات محلياً فقط. لم يتم تسجيل الدخول.";
        formMessage.hidden = false;
    });
})();
