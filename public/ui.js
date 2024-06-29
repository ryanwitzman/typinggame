const textDisplay = document.createElement('div');
textDisplay.id = 'text-display';
document.body.appendChild(textDisplay);

let currentText = '';
let typedText = '';

export function updateParagraphDisplay(paragraph) {
    currentText = paragraph;
    typedText = '';
    renderText();
}

function renderText() {
    let html = '';
    for (let i = 0; i < currentText.length; i++) {
        if (i < typedText.length) {
            if (typedText[i] === currentText[i]) {
                html += `<span class="correct">${currentText[i]}</span>`;
            } else {
                html += `<span class="incorrect">${currentText[i]}</span>`;
            }
        } else {
            html += `<span class="untyped">${currentText[i]}</span>`;
        }
    }
    textDisplay.innerHTML = html;
}

export function handleUserInput(event) {
    const key = event.key;
    if (key === 'Backspace') {
        typedText = typedText.slice(0, -1);
    } else if (key.length === 1) {
        if (typedText.length < currentText.length && key === currentText[typedText.length]) {
            typedText += key;
        }
    }
    renderText();
}

export function getProgress() {
    return (typedText.length / currentText.length) * 100;
}
