import os
from openai import OpenAI

client = OpenAI(
    # This is the default and can be omitted
    # OPENAI_API_KEY=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
    # api_key=os.environ.get("OPENAI_API_KEY"),
    api_key="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",
)


def generate_greeting(client, ceo_name, company_name, company_description):
    # Construct the prompt
    prompt = (f"Create a professional greeting message addressed to {ceo_name}, CEO of {company_name}. "
              f"Include a note of admiration for the company's achievements. Mention that I have reviewed "
              f"the company's work, especially {company_description}, and found it amazing.")

    # Create a chat completion
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "user", "content": prompt}
        ],
        model="gpt-3.5-turbo",
    )

    # Extract and print the assistant's response
    response_message = chat_completion.choices[0].message
    return response_message.content

# Example usage
ceo_name = "John Doe"
company_name = "starglow ventures"
company_description = """STARGLOW VENTURES
                        WE ARE WORKING FOR —

                        Web Development
                        We provide full-stack development services for a variety of platforms and deliver a product fit for your purpose.

                        Mobile Development
                        A React Native development company that creates iOS and Android apps for startups and businesses. Give us an idea — we'll take care of the rest.

                        AI Development
                        StarGlow Ventures caters to the prominent AI and ML to deliver high-end solutions. Our company helps your business enhance and provide Image & Video, Text To Speech, Business Intelligence, Data Forecasting, Natural Language Processing, and Data Analytics.
                        """
greeting_message = generate_greeting(client, ceo_name, company_name, company_description)
print(greeting_message)