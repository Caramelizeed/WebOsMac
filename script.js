let currentZIndex = 10;
const windowStates = {};

function makeDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    if (!elmnt) return;
    
    const header = elmnt.querySelector('.window-header');
    if (!header) return;
    
    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        
        bringToFront(elmnt.id);
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
       const newTop = elmnt.offsetTop - pos2;
        const newLeft = elmnt.offsetLeft - pos1;
        
        if (newTop > -30 && newTop < window.innerHeight - 50) {
            elmnt.style.top = newTop + "px";
        }
        
        if (newLeft > -elmnt.offsetWidth + 100 && newLeft < window.innerWidth - 100) {
            elmnt.style.left = newLeft + "px";
        }
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    document.getElementById('clock').textContent = timeString;
}
setInterval(updateClock, 60000);
updateClock(); 

function openFileExplorer() {
    openWindow('file-explorer-container');
    updateActiveAppIcons('file-explorer');
}

function openBrowser() {
    openWindow('browser-container');
    updateActiveAppIcons('browser');
    navigateBrowserTo('https://www.google.com');
}

function openTerminal() {
    openWindow('terminal-container');
    document.getElementById('terminal-input').focus();
    updateActiveAppIcons('terminal');
}

function openWindow(id) {
    const window = document.getElementById(id);
    if (!window) return;
    if (!windowStates[id]) {
        windowStates[id] = {
            isMaximized: false,
            width: '80%',
            height: '80%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        };
    }
    
    if (windowStates[id].isMaximized) {
        window.style.width = windowStates[id].width;
        window.style.height = windowStates[id].height;
        window.style.top = windowStates[id].top;
        window.style.left = windowStates[id].left;
        window.style.transform = windowStates[id].transform;
        windowStates[id].isMaximized = false;
    }
    
    window.style.display = 'block';
    window.classList.remove('closing');
    window.classList.add('opening');
    
    setTimeout(() => {
        window.classList.remove('opening');
    }, 300);
    
    bringToFront(id);
}

function closeWindow(id) {
    const window = document.getElementById(id);
    if (!window) return;
    
    window.classList.add('closing');
    
    setTimeout(() => {
        window.style.display = 'none';
        window.classList.remove('closing');
        updateActiveAppIcons();
    }, 200);
}

function minimizeWindow(id) {
    const window = document.getElementById(id);
    if (!window) return;
    
    window.classList.add('closing');
    
    setTimeout(() => {
        window.style.display = 'none';
        window.classList.remove('closing');
        updateActiveAppIcons();
    }, 200);
}

function maximizeWindow(id) {
    const window = document.getElementById(id);
    if (!window) return;
    
    if (windowStates[id] && windowStates[id].isMaximized) {
        window.style.width = windowStates[id].width;
        window.style.height = windowStates[id].height;
        window.style.top = windowStates[id].top;
        window.style.left = windowStates[id].left;
        window.style.transform = windowStates[id].transform;
        window.style.borderRadius = '10px';
        windowStates[id].isMaximized = false;
    } else {
        if (!windowStates[id]) {
            windowStates[id] = {};
        }
        
        windowStates[id].width = window.style.width;
        windowStates[id].height = window.style.height;
        windowStates[id].top = window.style.top;
        windowStates[id].left = window.style.left;
        windowStates[id].transform = window.style.transform;
        
        window.style.width = '100%';
        window.style.height = `calc(100% - var(--taskbar-height))`;
        window.style.top = '0';
        window.style.left = '0';
        window.style.transform = 'none';
        window.style.borderRadius = '0';
        windowStates[id].isMaximized = true;
    }
    
    bringToFront(id);
}

function bringToFront(id) {
    const window = document.getElementById(id);
    if (!window) return;
    
    currentZIndex += 1;
    window.style.zIndex = currentZIndex;
}

function updateActiveAppIcons(activeApp) {
    const appIcons = document.querySelectorAll('.app-icon');
    
    appIcons.forEach(icon => {
        icon.classList.remove('active');
    });
    
    const fileExplorer = document.getElementById('file-explorer-container');
    const browser = document.getElementById('browser-container');
    const terminal = document.getElementById('terminal-container');
    
    if (fileExplorer && fileExplorer.style.display === 'block') {
        document.querySelector('.app-icon[onclick="openFileExplorer()"]').classList.add('active');
    }
    
    if (browser && browser.style.display === 'block') {
        document.querySelector('.app-icon[onclick="openBrowser()"]').classList.add('active');
    }
    
    if (terminal && terminal.style.display === 'block') {
        document.querySelector('.app-icon[onclick="openTerminal()"]').classList.add('active');
    }
    
    if (activeApp) {
        const selector = `.app-icon[onclick="open${activeApp.charAt(0).toUpperCase() + activeApp.slice(1)}()"]`;
        const icon = document.querySelector(selector);
        if (icon) {
            icon.classList.add('active');
        }
    }
}

function setupTerminal() {
    const terminalInput = document.getElementById('terminal-input');
    if (!terminalInput) return;
    
    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const command = this.value.trim();
            const terminal = document.getElementById('terminal-content');
            
            const outputLine = document.createElement('div');
            outputLine.innerHTML = `user@weblinux:~$ ${command}<br>`;
            
            if (command === 'ls') {
                outputLine.innerHTML += 'Documents  Downloads  Music  Pictures  Projects  Videos<br>';
            } else if (command.startsWith('echo ')) {
                outputLine.innerHTML += `${command.substring(5).replace(/"/g, '')}<br>`;
            } else if (command === 'pwd') {
                outputLine.innerHTML += '/home/user<br>';
            } else if (command === 'whoami') {
                outputLine.innerHTML += 'user<br>';
            } else if (command === 'date') {
                outputLine.innerHTML += new Date().toString() + '<br>';
            } else if (command === 'help') {
                outputLine.innerHTML += 'Available commands: ls, echo, pwd, whoami, date, clear, help, youtube<br>';
            } else if (command === 'youtube') {
                outputLine.innerHTML += 'Opening YouTube in browser...<br>';
                setTimeout(() => {
                    openBrowser();
                    navigateBrowserTo('https://www.youtube.com');
                }, 500);
            } else if (command === 'clear') {
                terminal.innerHTML = '';
                this.value = '';
                
                const inputLine = document.createElement('div');
                inputLine.id = 'terminal-input-line';
                inputLine.innerHTML = `<div id="terminal-prompt">user@weblinux:~$</div>
                    <input id="terminal-input" type="text" autofocus>`;
                terminal.appendChild(inputLine);
                
                document.getElementById('terminal-input').focus();
                setupTerminal(); 
                return;
            } else if (command) {
                outputLine.innerHTML += `Command '${command}' not found. Type 'help' for available commands.<br>`;
            }
            
            terminal.insertBefore(outputLine, document.getElementById('terminal-input-line'));
            
            this.value = '';
            terminal.scrollTop = terminal.scrollHeight;
        }
    });
}

