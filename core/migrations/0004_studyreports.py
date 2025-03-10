# Generated by Django 5.1.6 on 2025-02-28 05:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_studyclassifications_studyfaqs_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudyReports',
            fields=[
                ('report_id', models.AutoField(primary_key=True, serialize=False)),
                ('report', models.JSONField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('study', models.ForeignKey(db_column='study_id', on_delete=django.db.models.deletion.CASCADE, to='core.studies')),
            ],
            options={
                'db_table': 'study_reports',
            },
        ),
    ]
