import requests

# Endpoint URL
url = 'https://api-prd.reachstream.com/api/Search/v1/records/single/fetch'

# Headers
headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE3MDI5NTE5NTQsImlzcyI6IkJhZWxkdW5nIiwidXNlclJvbGUiOiJjdXN0b21lciIsImV4cCI6MTcwMjk1OTE4NCwidXNlcklkIjoiNjc3NjUwIiwiaWF0IjoxNzAyOTUxOTg0fQ.v8XSAfpRqTVToLCNnTCyqkoUDVQeQMUfDyA-96y-1IE',
    'Content-Type': 'application/json',
    'Origin': 'https://app.reachstream.com',
    'Referer': 'https://app.reachstream.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Payload
payload = {
    'id': 854724,
    'action': 'view'
}

# Send POST request
response = requests.post(url, json=payload, headers=headers)

# Check response
if response.ok:
    print("Response received:")
    print(response.json())
else:
    print("Error:", response.status_code)
