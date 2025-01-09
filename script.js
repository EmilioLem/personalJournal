document.addEventListener('DOMContentLoaded', () => {
    const publishBtn = document.getElementById('publishBtn');
    const entryTitleInput = document.getElementById('entryTitle');
    const entryTextInput = document.getElementById('entryText');
    const wordCountDisplay = document.getElementById('wordCount');
    const journalEntriesDiv = document.getElementById('journalEntries');
    const exportBtn = document.getElementById('exportBtn');

    let serialNumber = parseInt(localStorage.getItem('journalSerialNumber')) || 1;
    let journalEntries = JSON.parse(localStorage.getItem('journalData')) || [];
    let currentlyEditingCard = null;

    // Helper function to format date
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Initialize the input with serial number and date as value
    const updateEntryTitleInput = () => {
        const currentDate = new Date();
        entryTitleInput.value = `ID${serialNumber}-${formatDate(currentDate)}`;
    };
    updateEntryTitleInput();

    // Function to count words
    const countWords = (text) => {
        const words = text.trim().split(/\s+/);
        return words.length;
    };

    // Function to update word count and background color
    const updateWordCount = () => {
        const text = entryTextInput.value;
        const wordCount = countWords(text);
        wordCountDisplay.textContent = `${wordCount} words`;

        entryTextInput.classList.remove('word-limit-low', 'word-limit-ok', 'word-limit-high');
        if (wordCount < 128) {
            entryTextInput.classList.add('word-limit-low');
        } else if (wordCount <= 256) {
            entryTextInput.classList.add('word-limit-ok');
        } else {
            entryTextInput.classList.add('word-limit-high');
        }
    };

    // Event listener for text input to count words
    entryTextInput.addEventListener('input', () => {
        entryTextInput.value = entryTextInput.value.replace(/"/g, '');
        updateWordCount();
    });

    // Function to save changes when editing
    const saveCardChanges = (card, entry) => {
        const editTitleInput = card.querySelector('.edit-title');
        const editContentTextarea = card.querySelector('.edit-content');
        const cardTitleSpan = card.querySelector('h3 span');
        const cardParagraph = card.querySelector('p');

        if (editTitleInput && editContentTextarea) {
            const newTitle = editTitleInput.value;
            const newContent = editContentTextarea.value;
            const index = journalEntries.findIndex(e => e.id === entry.id);
            
            if (index !== -1) {
                journalEntries[index].title = newTitle;
                journalEntries[index].content = newContent;
                localStorage.setItem('journalData', JSON.stringify(journalEntries));
                
                // Update the displayed content
                cardTitleSpan.innerHTML = newTitle;
                cardParagraph.innerHTML = newContent;
            }
        }
        
        card.classList.remove('editing');
        currentlyEditingCard = null;
    };

    // Function to enter edit mode
    const enterEditMode = (card, entry) => {
        const cardTitleSpan = card.querySelector('h3 span');
        const cardParagraph = card.querySelector('p');
        const titleText = cardTitleSpan.textContent;
        const contentText = cardParagraph.textContent;

        cardTitleSpan.innerHTML = `<input type="text" value="${titleText}" class="edit-title">`;
        cardParagraph.innerHTML = `<textarea class="edit-content">${contentText}</textarea>`;

        const editContentTextarea = card.querySelector('.edit-content');
        editContentTextarea.addEventListener('input', (e) => {
            editContentTextarea.value = editContentTextarea.value.replace(/"/g, '');
        });

        card.classList.add('editing');
        currentlyEditingCard = card;
    };

    /*/ Function to render journal entries
    const renderEntries = () => {
        journalEntriesDiv.innerHTML = '';
        journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(entry => {
            const card = document.createElement('div');
            card.classList.add('journal-card');
            card.innerHTML = `
                <h3>
                    <span>${entry.title}</span>
                    <div class="card-actions">
                        <button class="expand-btn">${card.classList.contains('expanded') ? 'Collapse' : 'Expand'}</button>
                        <button class="edit-btn">Edit</button>
                    </div>
                </h3>
                <p>${entry.content}</p>
            `;

            const expandBtn = card.querySelector('.expand-btn');
            const editBtn = card.querySelector('.edit-btn');

            expandBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                card.classList.toggle('expanded');
                expandBtn.textContent = card.classList.contains('expanded') ? 'Collapse' : 'Expand';
            });

            editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                
                if (currentlyEditingCard && currentlyEditingCard !== card) {
                    // Save changes on the previously edited card before switching
                    const prevEntry = journalEntries.find(e => e.id === currentlyEditingCard.querySelector('.edit-title')?.value.split('-')[0]);
                    if (prevEntry) {
                        saveCardChanges(currentlyEditingCard, prevEntry);
                    }
                }

                if (!card.classList.contains('editing')) {
                    enterEditMode(card, entry);
                } else {
                    saveCardChanges(card, entry);
                }
            });

            journalEntriesDiv.appendChild(card);
        });
    };*/

    const renderEntries = () => {
        journalEntriesDiv.innerHTML = '';
        journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(entry => {
            const card = document.createElement('div');
            card.classList.add('journal-card');
            card.innerHTML = `
                <h3>
                    <span>${entry.title}</span>
                    <div class="card-actions">
                        <button class="expand-btn">Expand</button>
                        <button class="edit-btn">Edit</button>
                    </div>
                </h3>
                <p>${entry.content}</p>
            `;
    
            const expandBtn = card.querySelector('.expand-btn');
            const editBtn = card.querySelector('.edit-btn');
    
            expandBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                card.classList.toggle('expanded');
                expandBtn.textContent = card.classList.contains('expanded') ? 'Collapse' : 'Expand';
                // Optional: if card is collapsed while in edit mode, save changes
                if (!card.classList.contains('expanded') && card.classList.contains('editing')) {
                    saveCardChanges(card, entry);
                }
            });
    
            editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                
                if (currentlyEditingCard && currentlyEditingCard !== card) {
                    const prevEntry = journalEntries.find(e => e.id === currentlyEditingCard.querySelector('.edit-title')?.value.split('-')[0]);
                    if (prevEntry) {
                        saveCardChanges(currentlyEditingCard, prevEntry);
                    }
                }
    
                if (!card.classList.contains('editing')) {
                    enterEditMode(card, entry);
                } else {
                    saveCardChanges(card, entry);
                }
            });
    
            journalEntriesDiv.appendChild(card);
        });
    };

    // Load existing entries on startup
    renderEntries();

    // Publish new entry
    publishBtn.addEventListener('click', () => {
        const titleInputValue = entryTitleInput.value.trim();
        const content = entryTextInput.value.trim();
        let newSerialNumber = serialNumber;

        const match = titleInputValue.match(/^ID(\d+)/);
        if (match) {
            newSerialNumber = parseInt(match[1]);
            serialNumber = newSerialNumber + 1;
        }

        const title = titleInputValue || `ID${newSerialNumber}-${formatDate(new Date())}`;

        if (countWords(content) >= 128 && countWords(content) <= 256) {
            const newEntry = {
                id: `ID${newSerialNumber}`,
                date: new Date().toISOString(),
                title: title,
                content: content
            };
            journalEntries.unshift(newEntry);
            localStorage.setItem('journalData', JSON.stringify(journalEntries));
            localStorage.setItem('journalSerialNumber', serialNumber);
            updateEntryTitleInput();
            entryTextInput.value = '';
            updateWordCount();
            renderEntries();
        } else {
            alert("Entry must be between 128 and 256 words.");
        }
    });

    // Export as JSON
    exportBtn.addEventListener('click', () => {
        const exportData = {};
        journalEntries.forEach(entry => {
            exportData[`${entry.id}-${formatDate(new Date(entry.date))}`] = entry.content;
        });

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal-export-${formatDate(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});