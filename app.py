from flask import Flask, request, render_template

app = Flask(__name__)

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def authenticate():
    username = request.form['username']
    password = request.form['password']
    # Here you would typically check the username and password against a database
    # For simplicity, I'll just check if the username and password match 'admin'
    if username == 'admin' and password == 'admin':
        return 'Login successful!'
    else:
        return 'Invalid username or password'

if __name__ == '__main__':
    app.run(debug=True)