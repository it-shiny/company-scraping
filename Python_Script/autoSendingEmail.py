import csv
import requests
import time
from openai import OpenAI
from bs4 import BeautifulSoup
from datetime import datetime
import os
import sendEmail
from dotenv import load_dotenv
import dns.resolver

load_dotenv()

csv_file_path = './software-canada.csv'
# csv_file_path = './test.csv'
fieldnames = ['Email', 'Company Name', 'Name', 'Sent Date', 'Status']
csv_output_path = './sent_email_list.csv'

output_file = open(csv_output_path, 'a', newline='')

csv_writer = csv.DictWriter(output_file, fieldnames=fieldnames)

client = OpenAI(
    api_key=os.getenv('chatgpt_api_key'),
)

def generate_email(client, ceo_name, company_name, company_url=""):
    # Scrape the company website homepage

    data_fetching_succeed = True
    try:
        response = requests.get(company_url, timeout=100)
        soup = BeautifulSoup(response.text, 'html.parser')
        company_content = soup.get_text(separator=" ", strip=True)[:4000]
    except Exception as e:
        # print(e)
        data_fetching_succeed = False

    # print(data_fetching_succeed)

    typical_email = f"""Dear {ceo_name},

I am a lead developer from StarGlow Ventures, and we are excited to offer our expertise in web and mobile app development to bring transformative solutions to {company_name}'s innovative projects.

We're eager to utilize our expertise in your ongoing or upcoming project.

Our team, comprising 7 skilled professionals, specializes in web, app, and AI development. 

We have a track record of accelerating project timelines by 20%, delivering innovative solutions tailored for clients similar to {company_name}. 

For a comprehensive look at our portfolio and the services we offer, I encourage you to visit our website at https://starglowventures.com/.

Whether we take on the development of the entire project independently, align with specific tasks assigned by you, or integrate seamlessly into your team, StarGlow Ventures is fully adaptable to meet your strategic objectives and goals.

Looking forward to exploring how our collaboration can bring outstanding results to your projects.

Warm regards,

James Kai
Lead Developer
StarGlow Ventures
https://starglowventures.com/
admin@starglowventures.com, cto@starglowventures.com, contact@starglowventures.com
+1 (604) 243-7330,  +1 (778) 650-9556, +1 (604) 998-8820"""

    # Create a chat completion
    try:
        if data_fetching_succeed:
            prompt = (f"CEO's Name: {ceo_name} "
                f"CEO's Company name: {company_name}"
                f"This is the homepage of the company website: {company_content}"
                f"""Email Template:

                Dear [CEO's Name],

                I'm a lead developer from StarGlow Ventures, and I was highly impressed by [specific detail about the CEO's company]. 

                We're eager to utilize our expertise in your ongoing or upcoming project.

                Our team, comprising 7 skilled professionals, specializes in web, app, and AI development. 

                We have a track record of accelerating project timelines by 20%, delivering innovative solutions tailored for clients similar to [CEO's company name]. 

                For a comprehensive look at our portfolio and the services we offer, I encourage you to visit our website at https://starglowventures.com/.

                Whether we take on the development of the entire project independently, align with specific tasks assigned by you, or integrate seamlessly into your team, StarGlow Ventures is fully adaptable to meet your strategic objectives and goals.

                Looking forward to exploring how our collaboration can bring outstanding results to your projects.

                Warm regards,

                James Kai
                Lead Developer
                StarGlow Ventures
                https://starglowventures.com/
                admin@starglowventures.com, cto@starglowventures.com, contact@starglowventures.com 
                +1 (604) 243-7330,  +1 (778) 650-9556, +1 (604) 998-8820
                Write an email using this template.
                1. complete CEO's name and company
                2. complete sentence of impression from CEO's company with data from company website
                3. without above don't modify anything from the template.""")
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "user", "content": prompt}
                ],
                model="gpt-3.5-turbo",
            )
            # Extract and print the assistant's response
            response_message = chat_completion.choices[0].message
            return response_message.content
        else:
            return typical_email
    except Exception as e:
        print(e)
        return typical_email


def check_mx_records(domain):
    try:
        answers = dns.resolver.resolve(domain, 'MX')
        return bool(answers)
    except Exception as e:
        return False

with open(csv_file_path, 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    # Iterate through each row in the CSV file
    for index, row in enumerate(csv_reader):
        if index < 3002:
            continue
        if not check_mx_records(row['email'].split('@')[1]):
            csv_writer.writerow({
                    'Email': row['email'],
                    'Company Name': row['Company Name'],
                    'Name': row['First Name'] + ' ' + row['Last Name'],
                    'Sent Date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'Status': 'Domain invalid'
                })
            continue
        while True:
            # Print or process each row
            start_time = time.time()
            email_message = generate_email(client, row["First Name"], row["Company Name"], 'https://' + row["Website"])
            #send email code

            user_id = "cto@starglowventures.com"
            subject = "Collaboration Opportunities with StarGlow Ventures"
            body = email_message
            try:
                sendEmail.send_email(user_id, subject, body, row['email'])
                csv_writer.writerow({
                    'Email': row['email'],
                    'Company Name': row['Company Name'],
                    'Name': row['First Name'] + ' ' + row['Last Name'],
                    'Sent Date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'Status': 'Success'
                })
                elapsed_time = time.time() - start_time
                if elapsed_time < 20:
                    time.sleep(20-elapsed_time)
                break
            except Exception as e:
                csv_writer.writerow({
                    'Email': row['email'],
                    'Company Name': row['Company Name'],
                    'Name': row['First Name'] + ' ' + row['Last Name'],
                    'Sent Date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'Status': 'Failed to sent'
                })
                time.sleep(60)
            # Break out of the loop after reading 100 rows
        if index == 4000:
            break
        
