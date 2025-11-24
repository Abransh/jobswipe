"""
SIMPLIFIED Job Automation - Just the essentials
"""
import os
import logging
from pathlib import Path
from typing import Dict, Any

from browser_use import Agent, BrowserSession, BrowserProfile
from browser_use.llm import ChatGoogle
from browser_use.tools.service import Controller
from browser_use.browser.events import UploadFileEvent
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class SimpleAutomation:
    """
    Simplified job automation base class
    No unnecessary abstractions, just browser-use + basic logic
    """
    
    def __init__(self, company_name: str):
        self.company_name = company_name
        tools = Tools()
        self._setup_actions()
    
    def _setup_actions(self):
        """Setup resume upload action"""
        
        class UploadParams(BaseModel):
            index: int = Field(..., description="Element index")
            file_path: str = Field(..., description="File path")
        
        @tools.action('Upload file to interactive element with file path')
        async def upload_resume(params: UploadParams, browser_session: BrowserSession):
            """Upload resume file"""
            try:
                if not Path(params.file_path).exists():
                    return {"error": f"File not found: {params.file_path}"}
                
                element = await browser_session.get_dom_element_by_index(params.index)
                if not element:
                    return {"error": f"No element at index {params.index}"}
                
                event = browser_session.event_bus.dispatch(
                    UploadFileEvent(node=element, file_path=params.file_path)
                )
                await event
                
                return {"success": True, "file": params.file_path}
            except Exception as e:
                return {"error": str(e)}
    
    def _get_task(self, user: Dict, job: Dict) -> str:
        """Generate task description - override in subclasses"""
        return f"""
        Apply to {job['title']} at {job['company']}
        URL: {job['apply_url']}
        
        Fill form with:
        - Name: {user['first_name']} {user['last_name']}
        - Email: {user['email']}
        - Phone: {user['phone']}
        - Resume: {user.get('resume_path', 'N/A')}
        
        Submit and look for confirmation.
        """
    
    async def apply(self, user: Dict, job: Dict) -> Dict[str, Any]:
        """
        Run the automation
        Returns: {'success': bool, 'message': str, 'confirmation': str}
        """
        try:
            # Setup
            logger.info(f"Starting {self.company_name} automation")
            logger.info(f"Job: {job['title']} at {job['company']}")
            
            # Create LLM
            llm = ChatGoogle(model='gemini-2.5-pro')
            
            # Create browser profile (always headful)
            profile = BrowserProfile(
                headless=False,
                keep_alive=False,
                wait_between_actions=0.5
            )
            
            # Create browser session
            browser_session = BrowserSession(browser_profile=profile)
            await browser_session.start()
            
            try:
                # Generate task
                task = self._get_task(user, job)
                
                # Create and run agent
                agent = Agent(
                    task=task,
                    llm=llm,
                    controller=self.controller,
                    browser_session=browser_session
                )
                
                logger.info("Running agent...")
                await agent.run()
                logger.info("Agent finished")
                
                # Check if successful
                page = await browser_session.get_current_page()
                page_text = await page.inner_text('body')
                page_text_lower = page_text.lower()
                
                # Simple success detection
                success_phrases = ['thank you', 'success', 'submitted', 'confirmation']
                is_success = any(phrase in page_text_lower for phrase in success_phrases)
                
                if is_success:
                    return {
                        'success': True,
                        'message': 'Application submitted successfully',
                        'confirmation': page_text[:200]  # First 200 chars
                    }
                else:
                    return {
                        'success': False,
                        'message': 'Could not confirm submission',
                        'page_text': page_text[:500]
                    }
            
            finally:
                await browser_session.stop()
        
        except Exception as e:
            logger.error(f"Automation failed: {e}", exc_info=True)
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }