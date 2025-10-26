function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    const icon = document.getElementById('theme-icon');
    
    html.setAttribute('data-theme', newTheme);
    icon.textContent = newTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
    
    localStorage.setItem('theme', newTheme);
}

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('theme-icon').textContent = 
    savedTheme === 'dark' ? 'Dark Mode' : 'Light Mode';