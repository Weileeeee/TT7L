from flask import Blueprint, render_template

#defining blueprint
views = Blueprint('views', __name__)

@views.route('/')
def home():
    return render_template("home.html")