function navigateBrowserTo(url) {
    const urlBar = document.getElementById('url-bar');
    const viewport = document.getElementById('browser-viewport');
    const browserTitle = document.querySelector('#browser-container .window-title');
    
    if (!urlBar || !viewport || !browserTitle) return;
    
    urlBar.value = url;
    
    const domain = url.replace('https://', '').replace('http://', '').split('/')[0];
    browserTitle.textContent = domain;
    
    if (url.includes('youtube.com')) {
        viewport.src = 'https://www.youtube.com/embed?controls=1';
        
        if (viewport.contentDocument) {
            viewport.contentDocument.body.innerHTML = `
                <div style="background-color: #212121; color: white; height: 100%; display: flex; flex-direction: column;">
                    <div style="background-color: #202020; padding: 10px; display: flex; align-items: center;">
                        <div style="color: red; font-size: 24px; margin-right: 10px;">▶</div>
                        <div style="font-weight: bold; font-size: 18px;">YouTube</div>
                    </div>
                    <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
                        <div style="text-align: center;">
                            <p>YouTube simulation loaded</p>
                            <p>Due to browser security restrictions, actual YouTube content cannot be loaded in this demo.</p>
                        </div>
                    </div>
                </div>
            `;
        }
    } else {
        viewport.src = "/api/placeholder/800/600";
    }
}

