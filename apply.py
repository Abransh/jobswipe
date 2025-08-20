
# import asyncio
# import csv
# import logging
# import os
# import sys
# from pathlib import Path

# sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# from dotenv import load_dotenv

# load_dotenv()

# from pydantic import BaseModel
# from PyPDF2 import PdfReader  # type: ignore

# from browser_use import ActionResult, Agent, Controller
# from browser_use.browser import BrowserProfile, BrowserSession
# from browser_use.llm import ChatGoogle


# from browser_use import Agent

# logger = logging.getLogger(__name__)
# # full screen mode
# controller = Controller()

# # NOTE: This is the path to your cv file
# CV = Path.cwd() / 'cv_04_24.pdf'

# # You would get this data from your user's profile and the job board
# user_data = {
#     "first_name": "John",
#     "last_name": "Doe",
#     "email": "john.doe@email.com",
#     "phone": "123-456-7890",
#     "resume_path": "cv_04_24.pdf",
#     # ... other user data
# }

# job_url = "https://job-boards.greenhouse.io/doordashusa/jobs/7118562"

# # It's a good practice to read the resume content to pass it to the agent
# # with open(user_data["resume_path"], "r") as f:
# #     resume_content = f.read()

# # Define the task for the agent
# # task = f"""
# # Navigate to the following URL: {job_url}, this is the exact job profile link, check this page, access DOM and apply, search for fiels with name, email and all that would be the section where you have to check and fill details
# # Apply for the job using the following information:
# # First Name: {user_data['first_name']}
# # Last Name: {user_data['last_name']}
# # Email: {user_data['email']}
# # Phone: {user_data['phone']}
# # Resume: {user_data['resume_path']}

# # Ensure that all required fields are filled out correctly. If there are any additional fields that need to be filled, use the information provided in the resume or ask for clarification if necessary.
# # You are a profession job applicant, so make sure to fill out the application form accurately and professionally. If there are any specific instructions on the job application page, follow them carefully.

# # Complete the application and submit it.
# # """

# task = f""" 
# go to URL: {job_url}, and tell me if you can find any form fields, where I can fill my details, like name, email, phone, resume and so on, if you find any form fields, then fill them with the following information:
# Apply for the job using the following information:
# First Name: {user_data['first_name']}
# Last Name: {user_data['last_name']}
# Email: {user_data['email']}
# Phone: {user_data['phone']}
# Resume: {user_data['resume_path']}


# Ensure that all required fields are filled out correctly. If there are any additional fields that need to be filled, use the information provided in the resume or ask for clarification if necessary.
# You are a profession job applicant, so make sure to fill out the application form accurately and professionally. If there are any specific instructions on the job application page, follow them carefully.
# """

# # Initialize the LLM
# # GPT-4 models are recommended for best performance. [1]
# llm = ChatGoogle(model='gemini-2.5-pro')


# # Create the Agent
# agent = Agent(
#     task=task,
#     llm=llm,
# )

# # Run the agent
# async def main():
#     result = await agent.run()
#     print(result)

# if __name__ == "__main__":
#      asyncio.run(main())




import asyncio
import logging
import os
import sys
from pathlib import Path

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from dotenv import load_dotenv
load_dotenv()

from browser_use import ActionResult, Agent, Controller
from browser_use.browser import BrowserProfile, BrowserSession
from browser_use.llm import ChatGoogle

logger = logging.getLogger(__name__)

controller = Controller()

# NOTE: Path to your CV file
CV = Path.cwd() / 'cv_04_24.pdf'
if not CV.exists():
    raise FileNotFoundError(f"CV not found at {CV}")

# User data
user_data = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "phone": "123-456-7890",
    "resume_path": str(CV),
}

job_url = "https://job-boards.greenhouse.io/doordashusa/jobs/7118562"

# ----------------------------
# 📌 Upload Action
# ----------------------------
@controller.action("Upload resume to a form field")
async def upload_resume(index: int, browser_session: BrowserSession):
    """Upload the CV file to the file input element at given index."""
    file_upload_dom_el = await browser_session.find_file_upload_element_by_index(index)

    if file_upload_dom_el is None:
        logger.info(f"No file upload element found at index {index}")
        return ActionResult(error=f"No file upload element found at index {index}")

    file_upload_el = await browser_session.get_locate_element(file_upload_dom_el)

    if file_upload_el is None:
        return ActionResult(error=f"No file upload element found at index {index}")

    try:
        await file_upload_el.set_input_files(user_data["resume_path"])
        msg = f'Successfully uploaded file "{user_data["resume_path"]}" to index {index}'
        logger.info(msg)
        return ActionResult(extracted_content=msg)
    except Exception as e:
        return ActionResult(error=f"Failed to upload file to index {index}: {str(e)}")


# ----------------------------
# 📌 Task for the Agent
# ----------------------------
task = f""" 
Navigate to: {job_url}
Find form fields for first name, last name, email, phone, and resume.
Fill them with the following:
- First Name: {user_data['first_name']}
- Last Name: {user_data['last_name']}
- Email: {user_data['email']}
- Phone: {user_data['phone']}

If a file upload input is present, use `upload_resume` to upload the resume from: {user_data['resume_path']}

Ensure all required fields are filled. Submit the form if possible.
"""

# ----------------------------
# 📌 Initialize LLM + Browser
# ----------------------------
llm = ChatGoogle(model="gemini-2.5-pro")

browser_session = BrowserSession(
    browser_profile=BrowserProfile(
        executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",  # adjust for Windows/Linux
        disable_security=True,
        user_data_dir="~/.config/browseruse/profiles/default",
    )
)

agent = Agent(
    task=task,
    llm=llm,
    controller=controller,
    browser_session=browser_session,
)


async def main():
    result = await agent.run()
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
