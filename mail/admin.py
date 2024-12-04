from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import Email, CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    add_form = UserCreationForm
    form = UserChangeForm
    fieldsets = UserAdmin.fieldsets
    add_fieldsets = (
        (None, {'fields': {'username', 'email', 'password1', 'password2'}}),
    )


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ('subject', 'timestamp', 'read', 'archived',)
