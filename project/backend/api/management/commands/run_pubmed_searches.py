from django.core.management.base import BaseCommand
from api.services import run_scheduled_searches
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Run scheduled PubMed searches for Pharmacovigilance'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting scheduled PubMed searches...'))
        
        try:
            run_scheduled_searches()
            self.stdout.write(self.style.SUCCESS('Successfully completed scheduled PubMed searches'))
        except Exception as e:
            logger.error(f"Error running scheduled searches: {str(e)}")
            self.stdout.write(self.style.ERROR(f'Error running scheduled searches: {str(e)}')) 