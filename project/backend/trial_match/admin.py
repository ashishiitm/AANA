from django.contrib import admin
from trial_match.models.protocol import (
    Protocol, ProtocolTeamMember, ProtocolHistory, 
    ProtocolObjective, ProtocolSite
)
from trial_match.models.site_extension import (
    SiteLocation, SiteMetrics, TherapeuticExperience,
    SiteTrialExperience, SitePastTrial, SitePatientDemographics,
    SiteOutreachHistory
)

# Protocol Admin
class ProtocolTeamMemberInline(admin.TabularInline):
    model = ProtocolTeamMember
    extra = 1

class ProtocolObjectiveInline(admin.TabularInline):
    model = ProtocolObjective
    extra = 1

class ProtocolSiteInline(admin.TabularInline):
    model = ProtocolSite
    extra = 1
    fields = ('site', 'status', 'compatibility_score', 'recruitment_potential')

@admin.register(Protocol)
class ProtocolAdmin(admin.ModelAdmin):
    list_display = ('title', 'molecule_name', 'phase', 'therapeutic_area', 'company', 'status', 'created_at')
    list_filter = ('status', 'phase', 'therapeutic_area', 'company')
    search_fields = ('title', 'molecule_name', 'condition')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'version', 'status', 'company', 'created_by')
        }),
        ('Molecule Information', {
            'fields': ('molecule_name', 'molecule_description', 'molecule_type', 'molecule_mechanism', 'molecule_structure')
        }),
        ('Clinical Trial Information', {
            'fields': ('phase', 'therapeutic_area', 'condition')
        }),
        ('Content', {
            'fields': ('template_used', 'protocol_outline', 'uncertainty_flags', 'compliance_score')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'generated_document_url')
        }),
    )
    inlines = [ProtocolTeamMemberInline, ProtocolObjectiveInline, ProtocolSiteInline]

@admin.register(ProtocolHistory)
class ProtocolHistoryAdmin(admin.ModelAdmin):
    list_display = ('protocol', 'version', 'date', 'changed_by')
    list_filter = ('protocol', 'date')
    readonly_fields = ('date',)

# Site Extension Admin
@admin.register(SiteLocation)
class SiteLocationAdmin(admin.ModelAdmin):
    list_display = ('site', 'city', 'state', 'is_primary')
    list_filter = ('state', 'is_primary')
    search_fields = ('city', 'state')

@admin.register(TherapeuticExperience)
class TherapeuticExperienceAdmin(admin.ModelAdmin):
    list_display = ('site', 'area', 'trial_count', 'is_specialization')
    list_filter = ('area', 'is_specialization')
    search_fields = ('site__name', 'area')

@admin.register(SitePastTrial)
class SitePastTrialAdmin(admin.ModelAdmin):
    list_display = ('site', 'trial_id', 'therapeutic_area', 'phase', 'year_completed', 'performance_rating')
    list_filter = ('phase', 'therapeutic_area', 'year_completed')
    search_fields = ('site__name', 'trial_id')

@admin.register(SiteOutreachHistory)
class SiteOutreachHistoryAdmin(admin.ModelAdmin):
    list_display = ('site', 'protocol', 'method', 'status', 'date')
    list_filter = ('method', 'status', 'date')
    search_fields = ('site__name', 'protocol__title', 'notes')
    readonly_fields = ('date',) 