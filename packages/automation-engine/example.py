import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from dotenv import load_dotenv

from browser_use import Agent, ChatGoogle

load_dotenv()

api_key = "AIzaSyDHuwt28RlnZkJAZyPd_4BjrwJwQne7tLo"
if not api_key:
	raise ValueError('GOOGLE_API_KEY is not set')


async def run_search():
	llm = ChatGoogle(model='gemini-flash-latest', api_key=api_key)
	agent = Agent(
		llm=llm,
		task='''You are a professional job application assistant for JobSwipe, specializing in Greenhouse job boards.

OBJECTIVE: Apply to the Cloud GTM Partnerships Lead position at Anthropic

JOB APPLICATION URL: https://job-boards.greenhouse.io/anthropic/jobs/4962959008

CANDIDATE INFORMATION:
- Full Name: aarav singh
- First Name: aarav
- Last Name: singh
- Email: abransh05@gmail.com
- Phone: +91 987654321
- Current Title: Student
- Years of Experience: 3
- Location: New delhi
- LinkedIn: https://www.linkedin.com/in/aarav-singh-05/
- Work Authorization: allowed
{resume_instruction}

STEP-BY-STEP INSTRUCTIONS:

1. NAVIGATE TO APPLICATION
   - Go to the job application URL
   - Wait for the page to fully load
   - Take a screenshot to document the starting point

2. FIND APPLICATION FORM
   - Look for "Apply" buttons or "Apply for this job" links
   - Click on the application button/link
   - If redirected to a new page, wait for it to load completely

3. FILL OUT APPLICATION FORM
   Greenhouse forms typically have these sections:

   a) Basic Information:
      - First Name: aarav
      - Last Name: singh
      - Email: abransh05@gmail.com
      - Phone: +91 987654321

   b) Professional Information:
      - Current/Most Recent Job Title: Student
      - Location/City: New delhi
      - LinkedIn Profile: https://www.linkedin.com/in/aarav-singh-05/

   c) Experience and Skills:
      - Years of Experience: 3
      - Relevant Skills: Python, JavaScript, React

   d) Work Authorization (if asked):
      - Are you authorized to work in the US? Answer based on: allowed
      - Do you require sponsorship? Answer based on: No

4. HANDLE FILE UPLOADS
   - Look for resume/CV upload fields
   - If found, use the upload_resume action to upload the file
   - Verify the upload was successful

5. HANDLE ADDITIONAL QUESTIONS
   Common Greenhouse questions and how to answer them:
   - "Why are you interested in this role?" → "I'm excited about this opportunity because it aligns with my experience and career goals. The role would allow me to contribute my skills while growing in a dynamic environment."
   - "Salary expectations?" → "{user_profile.salary_expectation or 'Competitive salary based on experience'}"
   - "When can you start?" → "I'm available to start within 2-4 weeks notice period"
   - "Cover letter" → "{user_profile.cover_letter or 'Please see my attached resume for details of my experience and qualifications.'}"

6. CAPTCHA HANDLING
   - Use detect_captcha action to check for captchas
   - If captcha detected, document it and wait for manual intervention
   - Do not proceed until captcha is resolved

7. REVIEW AND SUBMIT
   - Review all filled information for accuracy
   - Look for any required fields that might be missed
   - Click "Submit Application" or similar button
   - Wait for confirmation page to load

8. CONFIRMATION VERIFICATION
   - Use extract_confirmation action to get confirmation details
   - Look for success messages like:
     * "Thank you for your application"
     * "Application submitted successfully"
     * "We have received your application"
   - Try to extract any confirmation numbers or reference IDs
   - Take a final screenshot of the confirmation page

IMPORTANT GUIDELINES:
- Be patient with page loads and form submissions
- Handle dynamic content that loads after the initial page
- If you encounter multi-step forms, complete all steps
- Don't skip required fields - ask for clarification if needed
- Be professional in all text responses
- If something fails, document the error and continue where possible
- Use the provided actions for file uploads, captcha detection, and confirmation

EXPECTED OUTCOME:
Successfully submit the job application and provide confirmation of submission.''',
		flash_mode=True,
	)

	await agent.run()


if __name__ == '__main__':
	asyncio.run(run_search())
