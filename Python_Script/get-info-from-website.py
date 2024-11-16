import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse

def find_contact_info(base_url, visited=None, depth=0, collected_info=None):
    max_depth = 7  # Maximum depth for recursion

    if visited is None:
        visited = set()

    # Initialize collected_info if it's the first call
    if collected_info is None:
        collected_info = {'emails': set(), 'phone_numbers': set(), 'social_links': set()}

    # Check if the URL has been visited or the maximum depth has been reached
    if base_url in visited or depth >= max_depth:
        return {key: list(value) for key, value in collected_info.items()}  # Convert sets to lists

    visited.add(base_url)

    try:
        response = requests.get(base_url, timeout=60)  # Set timeout to 60 seconds
        response.raise_for_status()
    except (requests.RequestException, requests.Timeout):
        return {key: list(value) for key, value in collected_info.items()}  # Convert sets to lists

    soup = BeautifulSoup(response.text, 'html.parser')

    email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    phone_pattern = re.compile(r'\+?\d{1,3}[\s-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}\b')
    social_media_domains = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'github.com']

    # Update sets with found data
    collected_info['emails'].update(re.findall(email_pattern, response.text))
    collected_info['phone_numbers'].update(re.findall(phone_pattern, response.text))

    for link in soup.find_all('a', href=True):
        href = link['href']
        full_url = urljoin(base_url, href)

        if any(domain in full_url for domain in social_media_domains):
            collected_info['social_links'].add(full_url)
        elif urlparse(full_url).netloc == urlparse(base_url).netloc:
            # Recursive call with updated collected_info
            find_contact_info(full_url, visited, depth + 1, collected_info)

    return {key: list(value) for key, value in collected_info.items()}  # Convert sets to lists

# Example usage
urls = [
    "http://www.donaha.sk",
    "http://samanat.blogspot.com",
    "https://ezcater.com",
    "http://sanarmal.blogspot.in/",
    "http://www.pavlix.net",
    "https://equimper.com",
    "http://stackoverflow.com/users/16418/rony-l",
    "http://vlad.ai",
    "http://codecalamity.com",
    "http://christophercotton.com/",
    "http://whatdidilearn.info",
    "http://deja.consulting/",
    "https://maisuradze.io/"
]

for url in urls:
    result = find_contact_info(url)
    print(f"Results for {url}: {result}")