function setupBrowser() {
    const urlBar = document.getElementById('url-bar');
    if (!urlBar) return;
    
    urlBar.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const url = this.value;
            
            let formattedUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                formattedUrl = 'https://' + url;
            }
            
            navigateBrowserTo(formattedUrl);
        }
    });
    
    const refreshButton = document.querySelector('#browser-toolbar .browser-button:nth-child(3)');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            const currentUrl = document.getElementById('url-bar').value;
            navigateBrowserTo(currentUrl);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    makeDraggable(document.getElementById('file-explorer-container'));
    makeDraggable(document.getElementById('browser-container'));
    makeDraggable(document.getElementById('terminal-container'));

    setupTerminal();
    
    setupBrowser();
    
    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const fileItems = document.querySelectorAll('.file-item');
            
            fileItems.forEach(item => {
                const fileName = item.querySelector('.file-name').textContent.toLowerCase();
                if (fileName.includes(searchTerm) || searchTerm === '') {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    const browserToolbar = document.getElementById('browser-toolbar');
    if (browserToolbar) {
        const youtubeButton = document.createElement('button');
        youtubeButton.className = 'browser-button';
        youtubeButton.textContent = 'YouTube';
        youtubeButton.style.backgroundColor = '#ff0000';
        youtubeButton.style.color = 'white';
        youtubeButton.style.borderRadius = '3px';
        youtubeButton.style.marginLeft = '5px';
        youtubeButton.addEventListener('click', function() {
            navigateBrowserTo('https://www.youtube.com');
        });
        
        browserToolbar.appendChild(youtubeButton);
    }
    
    setTimeout(() => {
        showNotification('Welcome to WebLinux OS', 'Click on desktop icons to get started.');
    }, 1000);
});

function showNotification(title, message, duration = 5000) {
    let notificationsArea = document.getElementById('notifications-area');
    if (!notificationsArea) {
        notificationsArea = document.createElement('div');
        notificationsArea.id = 'notifications-area';
        document.body.appendChild(notificationsArea);
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-body">${message}</div>
    `;
    
    notificationsArea.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}
function openWindow(id) {
    const window = document.getElementById(id);
    if (!window) return;
    if (!windowStates[id]) {
        windowStates[id] = {
            isMaximized: false,
            width: '80%',
            height: '80%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        };
    }
    
    if (windowStates[id].isMaximized) {
        window.style.width = windowStates[id].width;
        window.style.height = windowStates[id].height;
        window.style.top = windowStates[id].top;
        window.style.left = windowStates[id].left;
        window.style.transform = windowStates[id].transform;
        windowStates[id].isMaximized = false;
    }
    
    window.style.display = 'block';
    window.classList.remove('closing');
    window.classList.add('opening');
    
    setTimeout(() => {
        window.classList.remove('opening');
        window.classList.add('active');  // Add this line
    }, 300);
    
    bringToFront(id);
}
function closeWindow(id) {
    const window = document.getElementById(id);
    if (!window) return;
    
    window.classList.remove('active');  // Add this line
    window.classList.add('closing');
    
    setTimeout(() => {
        window.style.display = 'none';
        window.classList.remove('closing');
        updateActiveAppIcons();
    }, 200);
}
function minimizeWindow(id) {
    const window = document.getElementById(id);
    if (!window) return;
    
    window.classList.remove('active');  // Add this line
    window.classList.add('closing');
    
    setTimeout(() => {
        window.style.display = 'none';
        window.classList.remove('closing');
        updateActiveAppIcons();
    }, 200);
}