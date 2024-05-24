from flask import Blueprint,render_template,request,flash

#defining blueprint
auth = Blueprint('auth',__name__)

@auth.route('/login',methods=['GET', 'POST'])
def login():
    return render_template ("login.html")

@auth.route('/logout')
def logout():
    return"<h1>logout<h1>"

@auth.route('/Signup',methods=['POST', 'GET'])
def signup():
    if request.method == 'POST':
        email  = request.form.get('email')
        firstname = request.form.get('firstname')
        password1 = request.form.get('password1')
        password2 = request.form.get('password2')
        #check for signup requirements
        if len(email)< 4:
            flash('Email must be greater than 4 characters.', category='error')
        elif len(firstname) < 2:
            flash('Email must be greater than 1 characters.',category='error')
        elif password1 <7:
            flash('Password must be 7 characters', category ='error')
        elif password2 != password1:
            flash("passwprd don\'t match." ,category ='error')
        else:
            flash('Account created! ', category='success')
    return render_template("Signup.html")

