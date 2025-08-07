from flask import Flask, request, jsonify, render_template
from flask_mysqldb import MySQL
import random
import string

app = Flask(__name__)

# ✅ MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'hrishi@2006'  # Change if needed
app.config['MYSQL_DB'] = 'password_db'

mysql = MySQL(app)

# ✅ Create table if not exists
with app.app_context():
    cur = mysql.connection.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS passwords (
            id INT AUTO_INCREMENT PRIMARY KEY,
            platform VARCHAR(100),
            username VARCHAR(100),
            password VARCHAR(100)
        );
    ''')
    cur.close()

# ✅ Serve frontend
@app.route('/')
def index():
    return render_template('index.html')

# ✅ Generate Password
@app.route('/generate-password', methods=['POST'])
def generate_password():
    data = request.get_json()
    length = int(data.get('length', 12))
    include_uppercase = data.get('includeUppercase')
    include_lowercase = data.get('includeLowercase')
    include_numbers = data.get('includeNumbers')
    include_symbols = data.get('includeSymbols')
    avoid_ambiguous = data.get('avoidAmbiguous')

    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    numbers = string.digits
    symbols = '!@#$%^&*()_+[]{}|;:,.<>?'
    ambiguous = '{}[]()/\'"`~,;:.<>\\|'

    characters = ''
    if include_uppercase:
        characters += uppercase
    if include_lowercase:
        characters += lowercase
    if include_numbers:
        characters += numbers
    if include_symbols:
        characters += symbols

    if avoid_ambiguous:
        characters = ''.join([c for c in characters if c not in ambiguous])

    if not characters:
        return jsonify({'error': 'No character types selected.'}), 400

    password = ''.join(random.choice(characters) for _ in range(length))

    return jsonify({'password': password})


# ✅ Save Password
@app.route('/save-password', methods=['POST'])
def save_password():
    data = request.get_json()
    platform = data.get('platform')
    username = data.get('username')
    password = data.get('password')

    if not platform or not username or not password:
        return jsonify({'error': 'All fields are required!'}), 400

    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO passwords (platform, username, password) VALUES (%s, %s, %s)",
                (platform, username, password))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Password saved successfully!'}), 201


# ✅ Get Saved Passwords
@app.route('/get-saved-passwords', methods=['GET'])
def get_saved_passwords():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM passwords")
    results = cur.fetchall()
    cur.close()

    data = []
    for row in results:
        data.append({
            'id': row[0],
            'platform': row[1],
            'username': row[2],
            'password': row[3]
        })

    return jsonify(data)


# ✅ Delete Password
@app.route('/delete-password/<int:id>', methods=['DELETE'])
def delete_password(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM passwords WHERE id = %s", (id,))
    mysql.connection.commit()
    cur.close()
    return '', 200


if __name__ == '__main__':
    app.run(debug=True)
