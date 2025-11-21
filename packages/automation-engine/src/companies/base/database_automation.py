#!/usr/bin/env python3
"""
Database Automation Base Class
Unified data access layer that works with both server and desktop execution modes
Handles database queries, proxy configuration, and execution mode detection
"""

import os
import json
import asyncio
import asyncpg
from typing import Optional, Dict, Any, List
from pathlib import Path
import sys

# Add base automation to path
sys.path.append(str(Path(__file__).parent))

from base_automation import BaseJobAutomation
from user_profile import UserProfile, JobData, AutomationConfig
from result_handler import ApplicationResult, ResultProcessor


class DatabaseAutomation(BaseJobAutomation):
    """
    Enhanced automation base class that supports database-driven execution
    Works seamlessly in both server and desktop modes
    """
    
    def __init__(self, company_name: str, config: Optional[AutomationConfig] = None):
        super().__init__(company_name)
        self.config = config or AutomationConfig()
        
        # Execution mode detection
        self.execution_mode = os.getenv('EXECUTION_MODE', 'desktop')  # server | desktop
        self.data_source = os.getenv('DATA_SOURCE', 'database')  # database | file
        
        # Database connection
        self.db_connection: Optional[asyncpg.Connection] = None
        self.database_url = os.getenv('DATABASE_URL')
        
        # Proxy configuration for server mode
        self.proxy_config: Optional[Dict[str, Any]] = None
        
        # Application context
        self.application_id: Optional[str] = None
        self.user_id: Optional[str] = None
        self.job_id: Optional[str] = None
        
        print(f"🔧 DatabaseAutomation initialized:")
        print(f"   📍 Execution Mode: {self.execution_mode}")
        print(f"   💾 Data Source: {self.data_source}")
        print(f"   🏢 Company: {company_name}")
    
    async def initialize_database(self) -> bool:
        """Initialize database connection if using database data source"""
        if self.data_source != 'database' or not self.database_url:
            return False
            
        try:
            self.db_connection = await asyncpg.connect(self.database_url)
            print("✅ Database connection established")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    async def close_database(self):
        """Close database connection"""
        if self.db_connection:
            await self.db_connection.close()
            print("🔌 Database connection closed")
    
    async def get_user_profile_from_database(self, user_id: str) -> Optional[UserProfile]:
        """Fetch user profile from database"""
        if not self.db_connection:
            return None
            
        try:
            # Query user profile with all automation-relevant fields
            query = """
                SELECT 
                    up.first_name, up.last_name, up.phone, up.location,
                    up.current_title, up.years_of_experience, up.skills,
                    up.linkedin, up.work_authorization, up.cover_letter_template,
                    up.automation_preferences,
                    u.email
                FROM user_profiles up
                JOIN users u ON u.id = up.user_id
                WHERE up.user_id = $1
            """
            
            row = await self.db_connection.fetchrow(query, user_id)
            if not row:
                print(f"❌ No user profile found for user_id: {user_id}")
                return None
            
            # Get active resume
            resume_query = """
                SELECT pdf_url, docx_url, file_size 
                FROM resumes 
                WHERE user_id = $1 AND is_default = true
                LIMIT 1
            """
            resume_row = await self.db_connection.fetchrow(resume_query, user_id)
            
            # Build user profile
            user_profile = UserProfile(
                first_name=row['first_name'] or '',
                last_name=row['last_name'] or '',
                email=row['email'] or '',
                phone=row['phone'] or '',
                resume_url=resume_row['pdf_url'] if resume_row else None,
                resume_local_path=None,  # Will be downloaded if needed
                current_title=row['current_title'],
                years_experience=row['years_of_experience'],
                skills=row['skills'] or [],
                current_location=row['location'],
                linkedin_url=row['linkedin'],
                work_authorization=row['work_authorization'],
                cover_letter=row['cover_letter_template'],
                custom_fields=row['automation_preferences'] or {}
            )
            
            print(f"✅ User profile loaded: {user_profile.get_full_name()}")
            return user_profile
            
        except Exception as e:
            print(f"❌ Failed to fetch user profile: {e}")
            return None
    
    async def get_job_data_from_database(self, job_id: str) -> Optional[JobData]:
        """Fetch job data from database"""
        if not self.db_connection:
            return None
            
        try:
            query = """
                SELECT 
                    jp.id, jp.title, jp.description, jp.requirements,
                    jp.location, jp.apply_url, jp.salary_min, jp.salary_max,
                    jp.currency, jp.skills, jp.experience_years,
                    c.name as company_name
                FROM job_postings jp
                JOIN companies c ON c.id = jp.company_id
                WHERE jp.id = $1
            """
            
            row = await self.db_connection.fetchrow(query, job_id)
            if not row:
                print(f"❌ No job found for job_id: {job_id}")
                return None
            
            job_data = JobData(
                job_id=row['id'],
                title=row['title'],
                company=row['company_name'],
                apply_url=row['apply_url'] or '',
                location=row['location'],
                description=row['description'],
                requirements=row['requirements'],
                skills_required=row['skills'] or [],
                experience_required=row['experience_years'],
                salary_range=f"{row['salary_min']}-{row['salary_max']} {row['currency']}" if row['salary_min'] else None
            )
            
            print(f"✅ Job data loaded: {job_data.title} at {job_data.company}")
            return job_data
            
        except Exception as e:
            print(f"❌ Failed to fetch job data: {e}")
            return None
    
    def get_data_from_environment(self) -> tuple[Optional[UserProfile], Optional[JobData]]:
        """Get user and job data from environment (file-based mode)"""
        try:
            data_file = os.getenv('JOBSWIPE_DATA_FILE')
            if not data_file or not os.path.exists(data_file):
                print(f"❌ Data file not found: {data_file}")
                return None, None
            
            with open(data_file, 'r') as f:
                data = json.load(f)
            
            # Extract application context
            self.application_id = data.get('application_id')
            self.user_id = data.get('user_id')
            self.job_id = data.get('job_data', {}).get('job_id')
            
            # Parse user profile
            user_data = data.get('user_profile', {})
            user_profile = UserProfile(
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                email=user_data.get('email', ''),
                phone=user_data.get('phone', ''),
                resume_url=user_data.get('resume_url'),
                resume_local_path=user_data.get('resume_local_path'),
                current_title=user_data.get('current_title'),
                years_experience=user_data.get('years_experience'),
                skills=user_data.get('skills', []),
                current_location=user_data.get('current_location'),
                linkedin_url=user_data.get('linkedin_url'),
                work_authorization=user_data.get('work_authorization'),
                cover_letter=user_data.get('cover_letter'),
                custom_fields=user_data.get('custom_fields', {})
            )
            
            # Parse job data
            job_data_raw = data.get('job_data', {})
            job_data = JobData(
                job_id=job_data_raw.get('job_id', ''),
                title=job_data_raw.get('title', ''),
                company=job_data_raw.get('company', ''),
                apply_url=job_data_raw.get('apply_url', ''),
                location=job_data_raw.get('location'),
                description=job_data_raw.get('description')
            )
            
            print(f"✅ Data loaded from file: {user_profile.get_full_name()} -> {job_data.title}")
            return user_profile, job_data
            
        except Exception as e:
            print(f"❌ Failed to load data from environment: {e}")
            return None, None
    
    async def get_automation_data(self) -> tuple[Optional[UserProfile], Optional[JobData]]:
        """
        Get user profile and job data based on data source configuration
        Returns tuple of (user_profile, job_data)
        """
        if self.data_source == 'database':
            # Database mode - get IDs from environment and query database
            user_id = os.getenv('USER_ID')
            job_id = os.getenv('JOB_ID')
            application_id = os.getenv('APPLICATION_ID')
            
            if not user_id or not job_id:
                print("❌ Missing USER_ID or JOB_ID environment variables for database mode")
                return None, None
            
            self.user_id = user_id
            self.job_id = job_id
            self.application_id = application_id
            
            # Initialize database connection
            if not await self.initialize_database():
                print("❌ Failed to initialize database connection")
                return None, None
            
            # Fetch data from database
            user_profile = await self.get_user_profile_from_database(user_id)
            job_data = await self.get_job_data_from_database(job_id)
            
            return user_profile, job_data
        else:
            # File mode - existing behavior
            return self.get_data_from_environment()
    
    async def setup_proxy_for_server_mode(self) -> bool:
        """Configure proxy if running in server mode"""
        if self.execution_mode != 'server':
            return True  # No proxy needed for desktop mode
        
        try:
            # Get proxy configuration from environment or database
            proxy_config = os.getenv('PROXY_CONFIG')
            if proxy_config:
                self.proxy_config = json.loads(proxy_config)
                print(f"✅ Proxy configured: {self.proxy_config.get('host')}:{self.proxy_config.get('port')}")
                return True
            
            # If no proxy config provided but in server mode, fetch from database
            if self.db_connection:
                proxy_query = """
                    SELECT host, port, username, password, proxy_type
                    FROM automation_proxies 
                    WHERE is_active = true 
                    ORDER BY success_rate DESC, last_used_at ASC NULLS FIRST
                    LIMIT 1
                """
                proxy_row = await self.db_connection.fetchrow(proxy_query)
                
                if proxy_row:
                    self.proxy_config = {
                        'host': proxy_row['host'],
                        'port': proxy_row['port'],
                        'username': proxy_row['username'],
                        'password': proxy_row['password'],
                        'type': proxy_row['proxy_type']
                    }
                    
                    # Update last_used_at
                    await self.db_connection.execute(
                        "UPDATE automation_proxies SET last_used_at = NOW() WHERE host = $1 AND port = $2",
                        proxy_row['host'], proxy_row['port']
                    )
                    
                    print(f"✅ Database proxy configured: {proxy_row['host']}:{proxy_row['port']}")
                    return True
            
            print("⚠️ No proxy configuration found for server mode")
            return True  # Continue without proxy
            
        except Exception as e:
            print(f"❌ Failed to setup proxy: {e}")
            return False
    
    async def log_automation_step(self, step_name: str, action: str, success: bool, 
                                  error_message: Optional[str] = None, 
                                  execution_time: Optional[int] = None):
        """Log automation step to database if possible"""
        if not self.db_connection or not self.application_id:
            return
        
        try:
            # Find the queue entry for this application
            queue_query = """
                SELECT id FROM application_queue 
                WHERE application_id = $1 
                ORDER BY created_at DESC LIMIT 1
            """
            queue_row = await self.db_connection.fetchrow(queue_query, self.application_id)
            
            if queue_row:
                await self.db_connection.execute("""
                    INSERT INTO automation_logs 
                    (queue_id, level, message, details, step, action, error_type, execution_time)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                """, 
                queue_row['id'],
                'ERROR' if not success else 'INFO',
                f"Step {step_name}: {'Success' if success else 'Failed'}",
                json.dumps({
                    'step_name': step_name,
                    'action': action,
                    'success': success,
                    'error_message': error_message,
                    'execution_mode': self.execution_mode
                }),
                step_name,
                action,
                'automation_error' if error_message else None,
                execution_time
                )
        except Exception as e:
            print(f"⚠️ Failed to log automation step: {e}")
    
    async def apply_to_job(self, user_profile: UserProfile, job_data: JobData) -> ApplicationResult:
        """
        Enhanced apply_to_job method with database integration
        """
        try:
            # Setup proxy for server mode
            #await self.setup_proxy_for_server_mode() #TODO PROXYDISABLE
            
            # Log start of automation
            await self.log_automation_step(
                'initialization', 
                'Starting job application automation', 
                True
            )
            
            # Call the company-specific implementation
            result = await super().apply_to_job(user_profile, job_data)
            
            # Log final result
            await self.log_automation_step(
                'completion',
                f'Job application {"completed" if result.success else "failed"}',
                result.success,
                result.error_message,
                result.total_duration_ms
            )
            
            return result
            
        except Exception as e:
            error_msg = f"DatabaseAutomation error: {str(e)}"
            print(f"❌ {error_msg}")
            
            await self.log_automation_step(
                'error',
                'Critical automation error',
                False,
                error_msg
            )
            
            return ResultProcessor.create_failed_result(
                job_data.job_id,
                self.company_name,
                error_msg,
                "DATABASE_AUTOMATION_ERROR"
            )
        finally:
            # Cleanup database connection
            await self.close_database()
    
    def __del__(self):
        """Cleanup on destruction"""
        if hasattr(self, 'db_connection') and self.db_connection:
            try:
                # Close database connection if still open
                asyncio.create_task(self.close_database())
            except:
                pass


# Utility function for easy automation data loading
async def load_automation_data() -> tuple[Optional[UserProfile], Optional[JobData]]:
    """
    Convenience function to load automation data in any mode
    """
    temp_automation = DatabaseAutomation("temp")
    user_profile, job_data = await temp_automation.get_automation_data()
    await temp_automation.close_database()
    return user_profile, job_data


if __name__ == "__main__":
    # Test data loading
    async def test():
        user_profile, job_data = await load_automation_data()
        if user_profile and job_data:
            print(f"✅ Test successful: {user_profile.get_full_name()} -> {job_data.title}")
        else:
            print("❌ Test failed: Could not load automation data")
    
    asyncio.run(test())