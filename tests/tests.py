# tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import WaiverSubmission

class WaiverSubmissionTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
    def test_waiver_submission_creation(self):
        submission = WaiverSubmission.objects.create(
            customer_name='Test Customer',
            submitted_by=self.user
        )
        self.assertTrue(submission.created_at)
        self.assertEqual(submission.status, 'pending')