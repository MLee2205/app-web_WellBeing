import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'votre_cle_secrete'
    #SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://mlee:mlee@localhost/mealplanner'
    #SQLALCHEMY_DATABASE_URI = 'postgresql://mealplanner_84jp_user:mXPm4fNnq1bHoUgL7AoMULE8ypg56SjM@dpg-d2i5n4je5dus73eenee0-a/mealplanner_84jp'
    
    # URL Railway - remplacez par votre URL Railway
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://postgres:qMfLPDVhpkXTEdNsaMsuKibUMjeZpAnR@nozomi.proxy.rlwy.net:45585/railway'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    
