/**
 * Add Task Form Validation Module
 * Contains all validation logic and error handling functions for the add task module
 */

/**
 * Validates all required fields in the task form
 * @returns {boolean} True if all required fields are valid, false otherwise
 */
function validateTaskForm() {
    const isTitleValid = validateField('title');
    const isDateValid = validateField('due-date');
    const isCategoryValid = validateCategory();
    return isTitleValid && isDateValid && isCategoryValid;
}

/**
 * Validates the edit task form and shows error messages
 * @returns {boolean} true if form is valid
 */
function validateEditTaskForm() {
    let isValid = true;
    const titleInput = document.getElementById('edit-title');
    const titleError = document.getElementById('edit-title-error');
    isValid = validateTaskFormCheckIfTitleInputAndTitleErrorExist(titleInput, titleError, isValid);
    const dateInput = document.getElementById('edit-due-date');
    const dateError = document.getElementById('edit-due-date-error');
    isValid = validateTaskFormCheckIfDateInputAndDateErrorExist(dateInput, dateError, isValid);
    return isValid;
}

/**
 * Validates date input field and error element existence, then validates date value
 * @param {HTMLElement} dateInput - The date input element to validate
 * @param {HTMLElement} dateError - The error display element for date validation
 * @param {boolean} isValid - Current validation state
 * @returns {boolean} Updated validation state after date checks
 */
function validateTaskFormCheckIfDateInputAndDateErrorExist(dateInput, dateError, isValid) {
    if (dateInput && dateError) {
        if (!dateInput.value) {
            dateError.textContent = 'Due date is required';
            dateInput.setAttribute('aria-invalid', 'true');
            isValid = false;
        } else {
            isValid = validateTaskFormIfDateSmallerToday(dateInput, dateError, isValid);
        }
    }
    return isValid;
}

/**
 * Validates if the selected date is not in the past
 * @param {HTMLElement} dateInput - The date input element containing the date value
 * @param {HTMLElement} dateError - The error display element for date validation messages
 * @param {boolean} isValid - Current validation state
 * @returns {boolean} Updated validation state after past date check
 */
function validateTaskFormIfDateSmallerToday(dateInput, dateError, isValid) {
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        dateError.textContent = 'Due date cannot be in the past';
        dateInput.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else {
        dateError.textContent = '';
        dateInput.setAttribute('aria-invalid', 'false');
    }
    return isValid;
}

/**
 * Validates title input field and error element existence, then validates title value
 * @param {HTMLElement} titleInput - The title input element to validate
 * @param {HTMLElement} titleError - The error display element for title validation
 * @param {boolean} isValid - Current validation state
 * @returns {boolean} Updated validation state after title checks
 */
function validateTaskFormCheckIfTitleInputAndTitleErrorExist(titleInput, titleError, isValid) {
    if (titleInput && titleError) {
        if (!titleInput.value.trim()) {
            titleError.textContent = 'Title is required';
            titleInput.setAttribute('aria-invalid', 'true');
            isValid = false;
        } else {
            titleError.textContent = '';
            titleInput.setAttribute('aria-invalid', 'false');
        }
    }
    return isValid;
}

/**
 * Sets up real-time validation for edit form inputs
 */
function setupEditFormValidation() {
    const titleInput = document.getElementById('edit-title');
    if (titleInput) {
        titleInput.addEventListener('blur', () => validateEditTaskForm());
        titleInput.addEventListener('input', () => {
            // Clear error on input
            const titleError = document.getElementById('edit-title-error');
            if (titleError && titleInput.value.trim()) {
                titleError.textContent = '';
                titleInput.setAttribute('aria-invalid', 'false');
            }
        });
    }
    
    const dateInput = document.getElementById('edit-due-date');
    if (dateInput) {
        dateInput.addEventListener('blur', () => validateEditTaskForm());
        dateInput.addEventListener('change', () => validateEditTaskForm());
    }
}

/**
 * Validates a form field and shows/hides error messages
 * @param {string} id - The ID of the form field to validate
 * @returns {boolean} True if field is valid, false otherwise
 */
function validateField(id) {
    let input = document.getElementById(id);
    let errorMsg = document.getElementById(id + '-error');
    if (!input.value.trim()) {
        input.classList.add('input-error');
        errorMsg.classList.add('visible');
        return false;
    } else {
        input.classList.remove('input-error');
        errorMsg.classList.remove('visible');
        return true;
    }
}

/**
 * Validates the category selection and shows/hides error messages
 * @returns {boolean} True if category is selected, false otherwise
 */
function validateCategory() {
    let input = document.getElementById('category');
    let container = document.getElementById('category-display');
    let errorMsg = document.getElementById('category-error');
    if (!input.value) {
        container.classList.add('input-error');
        errorMsg.classList.add('visible');
        return false;
    } else {
        container.classList.remove('input-error');
        errorMsg.classList.remove('visible');
        return true;
    }
}

/**
 * Clears error styling and messages for a form field
 * @param {string} id - The ID of the form field to clear errors for
 */
function clearError(id) {
    let input = document.getElementById(id);
    let errorMsg = document.getElementById(id + '-error');
    input.classList.remove('input-error');
    errorMsg.classList.remove('visible');
}