/* ==========================================================
   PORTFOLIO JAVASCRIPT
   Features:
   1. Theme toggle (dark / light) with localStorage memory
   2. Typing animation in hero tagline
   3. Scroll progress bar at top
   4. Animated stat counters
   5. Mobile hamburger menu
   6. Fade-in animation on scroll (IntersectionObserver)
   7. Custom cursor (desktop only)
   8. Mouse-follow glow in hero
   9. 3D card tilt on hover
   10. Letter-by-letter text reveal
   11. Enhanced scroll reveals (slide / scale)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ======================================================
       1. THEME TOGGLE (dark / light mode)
       ====================================================== */

    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Check saved preference, default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
    }

    // Toggle on click and save preference
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');

            if (body.classList.contains('light-mode')) {
                localStorage.setItem('theme', 'light');
            } else {
                localStorage.setItem('theme', 'dark');
            }
        });
    }


    /* ======================================================
       2. TYPING ANIMATION
       Cycles through different roles in the hero tagline
       ====================================================== */

    const typingElement = document.getElementById('typingText');
    const roles = [
        "AI/ML Engineer",
        "Deep Learning Developer",
        "FastAPI Backend Developer",
        "Explainable AI Enthusiast",
        "Python Developer",
        "Machine Learning Engineer"
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 1800;

    function typeEffect() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let delay = isDeleting ? deletingSpeed : typingSpeed;

        if (!isDeleting && charIndex === currentRole.length) {
            delay = pauseTime;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 500;
        }

        setTimeout(typeEffect, delay);
    }

    // Start typing only if the element exists (home page only)
    if (typingElement) {
        typingElement.textContent = '';
        typeEffect();
    }


    /* ======================================================
       3. SCROLL PROGRESS BAR
       Fills the bar at top of page as user scrolls
       ====================================================== */

    const scrollProgress = document.getElementById('scrollProgress');

    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgress.style.width = scrollPercent + '%';
        });
    }


    /* ======================================================
       4. ANIMATED STAT COUNTERS
       Numbers count up from 0 to target when in viewport
       ====================================================== */

    const statNumbers = document.querySelectorAll('.stat-number');

    const countUp = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const steps = 60;
        const stepValue = target / steps;
        const stepTime = duration / steps;
        let current = 0;

        const counter = setInterval(() => {
            current += stepValue;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(counter);
            } else {
                element.textContent = Math.floor(current);
            }
        }, stepTime);
    };

    if (statNumbers.length > 0) {
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => statObserver.observe(stat));
    }


    /* ======================================================
       5. MOBILE HAMBURGER MENU
       ====================================================== */

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }


    /* ======================================================
       6. FADE-IN ANIMATION ON SCROLL
       Elements slide up + fade in when entering viewport
       ====================================================== */

    const fadeObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, fadeObserverOptions);

    const elementsToAnimate = document.querySelectorAll(
        'section, .fact-card'
    );

    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        fadeObserver.observe(el);
    });


    /* ======================================================
       7. CUSTOM CURSOR (desktop only)
       ====================================================== */

    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
        document.body.classList.add('custom-cursor-active');

        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        // Ring lags behind for smooth trailing effect
        function animateRing() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Expand cursor over clickable elements
        const hoverables = document.querySelectorAll(
            'a, button, .project-card, .skill-category, .stat-card, .fact-card'
        );
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hover');
                cursorRing.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hover');
                cursorRing.classList.remove('hover');
            });
        });
    }


    /* ======================================================
       8. MOUSE-FOLLOW GLOW IN HERO
       ====================================================== */

    const hero = document.querySelector('.hero');
    const mouseGlow = document.getElementById('mouseGlow');

    if (hero && mouseGlow) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            mouseGlow.style.left = x + 'px';
            mouseGlow.style.top = y + 'px';
        });
    }


    /* ======================================================
       9. 3D CARD TILT
       Cards tilt toward cursor on hover
       ====================================================== */

    const tiltCards = document.querySelectorAll(
        '.project-card, .skill-category, .stat-card, .fact-card'
    );

    tiltCards.forEach(card => {
        card.classList.add('tiltable');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const tiltX = ((y - centerY) / centerY) * -8;
            const tiltY = ((x - centerX) / centerX) * 8;

            card.style.setProperty('--tilt-x', `${tiltX}deg`);
            card.style.setProperty('--tilt-y', `${tiltY}deg`);
            card.style.setProperty('--tilt-lift', '-6px');
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
            card.style.setProperty('--tilt-lift', '0');
        });
    });


    /* ======================================================
       10. LETTER-BY-LETTER TEXT REVEAL
       Splits text into individual chars and animates each
       ====================================================== */

    function splitTextIntoChars(element) {
        // Keep gradient words whole so the gradient stays visible
        if (element.classList.contains('gradient-text')) return;
        const text = element.textContent;
        element.textContent = '';
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.transitionDelay = `${i * 40}ms`;
            element.appendChild(span);
        });
    }

    const revealTexts = document.querySelectorAll('.reveal-text');
    revealTexts.forEach(el => splitTextIntoChars(el));

    // Trigger reveal sequentially on page load
    setTimeout(() => {
        revealTexts.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('revealed');
            }, index * 200);
        });
    }, 200);


    /* ======================================================
       11. ENHANCED SCROLL REVEALS
       Apply slide-left, slide-right, scale-in to cards
       ====================================================== */

    const enhancedRevealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const enhancedObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                enhancedObserver.unobserve(entry.target);
            }
        });
    }, enhancedRevealOptions);

    // Project cards: alternate left / right slides
    document.querySelectorAll('.project-card').forEach((card, i) => {
        card.classList.remove('fade-in');
        card.classList.add(i % 2 === 0 ? 'slide-left' : 'slide-right');
        enhancedObserver.observe(card);
    });

    // Skill cards: scale in
    document.querySelectorAll('.skill-category').forEach(card => {
        card.classList.remove('fade-in');
        card.classList.add('scale-in');
        enhancedObserver.observe(card);
    });

    // Stat cards: scale in
    document.querySelectorAll('.stat-card').forEach(card => {
        card.classList.remove('fade-in');
        card.classList.add('scale-in');
        enhancedObserver.observe(card);
    });

    // Fact cards: scale in
    document.querySelectorAll('.fact-card').forEach(card => {
        card.classList.remove('fade-in');
        card.classList.add('scale-in');
        enhancedObserver.observe(card);
    });


    /* ======================================================
       12. CERTIFICATE FILTERS
       Filter cards by category when buttons clicked
       ====================================================== */

    const filterButtons = document.querySelectorAll('.filter-btn');
    const certCards = document.querySelectorAll('.cert-card');

    if (filterButtons.length > 0 && certCards.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                // Show/hide cards
                certCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    /* ======================================================
       13. PUBLICATION CITATION COPY
       Copies the full citation to clipboard when "Copy Citation"
       button is clicked
       ====================================================== */

    const citeBtn = document.getElementById('citeBtn');
    const citeBtnText = document.getElementById('citeBtnText');

    if (citeBtn && citeBtnText) {
        citeBtn.addEventListener('click', async () => {
            const citation = citeBtn.getAttribute('data-citation');
            try {
                await navigator.clipboard.writeText(citation);
                const originalText = citeBtnText.textContent;
                citeBtnText.textContent = 'Copied!';
                setTimeout(() => {
                    citeBtnText.textContent = originalText;
                }, 2000);
            } catch (err) {
                citeBtnText.textContent = 'Copy failed';
                setTimeout(() => {
                    citeBtnText.textContent = 'Copy Citation';
                }, 2000);
            }
        });
    }


    /* ======================================================
       14. PROJECT IMAGE CAROUSEL
       Each project card has its own independent carousel
       with prev/next buttons, dots, swipe support
       ====================================================== */

    const carousels = document.querySelectorAll('[data-carousel]');

    carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        let currentIndex = 0;

        if (slides.length === 0) return;

        const goToSlide = (index) => {
            // Wrap around if out of bounds
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));

            slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');

            currentIndex = index;
        };

        // Prev/Next button clicks
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                goToSlide(currentIndex - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                goToSlide(currentIndex + 1);
            });
        }

        // Dot clicks
        dots.forEach((dot, i) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                goToSlide(i);
            });
        });

        // Touch swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) > 50) {
                if (swipeDistance > 0) {
                    goToSlide(currentIndex - 1);
                } else {
                    goToSlide(currentIndex + 1);
                }
            }
        }, { passive: true });
    });

});