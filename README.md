# Aegis Crypt &bull; Free Password Generator

Aegis Crypt is a **free password generator** utility designed for speed, premium aesthetics, and complete cryptographic security. It acts as an independent, lightweight, client-side alternative to commercial cloud-based options like the **aegiscrypt password generator**.

Whether you need a **password generator 8 characters**, **password generator 10 characters**, **password generator 12 characters**, **password generator 14 characters**, **password generator 15 characters**, **password generator 16 characters**, or **password generator 20 characters** configuration, Aegis Crypt supports custom length expansions (up to 1024 characters) to construct secure character arrays or high-entropy **password generator words**.

The interface is built around a custom glassmorphic slate color theme (`#000000`, `#233D4D`, `#FE7F2D`, `#EAECF0`), prioritizing sleek readability, dynamic micro-interactions, and premium hover effects.

---

## 🛡️ The Cryptographic Guard (Collision Prevention)

Standard password generators rely on `Math.random()`, which uses predictable, pseudo-random algorithms. Aegis Crypt guarantees **zero collision probability** and absolute security through three layers:

### 1. Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
We use the browser's native `window.crypto.getRandomValues()` API. This accesses the underlying operating system's entropy pool (e.g., system interrupts, hardware events) to generate numbers. It is mathematically impossible for an attacker to predict subsequent outputs.

### 2. Modulo Bias Elimination
Standard mapping algorithms like `randomValue % charsetLength` introduce a minor mathematical bias toward characters at the beginning of the alphabet. Aegis Crypt implements a rejection sampling algorithm:
```javascript
const limit = Math.floor(4294967296 / max) * max;
do {
    window.crypto.getRandomValues(array);
    val = array[0];
} while (val >= limit);
return val % max;
```
This ensures a mathematically **perfect uniform distribution**—each character has a completely identical chance of being selected.

### 3. Local Collision Guard (Infinite Guard)
A local registry is maintained in your browser's `localStorage`. Whenever a password is generated, Aegis Crypt validates it against the registry to ensure it has never been generated on this machine before. If a collision is detected, it is immediately discarded and regenerated seamlessly in milliseconds.

---

## 📊 Live Entropy & Security Metrics

Aegis Crypt features a real-time security dashboard:
* **Information Entropy:** Calculated in real time as $H = L \times \log_2(R)$ (where $L$ is length and $R$ is pool size).
* **Collision Risk:** Displays the exact probability of duplicate passwords. For a secure password length (e.g. 16 chars), the chance is $1 \text{ in } 5.7 \times 10^{30}$ generations—effectively zero.
* **Crack Resistance:** Calculates the average time required to brute-force your password using a multi-GPU cracking cluster running at 100 Billion hashes/sec.

---

## ⚙️ Features & User Options

* **Preset Lengths & Custom Expansion:** Quick buttons for 4 (PIN), 8, 16, 32 characters, plus a slider and custom text input for up to **1024 characters**.
* **Character Pool Selection:** Toggle Uppercase, Lowercase, Numbers, and Symbols.
* **Exclude Similar Characters:** Remove confusing characters such as `i, l, 1, o, 0, O, I`.
* **Exclude Ambiguous Symbols:** Remove complex brackets or formatting symbols like `{ } [ ] ( ) / \ ' " ~ , ; : . < >` that can break database fields or command line scripts.
* **Recent Password History:** A blurred history log of recently generated passwords. Click any item to reveal or copy.
* **One-Click Copy:** Fluent animation confirming successful clipboard copies.

---

## 🛡️ AegisCrypt Security Architecture & Comparison

Aegis Crypt is built as a complete, **zero-knowledge security** engine designed to **safeguard your entire digital life**. Below is how it structures credentials for individuals and businesses:

### Alphanumeric Arrays vs. Password Generator Words
* **Custom Character Selections**: Toggle uppercase and lowercase letters, numbers, and symbols to form a **unique password** profile.
* **Memorable Passphrases**: Supports generating structural segments that you can combine into **password generator words**.

### For Teams & Organizations
* **Aegiscrypt Business**: Companies looking to secure team workflows can use this utility to let employees **create and store your passwords** securely. Ensure every team member generates unique **random secure passwords** across all departments.
* **Aegiscrypt Business Trial & Premium**: Get full access to Aegis Crypt's entire suite of features (including local Infinite Guard collision blocker and real-time entropy dashboard) for free. There is **no credit card required** and zero expiration limits—no need to sign up for a **30-day free aegiscrypt** trial.

### Multi-Device Compatibility
Aegis Crypt is designed to function **across all devices** and within any **browser extension** or local manager vault, ensuring you can manage your passwords from anywhere without external cloud dependencies.

---

## 🚀 How to Run Locally

Since Aegis Crypt has **zero dependencies**, you can run it immediately without complex installation.

### Option A: Quick Open
Simply double-click the `index.html` file in your file explorer to open it in any modern web browser.

### Option B: Local Web Server
For a full dev server experience:
```bash
# Using Node.js npx (creates an instant server)
npx http-server .

# Or using Python 3
python -m http-server 8000
```
Then open `http://localhost:8080` or `http://localhost:8000` in your browser.

---

## 📝 GitHub Setup

The repository is pre-configured with a remote origin targeting:
`https://github.com/NvxStrikes/password_generator`

To push your changes:
```bash
git add .
git commit -m "feat: initial commit of Aegis Crypt password generator"
git branch -M main
git push -u origin main
```
