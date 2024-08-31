// In-memory storage for users
const users = [];

let currentUser = null;

// Helper function to hash passwords (simple demo version)
function hashPassword(password) {
    return btoa(password); // Base64 encoding as a simple hash (not secure, for demo only)
}

// Helper function to validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Helper function to validate password strength
function validatePassword(password) {
    return password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);
}

// Toggle between Login and Sign Up forms
function toggleForms() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    
    if (signupForm.style.display === 'none') {
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    } else {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}

// Sign Up Functionality
function signUp() {
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;
    const password = document.getElementById('signup-password').value;
    const signupError = document.getElementById('signup-error');

    if (firstName && lastName && username && email && mobile && password) {
        if (!validateEmail(email)) {
            signupError.innerText = 'Invalid email format!';
            return;
        }
        if (!validatePassword(password)) {
            signupError.innerText = 'Password must be at least 8 characters long and include letters and numbers!';
            return;
        }

        const userExists = users.find(user => user.username === username || user.email === email || user.mobile === mobile);

        if (userExists) {
            signupError.innerText = 'Username, email, or mobile number already in use!';
        } else {
            const newUser = {
                firstName,
                lastName,
                username,
                email,
                mobile,
                password: hashPassword(password),
                balance: 0,
                transactions: []
            };
            users.push(newUser);
            signupError.innerText = '';
            alert('Sign up successful! You can now log in.');
            toggleForms(); // Switch to the login form
        }
    } else {
        signupError.innerText = 'Please fill in all fields!';
    }
}

// Login Functionality
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const loginError = document.getElementById('login-error');

    currentUser = users.find(user => user.email === email && user.password === hashPassword(password));

    if (currentUser) {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('welcome-message').innerText = `Welcome, ${currentUser.firstName} ${currentUser.lastName}!`;
        document.getElementById('balance').innerText = currentUser.balance.toFixed(2);
        displayTransactionHistory();
        loginError.innerText = '';
    } else {
        loginError.innerText = 'Invalid email or password';
    }
}

// Deposit Functionality
function deposit() {
    const amount = parseFloat(document.getElementById('amount').value);
    const transactionError = document.getElementById('transaction-error');

    if (isNaN(amount) || amount <= 0) {
        transactionError.innerText = 'Please enter a valid amount';
    } else {
        currentUser.balance += amount;
        document.getElementById('balance').innerText = currentUser.balance.toFixed(2);
        currentUser.transactions.push({ type: 'Deposit', amount: amount });
        displayTransactionHistory();
        transactionError.innerText = '';
    }
}

// Withdraw Functionality
function withdraw() {
    const amount = parseFloat(document.getElementById('amount').value);
    const transactionError = document.getElementById('transaction-error');

    if (isNaN(amount) || amount <= 0) {
        transactionError.innerText = 'Please enter a valid amount';
    } else if (amount > currentUser.balance) {
        transactionError.innerText = 'Insufficient funds';
    } else {
        currentUser.balance -= amount;
        document.getElementById('balance').innerText = currentUser.balance.toFixed(2);
        currentUser.transactions.push({ type: 'Withdraw', amount: amount });
        displayTransactionHistory();
        transactionError.innerText = '';
    }
}

// Show and Hide Send Money Form
function showSendMoney() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('send-money-form').style.display = 'block';
}

