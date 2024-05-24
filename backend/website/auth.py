from flask import Blueprint,render_template

#defining blueprint
auth = Blueprint('auth',__name__)

@auth.route('/login')
def login():
    return render_template ("login.html")

@auth.route('/logout')
def logout():
    return"<h1>logout<h1>"

@auth.route('/Signup')
def signup():
    return render_template("Signup.html")

