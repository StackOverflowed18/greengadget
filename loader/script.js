// script.js

// Using 'DOMContentLoaded' for initial HTML load, but 'load' is better for full page load including assets
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');

    // Add a class to hide the preloader with a fade-out effect
    preloader.classList.add('hide-preloader');

    // After the transition ends, remove the preloader from the DOM completely
    preloader.addEventListener('transitionend', function() {
        preloader.style.display = 'none'; // Completely hide it
        mainContent.style.display = 'block'; // Show the main content
    });

    // Fallback in case transitionend event doesn't fire or for slower browsers
    // This ensures the content shows up even if the fade effect has issues.
    setTimeout(() => {
        if (preloader.style.display !== 'none') {
            preloader.style.display = 'none';
            mainContent.style.display = 'block';
        }
    }, 5000); // After 1 second, ensure it's hidden and content is shown
});