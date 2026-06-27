/*
   ==========================================================================
   INTERACCIONES DINÁMICAS - WEB TRIBUTO DE CUMPLEAÑOS DE MAICOL
   ==========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // --- VARIABLES DE ELEMENTOS DEL DOM ---
    const btnEntrar = document.getElementById('btn-entrar');
    const introOverlay = document.getElementById('intro-overlay');
    const mainContent = document.getElementById('main-content');
    const musicWidget = document.getElementById('music-widget');
    const bgMusic = document.getElementById('bg-music');
    const btnTogglePlay = document.getElementById('btn-toggle-play');
    const musicDisc = document.getElementById('music-disc');
    const playIcon = document.getElementById('play-icon');
    const btnBurstConfetti = document.getElementById('btn-burst-confetti');
    
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const clickHint = document.getElementById('click-hint');
    
    // Lightbox variables
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');
    const galleryCards = document.querySelectorAll('.gallery-card');

    let isPlaying = false;
    let galleryImages = [];
    let currentImageIndex = 0;

    // Poblar array de imágenes de la galería para navegación
    galleryCards.forEach((card, index) => {
        const src = card.getAttribute('data-src');
        galleryImages.push(src);
        card.addEventListener('click', () => openLightbox(index));
    });

    // --- SISTEMA DE CONFETI EN CANVAS ---
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let confetti = [];
    const colors = [
        '#dfb76c', // Oro principal
        '#f7d697', // Oro brillante
        '#b89047', // Oro oscuro
        '#ffffff', // Blanco brillo
        '#e2e8f0', // Plata suave
        '#ffd700', // Oro puro
        '#ffaa00'  // Naranja festivo
    ];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class ConfettiParticle {
        constructor(x, y, isBurst = false) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            if (isBurst) {
                // Dirección radial para explosiones
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 8 + 3;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed - Math.random() * 4; // Impulso hacia arriba
            } else {
                // Caída natural
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 3 + 2;
            }
            
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
            this.opacity = 1;
            this.fadeSpeed = isBurst ? Math.random() * 0.015 + 0.005 : 0;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            
            if (this.fadeSpeed > 0) {
                this.opacity -= this.fadeSpeed;
            } else {
                // Caída continua, si sale de la pantalla se resetea arriba
                if (this.y > canvas.height) {
                    this.y = -20;
                    this.x = Math.random() * canvas.width;
                    this.opacity = 1;
                }
            }
        }

        draw() {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            
            // Dibujar forma rectangular/rombo de confeti
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 1.5);
            
            ctx.restore();
        }
    }

    function initConfetti() {
        // Crear confeti de fondo inicial (caída continua)
        for (let i = 0; i < 70; i++) {
            confetti.push(new ConfettiParticle(Math.random() * canvas.width, Math.random() * canvas.height));
        }
    }

    function burstConfetti(count, x = canvas.width / 2, y = canvas.height / 2) {
        for (let i = 0; i < count; i++) {
            confetti.push(new ConfettiParticle(x, y, true));
        }
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Filtrar partículas desvanecidas
        confetti = confetti.filter(p => p.opacity > 0);
        
        confetti.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animateConfetti);
    }

    // --- ACCIÓN DE ENTRADA (BIENVENIDA) ---
    btnEntrar.addEventListener('click', () => {
        // Reproducir música
        playMusic();
        
        // Ocultar Overlay con animación
        introOverlay.classList.add('fade-out');
        
        // Mostrar contenido
        mainContent.classList.remove('hidden');
        musicWidget.classList.remove('hidden');
        
        // Lanzar lluvia masiva de confeti de celebración
        initConfetti();
        burstConfetti(120, canvas.width / 2, canvas.height * 0.7);
        
        // Activar animaciones iniciales en scroll
        setTimeout(() => {
            triggerAnimations();
        }, 100);
    });

    // --- CONTROL DE AUDIO/MÚSICA ---
    function playMusic() {
        bgMusic.play().then(() => {
            isPlaying = true;
            musicDisc.classList.add('playing');
            btnTogglePlay.innerHTML = '<i data-lucide="pause"></i>';
            document.querySelector('.music-status').textContent = 'Reproduciendo...';
            lucide.createIcons();
        }).catch(err => {
            console.log("Error al reproducir audio de forma automática:", err);
            isPlaying = false;
        });
    }

    function pauseMusic() {
        bgMusic.pause();
        isPlaying = false;
        musicDisc.classList.remove('playing');
        btnTogglePlay.innerHTML = '<i data-lucide="play"></i>';
        document.querySelector('.music-status').textContent = 'Pausado';
        lucide.createIcons();
    }

    btnTogglePlay.addEventListener('click', () => {
        if (isPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    });

    // Burst confetti manual
    btnBurstConfetti.addEventListener('click', (e) => {
        const rect = btnBurstConfetti.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        burstConfetti(80, x, y);
    });

    // --- CONTROL DE LA CARTA INTERACTIVA ---
    let letterOpened = false;
    envelopeWrapper.addEventListener('click', () => {
        if (!letterOpened) {
            envelopeWrapper.classList.add('open');
            clickHint.innerHTML = '<i data-lucide="mail"></i> Haz clic en el sobre para guardar la carta';
            letterOpened = true;
            
            // Explosión de confeti desde el sobre
            const rect = envelopeWrapper.getBoundingClientRect();
            burstConfetti(40, rect.left + rect.width / 2, rect.top + rect.height / 3);
        } else {
            envelopeWrapper.classList.remove('open');
            clickHint.innerHTML = '<i data-lucide="mouse-pointer-click"></i> Haz clic en el sobre para abrir';
            letterOpened = false;
        }
        lucide.createIcons();
    });

    // --- LÓGICA DE LIGHTBOX DE LA GALERÍA ---
    function openLightbox(index) {
        currentImageIndex = index;
        lightboxImg.src = galleryImages[currentImageIndex];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Habilitar scroll
    }

    function navigateGallery(direction) {
        currentImageIndex = (currentImageIndex + direction + galleryImages.length) % galleryImages.length;
        lightboxImg.src = galleryImages[currentImageIndex];
    }

    lightboxClose.addEventListener('click', closeLightbox);
    
    // Cerrar al hacer clic en el fondo del lightbox
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            if (e.target !== lightboxImg && e.target !== btnPrev && e.target !== btnNext) {
                closeLightbox();
            }
        }
    });

    btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateGallery(-1);
    });

    btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateGallery(1);
    });

    // Atajos de teclado para Lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            navigateGallery(1);
        } else if (e.key === 'ArrowLeft') {
            navigateGallery(-1);
        }
    });

    // --- ANIMACIONES DE APARICIÓN AL HACER SCROLL (INTERSECTION OBSERVER) ---
    function triggerAnimations() {
        const itemsToAnimate = document.querySelectorAll('.animate-item, .timeline-item');
        
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('timeline-item')) {
                        entry.target.classList.add('appear');
                        // Efecto confeti sutil al revelar la tarjeta de cumpleaños de 22 años
                        if (entry.target.querySelector('.timeline-tag')?.textContent === 'HOY') {
                            const rect = entry.target.getBoundingClientRect();
                            burstConfetti(25, rect.left + rect.width / 2, rect.top + rect.height / 2);
                        }
                    } else {
                        entry.target.classList.add('appear');
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        itemsToAnimate.forEach(item => {
            observer.observe(item);
        });
        
        // Agregar clases para retrasos secuenciales de elementos iniciales
        const heroItems = document.querySelectorAll('.hero-section .animate-item');
        heroItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.15}s`;
            item.classList.add('appear');
        });
    }

    // Iniciar loop de confeti
    animateConfetti();
});
