const lengthRange = document.getElementById('lengthRange');
const passwordLengthDisplay = document.getElementById('password-length');
const savedPasswordsTable = document.getElementById('savedPasswords');

lengthRange.oninput = function() {
    passwordLengthDisplay.textContent = this.value;
};

// function generatePassword() {
//     const length = lengthRange.value;
//     const includeUppercase = document.getElementById('uppercase').checked;
//     const includeLowercase = document.getElementById('lowercase').checked;
//     const includeNumbers = document.getElementById('numbers').checked;
//     const includeSymbols = document.getElementById('symbols').checked;
//     const avoidAmbiguous = document.getElementById('avoid-ambiguous').checked;
// //start
//     // const platform = document.getElementById('platform').value;
//     // const username = document.getElementById('username').value;
//     // //const password = 'generatePassword'; // Replace with your actual generated password 

//     // if (platform && username) {
//     //     savePassword(platform, username, password);
//     // } else {
//     //     alert('Please select a platform and enter a username.');
//     // }
// //end
//     fetch('/generate-password', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             length,
//             includeUppercase,
//             includeLowercase,
//             includeNumbers,
//             includeSymbols,
//             avoidAmbiguous
//         })
//     })
//     .then(response => response.json())
//     .then(data => {
//         alert('Generated Password: ' + data.password);
//         savePassword('Generated', data.password);
//     });
// }

// function savePassword(label, password) {
//     fetch('/save-password', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             platform,
//             username,
//             password
//         })
//     }).then(() => fetchSavedPasswords());
// }
function generatePassword() {
    const length = lengthRange.value;
    const includeUppercase = document.getElementById('uppercase').checked;
    const includeLowercase = document.getElementById('lowercase').checked;
    const includeNumbers = document.getElementById('numbers').checked;
    const includeSymbols = document.getElementById('symbols').checked;
    const avoidAmbiguous = document.getElementById('avoid-ambiguous').checked;

    fetch('/generate-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            length,
            includeUppercase,
            includeLowercase,
            includeNumbers,
            includeSymbols,
            avoidAmbiguous
        })
    })
    .then(response => response.json())
    .then(data => {
        const generatedPassword = data.password;
        alert('Generated Password: ' + generatedPassword);

        const platform = document.getElementById('platform').value;
        const username = document.getElementById('username').value;

        // Save the password along with platform and username
        savePassword(platform, username, generatedPassword);
    })
    .catch(error => {
        console.error('Error generating password:', error);
    });
}


function savePassword(platform, username, password) {
    fetch('/save-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            platform: platform, // Correctly passing platform
            username: username, // Correctly passing username
            password: password   // Correctly passing the generated password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save password');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message); // Log success message
        fetchSavedPasswords(); // Refresh saved passwords
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving password: ' + error.message);
    });
}




function fetchSavedPasswords() {
    fetch('/get-saved-passwords')
        .then(response => response.json())
        .then(data => {
            savedPasswordsTable.innerHTML = '';
            data.forEach(password => {
                savedPasswordsTable.innerHTML += `
                    <tr>
                        <td>${password.platform}</td>
                        <td>${password.username}</td>
                        <td>${password.password}</td>
                        <td>
                            <button onclick="copyPassword('${password.value}')">Copy</button><br>
                            <button onclick="deletePassword(${password.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        });
}

function deletePassword(id) {
    fetch(`/delete-password/${id}`, { method: 'DELETE' })
        .then(() => fetchSavedPasswords());
}

function copyPassword() {
    const passwordField = document.getElementById("generatedPassword");
    passwordField.select();
    document.execCommand("copy");
}

document.getElementById('saved-btn').addEventListener('click', () => {
    const platform = document.getElementById('passwordLabel').value;
    const user = document.getElementById('passwordInput').value;
    const password = document.getElementById('passwordInput').value;

    if (!password) {
        alert('Please enter a password.');
        return;
    }

    fetch('/save-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, user, password }),
    })
    .then(response => {
        if (response.ok) {
            alert('Password saved successfully!');
        } else {
            alert('Failed to save password.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while saving the password.');
    });
});
