document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const passwordOutput = document.getElementById('password-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyBtnText = copyBtn.querySelector('.btn-text');
    const copyIcon = copyBtn.querySelector('.copy-icon');
    const checkIcon = copyBtn.querySelector('.check-icon');
    
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    
    const lengthSlider = document.getElementById('length-slider');
    const lengthDisplay = document.getElementById('length-display');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const customLengthBtn = document.getElementById('custom-length-btn');
    
    const optUppercase = document.getElementById('opt-uppercase');
    const optLowercase = document.getElementById('opt-lowercase');
    const optNumbers = document.getElementById('opt-numbers');
    const optSymbols = document.getElementById('opt-symbols');
    
    const optExcludeSimilar = document.getElementById('opt-exclude-similar');
    const optExcludeAmbiguous = document.getElementById('opt-exclude-ambiguous');
    const optNeverRepeat = document.getElementById('opt-never-repeat');
    
    const generateBtn = document.getElementById('generate-btn');
    const entropyValue = document.getElementById('entropy-value');
    const collisionValue = document.getElementById('collision-value');
    const collisionDesc = document.getElementById('collision-desc');
    const crackValue = document.getElementById('crack-value');
    
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Constants
    const CHARSETS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbolsStandard: '!@#$%^&*',
        symbolsAmbiguous: '()_+~|}{[]:;?><,./-=\\'
    };
    
    const SIMILAR_CHARS = ['i', 'l', '1', 'o', '0', 'O', 'I'];
    const LOCAL_HISTORY_KEY = 'aegiscrypt_history_v1';
    
    // Initialize history from localStorage
    let generatedHistory = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY)) || [];

    // Initialize UI
    updateUI();
    renderHistory();
    generatePassword();

    // Event Listeners
    lengthSlider.addEventListener('input', (e) => {
        lengthDisplay.textContent = e.target.value;
        setActivePreset(parseInt(e.target.value));
        calculateMetrics();
    });

    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const length = btn.getAttribute('data-len');
            if (length) {
                lengthSlider.value = length;
                lengthDisplay.textContent = length;
                setActivePreset(parseInt(length));
                calculateMetrics();
            }
        });
    });

    customLengthBtn.addEventListener('click', () => {
        const customValue = prompt('Enter a custom password length (4 to 1024):', lengthSlider.value);
        const parsed = parseInt(customValue);
        if (!isNaN(parsed) && parsed >= 4 && parsed <= 1024) {
            lengthSlider.max = Math.max(128, parsed);
            lengthSlider.value = parsed;
            lengthDisplay.textContent = parsed;
            setActivePreset(parsed);
            calculateMetrics();
        } else if (customValue !== null) {
            alert('Please enter a valid number between 4 and 1024.');
        }
    });

    // Checkboxes change event
    [optUppercase, optLowercase, optNumbers, optSymbols, optExcludeSimilar, optExcludeAmbiguous].forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Guarantee at least one character set is selected
            if (!optUppercase.checked && !optLowercase.checked && !optNumbers.checked && !optSymbols.checked) {
                // Revert
                checkbox.checked = true;
                alert('At least one character option must be selected.');
            }
            calculateMetrics();
        });
    });

    generateBtn.addEventListener('click', generatePassword);
    
    copyBtn.addEventListener('click', () => {
        const text = passwordOutput.value;
        if (text) {
            copyToClipboard(text);
        }
    });

    clearHistoryBtn.addEventListener('click', () => {
        generatedHistory = [];
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(generatedHistory));
        renderHistory();
    });

    // Functions
    function setActivePreset(len) {
        presetButtons.forEach(btn => {
            if (btn.id === 'custom-length-btn') return;
            const btnLen = parseInt(btn.getAttribute('data-len'));
            if (btnLen === len) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function updateUI() {
        calculateMetrics();
    }

    // Build the character pool based on user choices
    function buildCharacterPool() {
        let pool = '';
        if (optUppercase.checked) pool += CHARSETS.uppercase;
        if (optLowercase.checked) pool += CHARSETS.lowercase;
        if (optNumbers.checked) pool += CHARSETS.numbers;
        
        if (optSymbols.checked) {
            pool += CHARSETS.symbolsStandard;
            if (!optExcludeAmbiguous.checked) {
                pool += CHARSETS.symbolsAmbiguous;
            }
        }

        // Apply filters
        if (optExcludeSimilar.checked) {
            pool = pool.split('').filter(char => !SIMILAR_CHARS.includes(char)).join('');
        }

        return pool;
    }

    // Mathematical calculations
    function calculateMetrics() {
        const pool = buildCharacterPool();
        const poolSize = pool.length;
        const length = parseInt(lengthSlider.value);
        
        if (poolSize === 0) return;

        // Entropy: H = L * log2(R)
        const entropy = length * Math.log2(poolSize);
        entropyValue.textContent = Math.round(entropy);

        // Keyspace Size: K = R^L
        const keyspace = Math.pow(poolSize, length);

        // Strength Evaluation & Bar updates
        let level = 0;
        let text = 'Very Weak';
        let barColor = 'var(--strength-0)';
        let barWidth = '20%';

        if (entropy >= 120) {
            level = 4;
            text = 'Military Grade (Ultra Secure)';
            barColor = 'var(--strength-4)';
            barWidth = '100%';
        } else if (entropy >= 80) {
            level = 3;
            text = 'Strong (Highly Secure)';
            barColor = 'var(--strength-3)';
            barWidth = '75%';
        } else if (entropy >= 60) {
            level = 2;
            text = 'Medium (Balanced)';
            barColor = 'var(--strength-2)';
            barWidth = '50%';
        } else if (entropy >= 40) {
            level = 1;
            text = 'Weak (Predictable)';
            barColor = 'var(--strength-1)';
            barWidth = '35%';
        }

        strengthBar.style.width = barWidth;
        strengthBar.style.backgroundColor = barColor;
        strengthText.textContent = text;
        strengthText.style.color = barColor;

        // Collision Risk Estimation
        // P(collision between 2 random outputs) = 1 / K
        if (keyspace === Infinity || keyspace > 1e30) {
            collisionValue.textContent = '0%';
            collisionValue.style.color = 'var(--strength-3)';
            collisionDesc.textContent = 'Virtually 0% in infinity chance.';
        } else {
            const collisionProb = (1 / keyspace) * 100;
            if (collisionProb < 1e-15) {
                collisionValue.textContent = '< 0.00001%';
                collisionValue.style.color = 'var(--strength-3)';
                collisionDesc.textContent = `1 in ${formatNumberScientific(keyspace)} generations.`;
            } else {
                collisionValue.textContent = `${collisionProb.toFixed(6)}%`;
                if (collisionProb > 1) {
                    collisionValue.style.color = 'var(--strength-0)';
                    collisionDesc.textContent = 'High duplication chance!';
                } else {
                    collisionValue.style.color = 'var(--strength-2)';
                    collisionDesc.textContent = `1 in ${Math.round(keyspace).toLocaleString()} chance.`;
                }
            }
        }

        // Crack Resistance Estimation
        // Assumes a supercomputer system doing 100 Billion (1e11) guesses per second
        const guessesPerSec = 1e11;
        const secondsToCrack = keyspace / (2 * guessesPerSec);
        crackValue.textContent = formatCrackTime(secondsToCrack);
    }

    function formatNumberScientific(num) {
        if (num === Infinity) return 'Infinity';
        const exp = Math.floor(Math.log10(num));
        const base = (num / Math.pow(10, exp)).toFixed(2);
        return `${base} × 10^${exp}`;
    }

    function formatCrackTime(seconds) {
        if (seconds === Infinity || seconds > 1e100) return 'Infinity';
        
        const SECONDS_IN_MIN = 60;
        const SECONDS_IN_HOUR = 3600;
        const SECONDS_IN_DAY = 86400;
        const SECONDS_IN_YEAR = 31536000;
        const SECONDS_IN_CENTURY = 3153600000;

        if (seconds < 0.1) return 'Instantly';
        if (seconds < SECONDS_IN_MIN) return `${seconds.toFixed(1)} seconds`;
        
        const minutes = seconds / SECONDS_IN_MIN;
        if (minutes < 60) return `${Math.round(minutes)} minutes`;
        
        const hours = seconds / SECONDS_IN_HOUR;
        if (hours < 24) return `${Math.round(hours)} hours`;
        
        const days = seconds / SECONDS_IN_DAY;
        if (days < 365) return `${Math.round(days)} days`;
        
        const years = seconds / SECONDS_IN_YEAR;
        if (years < 100) return `${Math.round(years)} years`;
        
        const centuries = seconds / SECONDS_IN_CENTURY;
        if (centuries < 1e6) return `${Math.round(centuries).toLocaleString()} centuries`;
        if (centuries < 1e9) return `${(centuries / 1e6).toFixed(1)} Million centuries`;
        if (centuries < 1e12) return `${(centuries / 1e9).toFixed(1)} Billion centuries`;
        return 'Eons';
    }

    // Secure Generator core using CSPRNG
    function secureRandomIndex(max) {
        const array = new Uint32Array(1);
        const limit = Math.floor(4294967296 / max) * max;
        let val;
        do {
            window.crypto.getRandomValues(array);
            val = array[0];
        } while (val >= limit);
        return val % max;
    }

    function generatePassword() {
        const pool = buildCharacterPool();
        const length = parseInt(lengthSlider.value);
        
        if (pool.length === 0) {
            alert('Cannot generate password: character pool is empty.');
            return;
        }

        const keyspace = Math.pow(pool.length, length);
        const guardActive = optNeverRepeat.checked;

        // Check if history is getting close to full for small keyspaces
        if (guardActive && keyspace < 10000 && generatedHistory.length >= keyspace * 0.8) {
            const reset = confirm('The security keyspace is mostly exhausted with the current settings. Clear generation history to proceed?');
            if (reset) {
                generatedHistory = [];
                localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(generatedHistory));
                renderHistory();
            } else {
                return;
            }
        }

        let password = '';
        let iterations = 0;
        const maxIterations = 500; // Prevent infinite loop lockups

        do {
            password = '';
            for (let i = 0; i < length; i++) {
                const randIndex = secureRandomIndex(pool.length);
                password += pool[randIndex];
            }
            iterations++;
        } while (guardActive && generatedHistory.includes(password) && iterations < maxIterations);

        if (iterations >= maxIterations) {
            alert('Warning: Collision Guard active but failed to generate a completely unique password within iterations limits. Keyspace is too small.');
        }

        // Update output UI
        passwordOutput.value = password;
        
        // Add to history
        addToHistory(password);
        calculateMetrics();
    }

    function addToHistory(password) {
        // Prevent storing duplicates in history array
        if (!generatedHistory.includes(password)) {
            // Limit history to last 50 items
            generatedHistory.unshift(password);
            if (generatedHistory.length > 50) {
                generatedHistory.pop();
            }
            localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(generatedHistory));
            renderHistory();
        }
    }

    function renderHistory() {
        historyList.innerHTML = '';
        
        if (generatedHistory.length === 0) {
            historyList.innerHTML = '<li class="empty-state">No passwords generated yet.</li>';
            return;
        }

        generatedHistory.forEach((pass, index) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            // Mask password initially
            li.innerHTML = `
                <div class="history-pass-wrapper" title="Hover to reveal password">
                    ${pass}
                </div>
                <div class="history-meta">
                    Len: ${pass.length}
                </div>
                <div class="history-item-actions">
                    <button class="item-action-btn copy-item-btn" title="Copy password">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 10H16M8 14H14M19 11V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V7C5 5.89543 5.89543 5 7 5H13M19 11L13 5M19 11H15C13.8954 11 13 10.1046 13 9V5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            `;
            
            // Click/Hover reveal handlers
            const passWrapper = li.querySelector('.history-pass-wrapper');
            passWrapper.addEventListener('click', () => {
                passWrapper.classList.toggle('revealed');
            });

            // Copy handler for this specific item
            const copyItemBtn = li.querySelector('.copy-item-btn');
            copyItemBtn.addEventListener('click', () => {
                copyToClipboard(pass);
                // Simple visual button effect on click
                copyItemBtn.style.color = 'var(--strength-3)';
                setTimeout(() => {
                    copyItemBtn.style.color = '';
                }, 1000);
            });

            historyList.appendChild(li);
        });
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Animate copy button
            copyBtnText.textContent = 'Copied!';
            copyBtn.style.borderColor = 'var(--strength-3)';
            copyBtn.style.color = 'var(--strength-3)';
            copyBtn.style.background = 'rgba(46, 196, 182, 0.1)';
            copyIcon.classList.add('hidden');
            checkIcon.classList.remove('hidden');

            setTimeout(() => {
                copyBtnText.textContent = 'Copy';
                copyBtn.style.borderColor = '';
                copyBtn.style.color = '';
                copyBtn.style.background = '';
                copyIcon.classList.remove('hidden');
                checkIcon.classList.add('hidden');
            }, 1800);
        }).catch(err => {
            console.error('Failed to copy to clipboard: ', err);
        });
    }
});
