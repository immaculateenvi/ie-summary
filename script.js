// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Animate hamburger to X
        const spans = menuToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Set active nav link based on scroll position
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let currentSectionId = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 80;
        const sectionHeight = section.clientHeight;
        
        if(window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSectionId = '#' + section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === currentSectionId) {
            link.classList.add('active');
        }
    });
});

// Online/Offline Status
const offlineStatus = document.getElementById('offlineStatus');
const offlineInfo = document.getElementById('offlineInfo');

function updateOnlineStatus() {
    if (offlineStatus) {
        const statusText = offlineStatus.querySelector('span');
        const statusIcon = offlineStatus.querySelector('i');
        
        if (navigator.onLine) {
            statusText.textContent = 'Online';
            statusIcon.className = 'fas fa-wifi';
            offlineStatus.style.color = '#27ae60';
            if (offlineInfo) offlineInfo.style.display = 'none';
        } else {
            statusText.textContent = 'Offline';
            statusIcon.className = 'fas fa-wifi-slash';
            offlineStatus.style.color = '#e74c3c';
            if (offlineInfo) offlineInfo.style.display = 'block';
        }
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus(); // Initial check

// Clear Cache Button
const clearCacheBtn = document.getElementById('clearCache');
if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', async () => {
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                alert('Cache cleared successfully! The app will reload.');
                window.location.reload();
            } catch (error) {
                console.error('Error clearing cache:', error);
                alert('Error clearing cache. Please try again.');
            }
        } else {
            alert('Cache API not supported in this browser.');
        }
    });
}

// Add current year to footer
document.addEventListener('DOMContentLoaded', function() {
    // Update copyright year
    const yearSpans = document.querySelectorAll('.current-year');
    if(yearSpans.length > 0) {
        yearSpans.forEach(span => {
            span.textContent = new Date().getFullYear();
        });
    }
    
    // Add loading animation to course cards
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
    });
    
    // Initialize service worker for offline functionality
    initServiceWorker();
});

// Service Worker Registration
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registered: ', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('ServiceWorker update found!');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New update available
                            if (confirm('A new version is available. Reload to update?')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
        });
        
        // Listen for controller change (when a new service worker takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service worker controller changed');
        });
    }
}

// Save user preferences to localStorage
function saveUserPreference(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

function getUserPreference(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
}

// Example: Save last visited page
window.addEventListener('beforeunload', () => {
    saveUserPreference('lastVisited', window.location.href);
});

// Check storage quota
function checkStorage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
            const used = estimate.usage;
            const total = estimate.quota;
            const percentage = (used / total * 100).toFixed(2);
            console.log(`Storage used: ${formatBytes(used)} of ${formatBytes(total)} (${percentage}%)`);
        });
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Check storage on load
setTimeout(checkStorage, 1000);
[file content end]