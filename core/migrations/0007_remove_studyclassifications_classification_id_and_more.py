# core/migrations/0007_remove_studyclassifications_classification_id_and_more.py
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0006_studies_allocation_studies_eligibility_criteria_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='studyclassifications',
            name='classification_id',
        ),
        migrations.AddField(
            model_name='studyclassifications',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),  # No default needed
        ),
        migrations.AlterField(
            model_name='studyclassifications',
            name='category',
            field=models.CharField(max_length=255),
        ),
    ]