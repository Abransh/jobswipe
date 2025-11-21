#!/usr/bin/env python3
"""
Debug Configuration for Automation Engine
Use this to enable verbose logging and diagnostics
"""

import logging
import sys

def setup_debug_logging():
    """
    Setup comprehensive debug logging for troubleshooting automation issues
    """

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)

    # Console handler with detailed formatting
    console_handler = logging.StreamHandler(sys.stderr)
    console_handler.setLevel(logging.DEBUG)

    # Detailed formatter
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)-30s | %(funcName)-20s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # File handler for persistent logs
    file_handler = logging.FileHandler('automation_debug.log', mode='w')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    # Set specific logger levels
    logging.getLogger('jobswipe').setLevel(logging.DEBUG)
    logging.getLogger('browser_use').setLevel(logging.DEBUG)
    logging.getLogger('playwright').setLevel(logging.INFO)  # Playwright is too verbose

    print("🐛 Debug logging enabled", file=sys.stderr)
    print(f"   - Console: DEBUG level", file=sys.stderr)
    print(f"   - File: automation_debug.log", file=sys.stderr)

def log_execution_context(context):
    """Log detailed execution context for debugging"""
    logger = logging.getLogger('jobswipe.debug')

    logger.debug("=" * 80)
    logger.debug("EXECUTION CONTEXT DETAILS")
    logger.debug("=" * 80)
    logger.debug(f"Mode: {context.mode.value}")
    logger.debug(f"LLM: {type(context.llm).__name__ if context.llm else 'None'}")
    logger.debug(f"Browser Profile: {context.browser_profile is not None}")

    if context.browser_profile:
        logger.debug(f"  - Headless: {context.browser_profile.headless}")
        logger.debug(f"  - Wait between actions: {context.browser_profile.wait_between_actions}s")
        logger.debug(f"  - Use vision: {context.browser_profile.use_vision}")
        logger.debug(f"  - Keep alive: {context.browser_profile.keep_alive}")

    if context.proxy_config:
        logger.debug(f"Proxy: {context.proxy_config.host}:{context.proxy_config.port}")
    else:
        logger.debug("Proxy: Not configured")

    logger.debug("=" * 80)

def log_agent_creation(agent, task_preview_length=500):
    """Log agent creation details"""
    logger = logging.getLogger('jobswipe.debug')

    logger.debug("=" * 80)
    logger.debug("AGENT CREATION DETAILS")
    logger.debug("=" * 80)
    logger.debug(f"Agent type: {type(agent).__name__}")
    logger.debug(f"Task preview (first {task_preview_length} chars):")
    logger.debug("-" * 80)

    task = getattr(agent, 'task', 'N/A')
    if isinstance(task, str):
        logger.debug(task[:task_preview_length])
        if len(task) > task_preview_length:
            logger.debug(f"... (truncated, total length: {len(task)} chars)")
    else:
        logger.debug(str(task))

    logger.debug("-" * 80)
    logger.debug(f"LLM model: {getattr(agent, 'llm', 'N/A')}")
    logger.debug(f"Controller: {getattr(agent, 'controller', 'N/A') is not None}")
    logger.debug(f"Browser session: {getattr(agent, 'browser_session', 'N/A') is not None}")
    logger.debug("=" * 80)

# Usage in automation code:
# from debug_config import setup_debug_logging, log_execution_context, log_agent_creation
# setup_debug_logging()
# log_execution_context(context)
# log_agent_creation(agent)
