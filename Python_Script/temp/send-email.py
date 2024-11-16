import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Email configuration
smtp_server = 'smtp.gmail.com'
smtp_port = 587
sender_email = 'lightstar.it.golden@gmail.com'  # Replace with your email
password = 'jrua hkns ovgu mzau'             # Replace with your password

# Email content
subject = 'Your Subject Here'
body = 'This is the body of the email.'

# Function to send an email
def send_email(receiver_email):
    try:
        # Create a MIME object
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        # Establish a secure session with Gmail's outgoing SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        print("conntected Server")
        server.starttls()
        server.login(sender_email, password)

        # Send the email
        text = msg.as_string()
        server.sendmail(sender_email, receiver_email, text)
        server.quit()

        print(f"Email sent successfully to {receiver_email}")

    except Exception as e:
        print(f"Failed to send email to {receiver_email}: {e}")

# List of recipients
recipients = ['bluepen0613.it@gmail.com', 'lightstar.it@outlook.com']  # Add your list of recipients

# Send emails
for recipient in recipients:
    send_email(recipient)
