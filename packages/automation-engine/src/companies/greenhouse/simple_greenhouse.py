"""
Simplified Greenhouse automation
"""
from ..base.simple_automation import SimpleAutomation


class GreenhouseAutomation(SimpleAutomation):
    """Greenhouse job automation"""
    
    def __init__(self):
        super().__init__("greenhouse")
    
    def _get_task(self, user, job):
        """Greenhouse-specific task"""
        resume = user.get('resume_path', '')
        resume_instruction = f"Upload resume from: {resume}" if resume else ""
        
        return f"""
Apply to {job['title']} at {job['company']} on Greenhouse.

URL: {job['apply_url']}

STEPS:
1. Go to the URL
2. Click "Apply" or "Apply for this job"
3. Fill the form:
   - First Name: {user['first_name']}
   - Last Name: {user['last_name']}
   - Email: {user['email']}
   - Phone: {user['phone']}
4. {resume_instruction}
5. Submit the application
6. Look for "Thank you" or confirmation message

Be thorough and patient. Report final status.
"""