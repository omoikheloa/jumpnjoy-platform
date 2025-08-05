from django.core.management.base import BaseCommand
from forms.models import User, SafetyCheck, DailyStats
from django.utils import timezone
from datetime import date

class Command(BaseCommand):
    help = 'Seed test data for users and logs'

    def handle(self, *args, **kwargs):
        # Owner
        owner, created = User.objects.get_or_create(
            username='owner',
            defaults={
                'password': 'Oyinlayifa1994$',  # Will be overridden below
                'email': 'owner@jumpnjoy.com',
                'first_name': 'John',
                'last_name': 'Smith',
                'role': 'owner'
            }
        )
        if created:
            owner.set_password('password123')
            owner.save()

        # Staff 1
        staff1, created = User.objects.get_or_create(
            username='staff1',
            defaults={
                'password': 'password123',
                'email': 'staff1@jumpnjoy.com',
                'first_name': 'Jane',
                'last_name': 'Doe',
                'role': 'staff'
            }
        )
        if created:
            staff1.set_password('password123')
            staff1.save()

        # Staff 2
        staff2, created = User.objects.get_or_create(
            username='staff2',
            defaults={
                'password': 'password123',
                'email': 'staff2@jumpnjoy.com',
                'first_name': 'Mike',
                'last_name': 'Johnson',
                'role': 'staff'
            }
        )
        if created:
            staff2.set_password('password123')
            staff2.save()

        # Create sample SafetyCheck only if not exists
        if not SafetyCheck.objects.filter(trampoline_id='TRAMP-001').exists():
            SafetyCheck.objects.create(
                trampoline_id='TRAMP-001',
                springs_ok=True,
                nets_ok=True,
                foam_pits_ok=True,
                overall_pass=True,
                notes='All equipment in good condition',
                checked_by=staff1
            )

        # Create sample DailyStats only if not exists for today
        if not DailyStats.objects.filter(date=date.today()).exists():
            DailyStats.objects.create(
                date=date.today(),
                visitor_count=45,
                cafe_sales=234.50,
                notes='Busy day, good weather',
                recorded_by=staff1
            )

        self.stdout.write(self.style.SUCCESS("✅ Test data created successfully!"))

