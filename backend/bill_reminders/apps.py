from django.apps import AppConfig


class BillRemindersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bill_reminders'

    def ready(self):
        import bill_reminders.signals