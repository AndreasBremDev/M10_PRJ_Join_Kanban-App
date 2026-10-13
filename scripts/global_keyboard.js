/**
 * Global Keyboard Event Handlers and Accessibility Features
 * Contains all shared keyboard navigation and accessibility functions across the application
 */

/**
 * Initializes keyboard navigation support for navigation links
 * Enables Space key activation for nav links, privacy policy, and legal notice links
 */
function initNavKeyboardSupport() {
    const navLinks = document.querySelectorAll('.nav_navigation a, .privacy_policy, .legal_notes');
    navLinks.forEach(link => {
        link.addEventListener('keydown', function(event) {
            if (event.key === ' ') {
                event.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * Keyboard event handler for menu escape key
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleMenuEscapeKey(event) {
    if (event.key === 'Escape') {
        event.preventDefault();
        let userMenu = document.getElementById('user-menu');
        let userCircle = document.querySelector('.user-circle');
        if (userMenu && userMenu.classList.contains('show')) {
            closeDropDownAndResetFocus(userMenu, userCircle);
        }
    }
}

/**
 * Keyboard event handler for user menu toggle
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleUserMenuKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleDropDownMenu();
    }
}

/**
 * Keyboard event handler for assigned dropdown
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleAssignedDropdownKeydown(event) {
    const dropdown = document.getElementById('assigned-dropdown');
    const displayElement = document.getElementById('assigned-display');
    
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleAssignedDropdown();
    } else if (event.key === 'Escape') {
        if (dropdown && dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            if (displayElement) {
                displayElement.setAttribute('aria-expanded', 'false');
                displayElement.focus();
            }
        }
    }
}

/**
 * Keyboard event handler for category dropdown
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleCategoryDropdownKeydown(event) {
    const dropdown = document.getElementById('category-options');
    const displayElement = document.getElementById('category-display');
    
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleCategoryDropdown();
    } else if (event.key === 'Escape') {
        if (dropdown && dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            if (displayElement) {
                displayElement.setAttribute('aria-expanded', 'false');
                displayElement.focus();
            }
        }
    }
}

/**
 * Keyboard event handler for edit assigned dropdown
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleAssignedDropdownEditKeydown(event) {
    const dropdown = document.getElementById('assigned-dropdown-edit');
    const displayElement = document.getElementById('assigned-display-edit');
    
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleContactDropdownEdit();
    } else if (event.key === 'Escape') {
        if (dropdown && dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            if (displayElement) {
                displayElement.setAttribute('aria-expanded', 'false');
                displayElement.focus();
            }
        }
    }
}