from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required

def register(request):
    """
    Handles new user registration using Django's built-in UserCreationForm.
    """
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Log the user in immediately after successful registration
            login(request, user)
            return redirect('dashboard')
    else:
        form = UserCreationForm()
    
    return render(request, 'tickets/register.html', {'form': form})

@login_required
def dashboard(request):
    """
    The landing page for authenticated users. 
    The @login_required decorator ensures security.
    """
    return render(request, 'tickets/dashboard.html')