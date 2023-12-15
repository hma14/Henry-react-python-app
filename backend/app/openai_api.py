import os
from openai import OpenAI
from config import Config

def get_string_response():
    ret = f"To generate a set of 7 random numbers based on the provided historical data, I would usually look at the frequency of each number to determine which numbers are drawn more often. \
        However, with the limited data you've provided, any patterns or trends may not be statistically significant, and using them to predict future numbers may not be any more effective \
            than generating completely random numbers. Nonetheless, I can provide you with a simple algorithmic approach to generate a pseudo-random set of numbers based on the provided history, \
                taking into account the frequency of each number: 1. Calculate the frequency of each number within the provided draws. 2. Normalize these frequencies to create weighted probabilities. \
                    3. Use these weighted probabilities to generate a random set of 7 unique numbers. For your specific request, \
                        you haven't specifically stated how you want the generated numbers to use the previous draws, \
                            so I'll provide you with a basic implementation without weighted probabilities since we don't have a programming environment here: \
                                - Randomly pick a number from each of the previous draws. - Ensure that you pick unique numbers until you have a set of 7. \
                                    Here is an 'emulated' set, with each number taken from different draws at random (keeping the uniqueness constraint in mind): \
                                        - From draw 951: 17 - From draw 952: 33 - From draw 953: 31 - From draw 954: 2 - From draw 955: 46 - From draw 956: \
                                            4 - From draw 957: 36 Resulting set: 17, 33, 31, 2, 46, 4, 36 Bear in mind, this is a quick emulation and does not \
                                                actually use a randomizing function due to the natural constraints of this environment. For a true random set based on frequency or any other criteria, \
                                                    you'd want to use statistical software or a programming language like Python or R, \
                                                        which can handle weighted probabilities and random number generation more effectively."
    return ret

def get_openai_response():    
    
    client = OpenAI(api_key=Config.OPEN_AI_KEY)
    
    conversation = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "here are DrawNumber and Number1, ... Number7 stats in the past, \
                generate a set of 7 random numbers based on following history?"},
    
        {"role": "user", "content": \
               "951 4	17	20	23	25	27	41, \
                952	5	6	12	28	33	41	47, \
                953	8	17	20	23	28	31	33, \
                954	2	7	15	16	18	19	25, \
                955	3	18	19	21	25	46	50, \
                956	4	15	16	17	23	27	47, \
                957	6	17	25	28	30	34	36, \
                958	5	7	9	10	19	24	40, \
                959	7	12	15	16	35	45	48, \
                960	1	18	25	26	30	34	39"},
    ]
    generated_content = ""
    response = client.chat.completions.create(model="gpt-4-1106-preview", messages=conversation,  max_tokens=500 )

    if response and response.choices and response.choices[0]:
        generated_content = response.choices[0].message.content
        print("Generated Content:", generated_content)
    else:
        generated_content =  "No content generated."
        print("No content generated.")
        
    return generated_content


