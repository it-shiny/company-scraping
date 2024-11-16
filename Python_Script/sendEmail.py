import os
import requests
from msal import ConfidentialClientApplication
from dotenv import load_dotenv

load_dotenv()
# Your application's configuration
client_id = os.getenv('client_id')
tenant_id = os.getenv('tenant_id')
client_secret = os.getenv('client_secret')
authority = f"https://login.microsoftonline.com/{tenant_id}"
scope = ["https://graph.microsoft.com/.default"]


# Initialize the MSAL confidential client
app = ConfidentialClientApplication(client_id, authority=authority, client_credential=client_secret)

# Global variable to store access token
global_access_token = None

def get_access_token():
    global global_access_token
    # Acquire token for Graph API
    token_response = app.acquire_token_for_client(scopes=scope)
    global_access_token = token_response.get("access_token")
    if not global_access_token:
        raise Exception("Failed to obtain access token")
    return global_access_token

# Function to send email using Graph API
def send_email(user_id, subject, body, client_email):
    global global_access_token
    if not global_access_token:
        global_access_token = get_access_token()
    url = f"https://graph.microsoft.com/v1.0/users/{user_id}/sendMail"
    headers = {
        'Authorization': f'Bearer {global_access_token}',
        'Content-Type': 'application/json'
    }
    json_data = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "Text",
                "content": body
            },
            "toRecipients": [
                {"emailAddress": {"address": client_email}}
            ]
        }
    }
    response = requests.post(url, headers=headers, json=json_data)
    if response.status_code == 202:
        print(f"Email sent successfully.  {client_email}")
    elif  response.status_code == 401:
        global_access_token = get_access_token()
        send_email(user_id, subject, body, client_email)
    else:
        print("Failed to send email. Status code:", response.status_code, "Response:", response.json())
        raise ConnectionRefusedError

