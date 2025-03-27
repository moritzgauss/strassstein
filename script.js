const card = document.querySelector('.card');
let isDragging = false;
let startX, startY;
let rotateX = 0;
let rotateY = 0;

// Handle mouse down
card.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX - rotateY;
    startY = e.pageY - rotateX;
    card.style.transition = 'none'; // Remove transition while dragging
});

// Handle mouse move
document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    
    rotateY = e.pageX - startX;
    rotateX = e.pageY - startY;
    
    // Limit rotation to reasonable angles
    rotateX = Math.max(-45, Math.min(45, rotateX));
    rotateY = Math.max(-45, Math.min(45, rotateY));
    
    updateCardRotation();
});

// Handle mouse up
document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    
    // Animate back to default position
    card.style.transition = 'transform 0.5s ease-out';
    rotateX = 0;
    rotateY = 0;
    updateCardRotation();
});

// Update card rotation
function updateCardRotation() {
    const isFlipped = card.classList.contains('is-flipped');
    const baseRotation = isFlipped ? 'rotateY(180deg)' : '';
    card.style.transform = `${baseRotation} rotateX(${-rotateX * 0.5}deg) rotateY(${rotateY * 0.5}deg)`;
}

// Handle card flip with click
card.addEventListener('click', () => {
    if (!isDragging) {
        card.classList.toggle('is-flipped');
        updateCardRotation();
    }
});

// Prevent drag effect when clicking links
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
        if (isDragging) {
            e.preventDefault();
        }
    });
});