function hideSendMoney() {
    document.getElementById('send-money-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

// Send Money Functionality
function sendMoney() {
    const recipientUsername = document.getElementById('recipient-username').value;
    const amount = parseFloat(document.getElementById('send-amount').value);
    const sendError = document.getElementById('send-error');

    if (!recipientUsername) {
        sendError.innerText = 'Please enter a recipient username!';
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        sendError.innerText = 'Please enter a valid amount!';
        return;
    }

    if (amount > currentUser.balance) {
        sendError.innerText = 'Insufficient funds!';
        return;
    }

    const recipient = users.find(user => user.username === recipientUsername);

    if (!recipient) {
        sendError.innerText = 'Recipient not found!';
        return;
    }

    if (recipient === currentUser) {
        sendError.innerText = 'You cannot send money to yourself!';
        return;
    }

    // Process the transaction
    currentUser.balance -= amount;
    recipient.balance += amount;

    // Update transaction history
    currentUser.transactions.push({ type: `Sent to ${recipientUsername}`, amount: amount });
    recipient.transactions.push({ type: `Received from ${currentUser.username}`, amount: amount });

    displayTransactionHistory();
    document.getElementById('balance').innerText = currentUser.balance.toFixed(2);
    sendError.innerText = '';
    alert(`Successfully sent ${amount} Taka to ${recipient.firstName} ${recipient.lastName}.`);
    hideSendMoney();
}

// Logout Functionality
function logout() {
    currentUser = null;
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

// Show and Hide Profile Update Form
function showProfileUpdate() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('profile-update-form').style.display = 'block';

    document.getElementById('update-first-name').value = currentUser.firstName;
    document.getElementById('update-last-name').value = currentUser.lastName;
    document.getElementById('update-username').value = currentUser.username;
    document.getElementById('update-email').value = currentUser.email;
    document.getElementById('update-mobile').value = currentUser.mobile;
}

function hideProfileUpdate() {
    document.getElementById('profile-update-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

// Update Profile Functionality
function updateProfile() {
    const firstName = document.getElementById('update-first-name').value;
    const lastName = document.getElementById('update-last-name').value;
    const username = document.getElementById('update-username').value;
    const email = document.getElementById('update-email').value;
    const mobile = document.getElementById('update-mobile').value;
    const updateError = document.getElementById('update-error');

    if (firstName && lastName && username && email && mobile) {
        if (!validateEmail(email)) {
            updateError.innerText = 'Invalid email format!';
            return;
        }

        // Check if the username, email, or mobile number is already in use by another user
        const userExists = users.find(user => (user.username === username || user.email === email || user.mobile === mobile) && user !== currentUser);

        if (userExists) {
            updateError.innerText = 'Username, email, or mobile number already in use!';
        } else {
            currentUser.firstName = firstName;
            currentUser.lastName = lastName;
            currentUser.username = username;
            currentUser.email = email;
            currentUser.mobile = mobile;

            updateError.innerText = '';
            alert('Profile updated successfully!');
            hideProfileUpdate();
            document.getElementById('welcome-message').innerText = `Welcome, ${currentUser.firstName} ${currentUser.lastName}!`;
        }
    } else {
        updateError.innerText = 'Please fill in all fields!';
    }
}

// Show and Hide Password Reset Form
function showPasswordReset() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('password-reset-form').style.display = 'block';
}

function hidePasswordReset() {
    document.getElementById('password-reset-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

// Password Reset Functionality
function resetPassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const passwordResetError = document.getElementById('password-reset-error');

    if (currentPassword && newPassword && confirmPassword) {
        if (hashPassword(currentPassword) !== currentUser.password) {
            passwordResetError.innerText = 'Current password is incorrect!';
        } else if (!validatePassword(newPassword)) {
            passwordResetError.innerText = 'Password must be at least 8 characters long and include letters and numbers!';
        } else if (newPassword !== confirmPassword) {
            passwordResetError.innerText = 'New passwords do not match!';
        } else {
            currentUser.password = hashPassword(newPassword);
            passwordResetError.innerText = '';
            alert('Password reset successfully!');
            hidePasswordReset();
        }
    } else {
        passwordResetError.innerText = 'Please fill in all fields!';
    }
}

// Display Transaction History
function displayTransactionHistory() {
    const transactionHistory = document.getElementById('transaction-history');
    transactionHistory.innerHTML = '';
    currentUser.transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.type}: ${transaction.amount} Taka`;
        transactionHistory.appendChild(li);
    });
}

// Delete Profile Functionality
function deleteProfile() {
    if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
        const index = users.indexOf(currentUser);
        if (index > -1) {
            users.splice(index, 1);
        }
        logout();
        alert('Profile deleted successfully.');
    }
}
