document.addEventListener('DOMContentLoaded', () => {
    const contacts = [
        { firstName: 'Anton', lastName: 'Mayer', email: 'antonm@gmail.com', initials: 'AM', color: '#FF7A00' },
        { firstName: 'Anja', lastName: 'Schulz', email: 'schulz@hotmail.com', initials: 'AS', color: '#9327FF' },
        { firstName: 'Benedikt', lastName: 'Ziegler', email: 'benedikt@gmail.com', initials: 'BZ', color: '#6E52FF' },
        { firstName: 'David', lastName: 'Eisenberg', email: 'davidberg@gmail.com', initials: 'DE', color: '#FC71FF' },
        { firstName: 'Eva', lastName: 'Fischer', email: 'eva@gmail.com', initials: 'EF', color: '#FFBB2B' },
        { firstName: 'Emmanuel', lastName: 'Mauer', email: 'emmanuelma@gmail.com', initials: 'EM', color: '#1FD7C1' },
    ];

    function renderContacts() {
        const contactListContainer = document.querySelector('.contact-list-container');
        contactListContainer.innerHTML = ''; // Clear existing content

        const groupedContacts = contacts.reduce((acc, contact) => {
            const firstLetter = contact.lastName.charAt(0).toUpperCase();
            if (!acc[firstLetter]) {
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(contact);
            return acc;
        }, {});

        const sortedLetters = Object.keys(groupedContacts).sort();

        sortedLetters.forEach(letter => {
            const letterGroup = document.createElement('div');
            letterGroup.classList.add('contact-letter-group');
            letterGroup.innerHTML = `<div class="contact-letter-header">${letter}</div><div class="contact-separator"></div>`;

            groupedContacts[letter].sort((a, b) => a.lastName.localeCompare(b.lastName)).forEach(contact => {
                const contactItem = document.createElement('div');
                contactItem.classList.add('contact-item');
                contactItem.innerHTML = `
                    <div class="contact-initials" style="background-color: ${contact.color};">${contact.initials}</div>
                    <div class="contact-details">
                        <div class="contact-name">${contact.firstName} ${contact.lastName}</div>
                        <div class="contact-email">${contact.email}</div>
                    </div>
                `;
                letterGroup.appendChild(contactItem);
            });
            contactListContainer.appendChild(letterGroup);
        });
    }

    renderContacts();
});
