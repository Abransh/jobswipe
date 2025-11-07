"""
JobSwipe Automation Engine - Unified Job Application Automation
Single package for both server and desktop automation execution
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read requirements
requirements_path = Path(__file__).parent / "requirements.txt"
requirements = []
if requirements_path.exists():
    with open(requirements_path) as f:
        requirements = [line.strip() for line in f if line.strip() and not line.startswith('#')]

# Read README
readme_path = Path(__file__).parent / "README.md"
long_description = ""
if readme_path.exists():
    with open(readme_path, encoding='utf-8') as f:
        long_description = f.read()

setup(
    name='jobswipe-automation-engine',
    version='1.0.0',
    description='Unified automation engine for JobSwipe job applications',
    long_description=long_description,
    long_description_content_type='text/markdown',
    author='JobSwipe Team',
    author_email='dev@jobswipe.com',
    url='https://github.com/jobswipe/automation-engine',

    # Package configuration
    packages=find_packages('src'),
    package_dir={'': 'src'},
    include_package_data=True,

    # Python version requirement
    python_requires='>=3.10',

    # Dependencies
    install_requires=requirements,

    # Optional dependencies
    extras_require={
        'dev': [
            'pytest>=7.4.0',
            'pytest-asyncio>=0.21.0',
            'black>=23.7.0',
            'mypy>=1.4.0',
            'ruff>=0.0.280',
        ],
        'server': [
            'aiohttp>=3.9.0',  # For proxy rotation
        ],
    },

    # Entry points for CLI
    entry_points={
        'console_scripts': [
            'jobswipe-automation=core.cli:main',
        ],
    },

    # Classifiers
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
    ],

    # Project URLs
    project_urls={
        'Bug Reports': 'https://github.com/jobswipe/automation-engine/issues',
        'Source': 'https://github.com/jobswipe/automation-engine',
        'Documentation': 'https://docs.jobswipe.com/automation-engine',
    },
)
