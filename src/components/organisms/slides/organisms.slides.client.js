// src/components/organisms/slides/organisms.slides.client.js

export const client = (root) => {
    const container = root.querySelector('.slides-container');
    const slides = root.querySelectorAll('.slide');
    const prevBtn = root.querySelector('.slide-btn.prev');
    const nextBtn = root.querySelector('.slide-btn.next');
    const currentIndicator = root.querySelector('.current');
    const currentTitle = root.querySelector('.current-title');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    /**
     * Navigate to a specific slide
     */
    const goToSlide = (index) => {
        // Clamp index between 0 and totalSlides - 1
        currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
        
        // Update active slide
        slides.forEach((slide, i) => {
            if (i === currentSlide) {
                slide.classList.add('active');
                slide.setAttribute('aria-hidden', 'false');
            } else {
                slide.classList.remove('active');
                slide.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Update indicators
        currentIndicator.textContent = currentSlide + 1;
        
        // Update title for screen readers
        const slideTitle = slides[currentSlide].getAttribute('aria-label');
        if (currentTitle) {
            currentTitle.textContent = slideTitle.split(':')[1]?.trim();
        }
        
        // Update button states
        updateButtonStates();
        
        // Scroll to top of slide
        slides[currentSlide].scrollIntoView({ behavior: 'smooth' });
    };
    
    /**
     * Update button disabled states
     */
    const updateButtonStates = () => {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    };
    
    /**
     * Navigate to next slide
     */
    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        }
    };
    
    /**
     * Navigate to previous slide
     */
    const prevSlide = () => {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    };
    
    // ============================================
    // Event Listeners
    // ============================================
    
    /**
     * Button click handlers
     */
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
    });
    
    /**
     * Keyboard navigation
     */
    const handleKeyboard = (e) => {
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
            case 'n': // vim-style navigation
                e.preventDefault();
                nextSlide();
                break;
            
            case 'ArrowLeft':
            case 'p': // vim-style navigation
                e.preventDefault();
                prevSlide();
                break;
            
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
        }
    };
    
    document.addEventListener('keydown', handleKeyboard);
    
    /**
     * Swipe support (mobile)
     */
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleSwipe = () => {
        if (touchEndX < touchStartX - 50) {
            // Swiped left → next slide
            nextSlide();
        }
        if (touchEndX > touchStartX + 50) {
            // Swiped right → previous slide
            prevSlide();
        }
    };
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    // ============================================
    // Presentation Mode (Optional: Fullscreen)
    // ============================================
    
    /**
     * Enter fullscreen presentation mode
     */
    const enterPresentationMode = () => {
        if (root.requestFullscreen) {
            root.requestFullscreen();
        } else if (root.webkitRequestFullscreen) {
            root.webkitRequestFullscreen();
        }
    };
    
    // Optional: Double-click to enter fullscreen (or add button)
    root.addEventListener('dblclick', () => {
        enterPresentationMode();
    });
    
    // ============================================
    // Initialization
    // ============================================
    
    // Initialize first slide and button states
    goToSlide(0);
    
    // ============================================
    // Cleanup Function
    // ============================================
    
    return () => {
        document.removeEventListener('keydown', handleKeyboard);
        container.removeEventListener('touchstart', null);
        container.removeEventListener('touchend', null);
        prevBtn.removeEventListener('click', null);
        nextBtn.removeEventListener('click', null);
    };
};
