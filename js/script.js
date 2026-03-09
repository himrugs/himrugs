/* 
    HimRugs - Complete App Logic
    Features: Firebase Integration, Forms, Welcome Screen, Timer, Animations
*/

import { 
    submitDesignRequest, 
    isValidEmail 
} from './firebase-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize form handlers (index.html and contact.html)
    initFormSubmission();
    
    // 1. Welcome Screen Logic
    const welcomeScreen = document.getElementById('welcome-screen');
    const welcomeText = document.getElementById('welcome-text');
    const languages = [
        { text: "Welcome", lang: "English", script: "latin" },
        { text: "नमस्ते", lang: "Hindi", script: "devanagari" },
        { text: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", lang: "Punjabi", script: "gurmukhi" },
        { text: "خوش آمدید", lang: "Urdu", script: "arabic" },
        { text: "स्वागतं", lang: "Sanskrit", script: "devanagari" }
    ];

    if (welcomeScreen) {
        let langIndex = 0;
        
        // Function to get responsive font size
        function getResponsiveFontSize() {
            const width = window.innerWidth;
            if (width < 480) return 2.5; // Mobile
            if (width < 768) return 3.2; // Tablet
            return 4.5; // Desktop
        }
        
        // Function to apply font styling
        function applyFontStyling(langObj, isInitial = false) {
            let fontSize = getResponsiveFontSize();
            let letterSpacing = '12px';
            let fontFamily = 'Georgia, serif';
            
            welcomeText.style.fontWeight = '400';
            welcomeText.style.textAlign = 'center';
            welcomeText.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            
            if (langObj.script === "devanagari") {
                fontFamily = '"Noto Serif Devanagari", "Noto Sans Devanagari", Georgia, serif';
                fontSize = fontSize * 0.95;
                letterSpacing = '6px';
            } else if (langObj.script === "gurmukhi") {
                fontFamily = '"Noto Sans Gurmukhi", Georgia, serif';
                fontSize = fontSize * 0.92;
                letterSpacing = '4px';
            } else if (langObj.script === "arabic") {
                fontFamily = '"Noto Sans Arabic", Georgia, serif';
                fontSize = fontSize * 0.88;
                letterSpacing = '8px';
                welcomeText.style.direction = 'rtl';
            } else {
                fontFamily = '"Georgia", "Garamond", serif';
                fontSize = fontSize;
                letterSpacing = '12px';
                welcomeText.style.direction = 'ltr';
            }
            
            welcomeText.style.fontFamily = fontFamily;
            welcomeText.style.fontSize = fontSize + 'rem';
            welcomeText.style.letterSpacing = letterSpacing;
            welcomeText.style.lineHeight = '1.4';
        }
        
        // Set initial text and styling
        welcomeText.innerText = languages[0].text;
        welcomeText.style.opacity = '1';
        applyFontStyling(languages[0], true);
        
        const interval = setInterval(() => {
            langIndex++;
            if (langIndex < languages.length) {
                welcomeText.style.opacity = '0';
                welcomeText.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    const current = languages[langIndex];
                    welcomeText.innerText = current.text;
                    applyFontStyling(current);
                    welcomeText.style.opacity = '1';
                    welcomeText.style.transform = 'scale(1)';
                }, 250);
            }
        }, 1200);

        setTimeout(() => {
            clearInterval(interval);
            welcomeScreen.style.opacity = '0';
            welcomeScreen.style.transition = 'opacity 0.8s ease';
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 800);
        }, 6500);
        
        // Handle resize for responsive font
        window.addEventListener('resize', () => {
            if (welcomeScreen && welcomeScreen.style.display !== 'none') {
                applyFontStyling(languages[langIndex]);
            }
        });
    }

    // 2. Live Timer Logic (10 PM to 10 PM)
    function updateTimer() {
        const now = new Date();
        const target = new Date();
        
        // Set target to 10:00 PM (22:00)
        target.setHours(22, 0, 0, 0);

        // If it's already past 10 PM today, target is 10 PM tomorrow
        if (now.getHours() >= 22) {
            target.setDate(target.getDate() + 1);
        }

        const diff = target - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const display = document.getElementById('timer-display');
        if (display) {
            display.innerText = `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
        }
    }

    setInterval(updateTimer, 1000);
    updateTimer();

    // 3. Form Submission to Firebase (index.html and contact.html)
    const requestForm = document.getElementById('rug-request-form');
    const successPopup = document.getElementById('success-popup');
    const closePopup = document.querySelector('.close-popup');

    if (requestForm) {
        requestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = requestForm.querySelector('[name="name"]')?.value.trim() || '';
            const contact = requestForm.querySelector('[name="contact"]')?.value.trim() || '';
            const email = requestForm.querySelector('[name="email"]')?.value.trim() || '';
            const address = requestForm.querySelector('[name="address"]')?.value.trim() || '';
            
            // Validate
            if (!name || !contact || !email || !address) {
                showFormAlert('❌ Please fill all required fields', 'error', requestForm);
                return;
            }
            
            // Validate email
            if (!isValidEmail(email)) {
                showFormAlert('❌ Please enter a valid email address', 'error', requestForm);
                return;
            }
            
            try {
                // Submit to Firebase
                await submitDesignRequest(name, contact, email, address);
                
                // Show success popup
                if (successPopup) {
                    successPopup.style.display = 'flex';
                }
                
                // Reset form
                requestForm.reset();
                
                // Log success
                console.log('✅ Request submitted successfully');
            } catch (error) {
                console.error('Form submission error:', error);
                showFormAlert('❌ ' + error.message, 'error', requestForm);
            }
        });
    }

    if (closePopup) {
        closePopup.addEventListener('click', () => {
            successPopup.style.display = 'none';
        });
    }

    // Close popup on outside click
    window.addEventListener('click', (e) => {
        if (e.target === successPopup) {
            successPopup.style.display = 'none';
        }
    });

    // 4. Scroll Animations (Fade Up)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.info-card, .media-item, .premium-title, .custom-text, .founder-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });

    // CSS for the animation trigger
    const style = document.createElement('style');
    style.innerHTML = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // 5. Navbar Mobile Menu Toggle & Functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    // Toggle Mobile Menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close Mobile Menu on Link Click
    navItems.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Set Active Link Based on Current Page
    function setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        navItems.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    setActiveLink();

    // Close Menu When Clicking Outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.glass-nav')) {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // 6. Navbar Scroll Effect with Enhanced Mobile Support
    const nav = document.querySelector('.glass-nav');
    let lastScrollY = 0;
    
    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        
        if (window.scrollY > 50) {
            nav.style.padding = '10px 0';
            nav.style.background = 'rgba(10, 25, 47, 0.95)';
            nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            nav.style.padding = '20px 0';
            nav.style.background = 'rgba(255, 255, 255, 0.05)';
            nav.style.boxShadow = 'none';
        }
    });

    // Handle Resize Event - Close Menu on Desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Prevent Body Scroll When Mobile Menu is Open
    const htmlElement = document.documentElement;
    original_overflow = htmlElement.style.overflow;
    
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    const observer_menu = new MutationObserver(() => {
        if (navLinks.classList.contains('active')) {
            htmlElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            htmlElement.style.overflow = original_overflow;
            document.body.style.overflow = 'auto';
        }
    });

    observer_menu.observe(navLinks, { attributes: true, attributeFilter: ['class'] });
});

// ========== FORM UTILITIES ==========
function showFormAlert(message, type = 'success', form) {
    const alertDiv = document.createElement('div');
    
    if (type === 'success') {
        alertDiv.style.cssText = `
            background: #d1fae5;
            border: 2px solid #6ee7b7;
            color: #065f46;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: bold;
            animation: slideIn 0.3s ease;
        `;
    } else {
        alertDiv.style.cssText = `
            background: #fee2e2;
            border: 2px solid #fca5a5;
            color: #991b1b;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: bold;
            animation: slideIn 0.3s ease;
        `;
    }
    
    alertDiv.textContent = message;
    
    if (form) {
        form.parentNode.insertBefore(alertDiv, form);
    }
    
    setTimeout(() => alertDiv.remove(), 5000);
}

// Initialize form submission (called from DOMContentLoaded)
function initFormSubmission() {
    // This function is called early to setup form handlers
    // Actual form handling is done in the DOMContentLoaded event
    console.log('✅ Form submission initialized');
}

console.log('%c✅ HimRugs App Ready!', 'color: green; font-weight: bold; font-size: 14px;');
