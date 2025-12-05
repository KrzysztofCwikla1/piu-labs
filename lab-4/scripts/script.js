const LS_KEY = 'kanban-data';

function randomColor() {
    return `hsl(${Math.random() * 360}, 70%, 80%)`;
}
function rgbToHex(rgb) {
    if (!rgb) return '#ffffff';
    const result = rgb.match(/\d+/g);
    if (!result) return '#ffffff';

    return (
        '#' +
        result
            .slice(0, 3)
            .map((x) => parseInt(x).toString(16).padStart(2, '0'))
            .join('')
    );
}
function saveBoard() {
    const data = {};

    document.querySelectorAll('.column').forEach((col) => {
        const colId = col.dataset.column;
        data[colId] = [];

        col.querySelectorAll('.card').forEach((card) => {
            data[colId].push({
                id: card.dataset.id,
                text: card.querySelector('.text').innerText,
                color: card.style.background,
            });
        });
    });

    localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function loadBoard() {
    const data = JSON.parse(localStorage.getItem(LS_KEY));
    if (!data) return;

    for (const colId in data) {
        const column = document.querySelector(
            `.column[data-column="${colId}"] .cards`
        );
        data[colId].forEach((card) => {
            createCard(column, card.text, card.color, card.id);
        });
    }
}

function createCard(
    container,
    text = 'Nowa karta',
    color = randomColor(),
    id = Date.now()
) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.background = color;
    card.dataset.id = id;

    card.innerHTML = `
        <span class="remove">x</span>
        <div class="text" contenteditable="true">${text}</div>
        <span class="move left">←</span>
        <span class="move right">→</span>
        <button class="recolor">Wybierz kolor</button>
    `;

    container.appendChild(card);
    updateCounts();
    saveBoard();
}

function updateCounts() {
    document.querySelectorAll('.column').forEach((col) => {
        const count = col.querySelectorAll('.card').length;
        col.querySelector('.count').innerText = `(${count})`;
    });
}

document.querySelectorAll('.add-card').forEach((btn) => {
    btn.addEventListener('click', () => {
        const col = btn.closest('.column').querySelector('.cards');
        createCard(col);
    });
});

document.querySelectorAll('.column').forEach((column) => {
    column.addEventListener('click', (e) => {
        const cardsContainer = column.querySelector('.cards');

        if (e.target.classList.contains('remove')) {
            e.target.closest('.card').remove();
            updateCounts();
            saveBoard();
        }

        if (e.target.classList.contains('left')) {
            const card = e.target.closest('.card');

            if (column.dataset.column === 'todo') {
                document
                    .querySelector('.column[data-column="done"] .cards')
                    .appendChild(card);
            } else if (column.dataset.column === 'inprogress') {
                document
                    .querySelector('.column[data-column="todo"] .cards')
                    .appendChild(card);
            } else if (column.dataset.column === 'done') {
                document
                    .querySelector('.column[data-column="inprogress"] .cards')
                    .appendChild(card);
            }

            updateCounts();
            saveBoard();
        }

        if (e.target.classList.contains('right')) {
            const card = e.target.closest('.card');

            if (column.dataset.column === 'todo') {
                document
                    .querySelector('.column[data-column="inprogress"] .cards')
                    .appendChild(card);
            } else if (column.dataset.column === 'inprogress') {
                document
                    .querySelector('.column[data-column="done"] .cards')
                    .appendChild(card);
            } else if (column.dataset.column === 'done') {
                document
                    .querySelector('.column[data-column="todo"] .cards')
                    .appendChild(card);
            }

            updateCounts();
            saveBoard();
        }

        if (e.target.classList.contains('recolor')) {
            const card = e.target.closest('.card');

            const picker = document.createElement('input');
            picker.type = 'color';
            picker.value = rgbToHex(card.style.background);

            picker.addEventListener('input', () => {
                card.style.background = picker.value;
                saveBoard();
            });

            picker.click();
        }
    });

    column.querySelector('.color-column').addEventListener('click', () => {
        column.querySelectorAll('.card').forEach((card) => {
            card.style.background = randomColor();
        });
        saveBoard();
    });

    column.querySelector('.sort-cards').addEventListener('click', () => {
        const cardsContainer = column.querySelector('.cards');
        let cards = [...cardsContainer.querySelectorAll('.card')];

        cards.sort((a, b) =>
            a
                .querySelector('.text')
                .innerText.localeCompare(b.querySelector('.text').innerText)
        );

        cards.forEach((c) => cardsContainer.appendChild(c));
        saveBoard();
    });
});

document.addEventListener('input', (e) => {
    if (e.target.classList.contains('text')) {
        saveBoard();
    }
});

loadBoard();
updateCounts();
