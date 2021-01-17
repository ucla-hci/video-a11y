from django.db import models
from django import forms
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class Session(models.Model):
    # sessionID = models.IntegerField(primary_key=True, blank=False)
    pauses = ArrayField(
        models.TimeField(blank=True),
        null=True,
        blank=True,
    )
    bookmarks = ArrayField(
        models.TimeField(blank=True),
        null=True,
        blank=True,
    )
    transcripts = ArrayField(
        models.TextField(blank=True),
        null=True,
        blank=True
    )
    transcript_times = ArrayField(
        models.TimeField(blank=True),
        null=True,
        blank=True
    )
    returnpoints = ArrayField(
        models.TimeField(blank=True),
        null=True,
        blank=True
    )
    class Meta:
        ordering = ["id"]
    
class Navigation(models.Model):
    session = models.ForeignKey(Session, related_name="navigations", on_delete=models.CASCADE, blank=True, default=None, null=True)
    transcript = models.TextField(null=True, blank=True)
    transcript_time = models.TimeField(null=True, blank=True)
    subtitle = models.TextField(null=True, blank=True)
    subtitle_time = models.TimeField(null=True, blank=True)
    intended_time = models.TimeField(null=True, blank=True)
    correct = models.BooleanField(null=True, blank=True)
    error_type = models.TextField(null=True, blank=True)
    error_details = models.TextField(null=True, blank=True)