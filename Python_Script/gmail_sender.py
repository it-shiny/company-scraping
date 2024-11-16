import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# SMTP server configuration
smtp_server = "smtp.gmail.com"
smtp_port = 587
username = "fullstack.codemaster@gmail.com"
password = "zjyk vmuk codg ekho"

# Email content
sender_email = "fullstack.codemaster@gmail.com"
receiver_email = "bluepen0613.it@gmail.com"
subject = "Your Subject Here"
body = """Hi Douglas,

I'm a lead developer from StarGlow Ventures, and I was highly impressed by High Tech Genesis, the company you founded. With over 30 years of experience, High Tech Genesis has established itself as a global leader in CAD/CAM technology for prosthetics and orthotics. Your track record of boosting productivity by up to 600% through digital solutions is truly remarkable.

We're eager to utilize our expertise in web, app, and AI development to contribute to your ongoing or upcoming projects. Our team of 7 skilled professionals has a proven track record of accelerating project timelines by 20% and delivering innovative solutions tailored for clients in similar industries.

Whether we take on the development of the entire project independently, align with specific tasks assigned by you, or integrate seamlessly into your team, StarGlow Ventures is fully adaptable to meet your strategic objectives and goals.

I am confident that our collaboration can bring outstanding results to your projects. I look forward to exploring how we can work together to help grow your business and provide better solutions for patients.

Warm regards,

John Chao
Lead Developer
Phone: +1 (604) 243-7330, +1 (778) 650-9556, +1 (604) 998-8820"""

# Setup the MIME
message = MIMEMultipart()
message['From'] = sender_email
message['To'] = receiver_email
message['Subject'] = subject
message.attach(MIMEText(body, 'plain'))

# Send the email
session = smtplib.SMTP(smtp_server, smtp_port)
session.starttls()  # Enable security
session.login(username, password)  # Login with credentials
text = message.as_string()
session.sendmail(sender_email, receiver_email, text)
session.quit()

print("Mail Sent Successfully")