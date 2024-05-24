from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'HELLO'

    #import blueprints
    from .views import views
    from .auth import auth

    #register Blueprints
    app.register_blueprint(views, url_prefix = '/')
    app.register_blueprint(auth, url_prefix ='/')

    return app