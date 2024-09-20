document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab-header .tab');
    const contents = document.querySelectorAll('.tab-content .content');
    const slider = document.querySelector('.mobile-slider');

    // Lógica de abas para desktop
    if (window.innerWidth > 768) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                contents.forEach(content => content.classList.remove('active'));
                const tabNumber = tab.getAttribute('data-tab');
                document.getElementById(`tab-${tabNumber}`).classList.add('active');
            });
        });
    } else {
        // Lógica de "arrastar para o lado" para mobile
        let startX;
        let currentX;
        let isDragging = false;

        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        slider.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            slider.scrollLeft += startX - currentX;
        });

        slider.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
});

function goToPerfil() {
    window.location.href = '../perfil/index.html'; 
}
